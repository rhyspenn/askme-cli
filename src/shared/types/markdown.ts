export interface MarkdownElement {
  type: "text" | "bold" | "italic" | "code" | "header" | "list";
  content: string;
  level?: number; // for header level
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
}

export interface MarkdownConfig {
  /**
   * Whether to enable bold format
   * @default true
   */
  enableBold?: boolean;

  /**
   * Whether to enable italic format
   * @default true
   */
  enableItalic?: boolean;

  /**
   * Whether to enable code format
   * @default true
   */
  enableCode?: boolean;

  /**
   * Whether to enable header format
   * @default true
   */
  enableHeaders?: boolean;

  /**
   * Whether to enable list format
   * @default true
   */
  enableLists?: boolean;

  /**
   * Header color configuration
   */
  headerColors?: string[];

  /**
   * Code background color
   * @default 'gray'
   */
  codeBackgroundColor?: string;

  /**
   * List color
   * @default 'cyan'
   */
  listColor?: string;
}
