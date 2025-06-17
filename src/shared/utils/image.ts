import { ImageAttachment } from "../types/index.js";

/**
 * Detect image MIME type
 */
export function detectImageMimeType(buffer: Buffer): string {
  // PNG signature
  if (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }

  // JPEG signature
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return "image/jpeg";
  }

  // GIF signature
  if (
    buffer.subarray(0, 6).equals(Buffer.from("GIF87a")) ||
    buffer.subarray(0, 6).equals(Buffer.from("GIF89a"))
  ) {
    return "image/gif";
  }

  // Default to PNG
  return "image/png";
}

/**
 * Convert image Buffer to Base64 data URL
 */
export function bufferToBase64DataUrl(
  buffer: Buffer,
  mimeType: string
): string {
  const base64Data = buffer.toString("base64");
  return `data:${mimeType};base64,${base64Data}`;
}

/**
 * Generate next image ID
 */
export function generateImageId(existingImages: ImageAttachment[]): string {
  const existingIds = existingImages.map((img) => img.id);
  let counter = 1;

  while (existingIds.includes(`Image #${counter}`)) {
    counter++;
  }

  return `Image #${counter}`;
}

/**
 * Create image attachment object
 */
export function createImageAttachment(
  buffer: Buffer,
  existingImages: ImageAttachment[]
): ImageAttachment {
  const mimeType = detectImageMimeType(buffer);
  const id = generateImageId(existingImages);
  const base64DataUrl = bufferToBase64DataUrl(buffer, mimeType);

  return {
    id,
    data: base64DataUrl, // Use Base64 data URL
    mimeType,
    size: buffer.length,
    placeholder: `[${id}]`,
  };
}

/**
 * Insert image placeholder in text (auto add space for easy input)
 */
export function insertImagePlaceholder(
  text: string,
  cursorPosition: number,
  placeholder: string
): {
  newText: string;
  newCursorPosition: number;
} {
  const beforeCursor = text.slice(0, cursorPosition);
  const afterCursor = text.slice(cursorPosition);

  // Add space after placeholder for easy user input
  const placeholderWithSpace = placeholder + " ";
  const newText = beforeCursor + placeholderWithSpace + afterCursor;
  const newCursorPosition = cursorPosition + placeholderWithSpace.length;

  return {
    newText,
    newCursorPosition,
  };
}

/**
 * Parse image placeholders from text
 */
export function parseImagePlaceholders(text: string): string[] {
  const placeholderRegex = /\[Image #\d+\]/g;
  const matches = text.match(placeholderRegex);
  return matches || [];
}

/**
 * Extract pure Base64 data from Base64 data URL
 */
export function extractBase64FromDataUrl(dataUrl: string): string {
  const parts = dataUrl.split(",");
  return parts.length > 1 ? parts[1] : dataUrl;
}
