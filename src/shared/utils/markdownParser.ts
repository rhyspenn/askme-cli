import React from "react";
import { Text } from "ink";

// Markdown parsing element types
export interface MarkdownElement {
  type: "text" | "bold" | "italic" | "code" | "header" | "list";
  content: string;
  level?: number; // for header level
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
}

/**
 * Lightweight Markdown parser
 * Supports: bold, italic, code, headers, lists
 */
export class SimpleMarkdownParser {
  /**
   * Parse markdown text into structured elements
   */
  static parse(markdown: string): MarkdownElement[] {
    const lines = markdown.split("\n");
    const elements: MarkdownElement[] = [];

    for (const line of lines) {
      if (line.trim() === "") {
        // Skip empty lines
        continue;
      }

      // Parse headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        elements.push({
          type: "header",
          content: this.parseInlineMarkdown(content),
          level,
          color: this.getHeaderColor(level),
          bold: true,
        });
        continue;
      }

      // Parse lists
      const listMatch = line.match(/^[\s]*[-\*\+]\s+(.+)$/);
      if (listMatch) {
        const content = listMatch[1];
        elements.push({
          type: "list",
          content: `• ${this.parseInlineMarkdown(content)}`,
          color: "cyan",
        });
        continue;
      }

      // Normal text (including inline formatting)
      const parsedContent = this.parseInlineMarkdown(line);
      if (parsedContent.trim()) {
        elements.push({
          type: "text",
          content: parsedContent,
        });
      }
    }

    return elements;
  }

  /**
   * Parse inline markdown formats (bold, italic, code)
   */
  private static parseInlineMarkdown(text: string): string {
    return (
      text
        // Code blocks (process first to avoid conflicts with other formats)
        .replace(/`([^`]+)`/g, "`$1`") // Keep code markers for later rendering
        // Bold
        .replace(/\*\*([^*]+)\*\*/g, "**$1**") // Keep format markers
        // Italic
        .replace(/\*([^*]+)\*/g, "*$1*")
    ); // Keep format markers
  }

  /**
   * Get header color
   */
  private static getHeaderColor(level: number): string {
    // Use cyan color for all headers to match "Ask User Confirmation"
    return "cyan";
  }

  /**
   * Render single markdown element as Ink component
   */
  static renderElement(
    element: MarkdownElement,
    key: number
  ): React.ReactElement {
    const baseProps = {
      key,
      color: element.color,
      backgroundColor: element.backgroundColor,
      bold: element.bold,
      italic: element.italic,
    };

    switch (element.type) {
      case "header":
        return React.createElement(
          Text,
          {
            ...baseProps,
            bold: true,
          },
          this.renderInlineElements(element.content)
        );

      case "list":
        return React.createElement(
          Text,
          {
            ...baseProps,
          },
          this.renderInlineElements(element.content)
        );

      case "text":
      default:
        return React.createElement(
          Text,
          baseProps,
          this.renderInlineElements(element.content)
        );
    }
  }

  /**
   * Render inline format elements
   */
  private static renderInlineElements(content: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let remaining = content;
    let key = 0;

    while (remaining.length > 0) {
      // Find code blocks
      const codeMatch = remaining.match(/`([^`]+)`/);
      if (codeMatch && codeMatch.index !== undefined) {
        // Add text before code block
        if (codeMatch.index > 0) {
          const beforeText = remaining.substring(0, codeMatch.index);
          parts.push(...this.renderFormattedText(beforeText, key++));
        }

        // Add code block
        parts.push(
          React.createElement(
            Text,
            {
              key: key++,
              color: "#B4591D",
            },
            codeMatch[1]
          )
        );

        remaining = remaining.substring(codeMatch.index + codeMatch[0].length);
        continue;
      }

      // No more code blocks, process remaining text
      parts.push(...this.renderFormattedText(remaining, key++));
      break;
    }

    return parts;
  }

  /**
   * Render formatted text (bold, italic)
   */
  private static renderFormattedText(
    text: string,
    baseKey: number
  ): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = baseKey;

    while (remaining.length > 0) {
      // Find bold
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        // Add text before bold
        if (boldMatch.index > 0) {
          const beforeText = remaining.substring(0, boldMatch.index);
          parts.push(...this.renderItalicText(beforeText, key++));
        }

        // Add bold text
        parts.push(
          React.createElement(
            Text,
            {
              key: key++,
              bold: true,
            },
            boldMatch[1]
          )
        );

        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // No more bold, process remaining text's italic
      parts.push(...this.renderItalicText(remaining, key++));
      break;
    }

    return parts;
  }

  /**
   * Render italic text
   */
  private static renderItalicText(
    text: string,
    baseKey: number
  ): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = baseKey;

    while (remaining.length > 0) {
      // Find italic
      const italicMatch = remaining.match(/\*([^*]+)\*/);
      if (italicMatch && italicMatch.index !== undefined) {
        // Add text before italic
        if (italicMatch.index > 0) {
          const beforeText = remaining.substring(0, italicMatch.index);
          if (beforeText) {
            parts.push(beforeText);
          }
        }

        // Add italic text
        parts.push(
          React.createElement(
            Text,
            {
              key: key++,
              italic: true,
            },
            italicMatch[1]
          )
        );

        remaining = remaining.substring(
          italicMatch.index + italicMatch[0].length
        );
        continue;
      }

      // No more italic, add plain text
      if (remaining) {
        parts.push(remaining);
      }
      break;
    }

    return parts;
  }
}
