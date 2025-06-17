import React from 'react';
import { Box } from 'ink';
import { SimpleMarkdownParser, MarkdownElement } from '../../shared/utils/markdownParser.js';

export interface SimpleMarkdownProps {
    children: string;
    /**
     * Whether to enable markdown parsing
     * @default true
     */
    enabled?: boolean;
}

/**
 * Check if spacing should be added for element
 */
const shouldAddSpacing = (element: MarkdownElement, elements: MarkdownElement[], index: number): boolean => {
    // Last element doesn't need spacing
    if (index === elements.length - 1) {
        return false;
    }

    // Headers always need spacing after them
    if (element.type === 'header') {
        return true;
    }

    // If next element is header, current element needs spacing
    const nextElement = elements[index + 1];
    if (nextElement && nextElement.type === 'header') {
        return true;
    }

    // List items don't need extra spacing between them, but list groups need spacing after
    if (element.type === 'list') {
        const nextElement = elements[index + 1];
        return nextElement && nextElement.type !== 'list';
    }

    return false;
};

/**
 * Get spacing size for element
 */
const getSpacing = (element: MarkdownElement): number => {
    switch (element.type) {
        case 'header':
            // Level 1 headers get larger spacing, other headers get medium spacing
            return element.level === 1 ? 1 : 1;
        case 'list':
            // Spacing after list groups
            return 1;
        case 'text':
            // Spacing after normal text
            return 1;
        default:
            return 1;
    }
};

/**
 * Simple Markdown component
 * Supports: headers, bold, italic, code, lists
 */
export const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({
    children,
    enabled = true
}) => {
    if (!enabled || !children) {
        // If markdown is disabled or no content, return plain text
        return <>{children}</>;
    }

    try {
        // Parse markdown
        const elements = SimpleMarkdownParser.parse(children);

        // Render elements with appropriate spacing
        return (
            <Box flexDirection="column">
                {elements.map((element, index) => {
                    const renderedElement = SimpleMarkdownParser.renderElement(element, index);

                    // Add spacing for different types of elements
                    const needsSpacing = shouldAddSpacing(element, elements, index);

                    if (needsSpacing) {
                        return (
                            <Box key={`wrapper-${index}`} marginBottom={getSpacing(element)}>
                                {renderedElement}
                            </Box>
                        );
                    }

                    return renderedElement;
                })}
            </Box>
        );
    } catch (error) {
        // Fallback to plain text when parsing fails
        console.warn('Markdown parsing failed, falling back to plain text display:', error);
        return <>{children}</>;
    }
};

export default SimpleMarkdown; 