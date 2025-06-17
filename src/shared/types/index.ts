// Type definitions for ask me UI
export interface DelayConfig {
  EXIT_PROTECTION: number;
}

// Image attachment interface
export interface ImageAttachment {
  id: string; // "Image #1", "Image #2"
  data: string; // Base64 data URL (data:image/type;base64,...)
  mimeType: string; // "image/png", "image/jpeg", etc.
  size: number; // File size (bytes)
  placeholder: string; // "[Image #1]" placeholder text
}

// ask me message interface, supports images
export interface AskMeMessage {
  ask_me: string;
  timestamp: number;
  images?: ImageAttachment[]; // Optional image array
}

export interface AskMeAppProps {
  message?: string;
  socketPath?: string | null;
}

// Extended input component properties, supports image processing
export interface MultiLineTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string, images?: ImageAttachment[]) => void;
  placeholder?: string;
  images: ImageAttachment[];
  onImagesChange: (images: ImageAttachment[]) => void;
  onProcessingStateChange?: (isProcessing: boolean) => void;
  onShowHelpRequest?: () => void;
}

export interface CursorPosition {
  row: number;
  col: number;
}

// Clipboard manager interface
export interface ClipboardManager {
  hasImage(): Promise<boolean>;
  getImage(): Promise<Buffer | null>;
  getText(): Promise<string | null>;
}
