import { exec } from "child_process";
import { promisify } from "util";
import * as os from "os";
import { ClipboardManager } from "../types/index.js";

const execAsync = promisify(exec);

export class MacClipboardManager implements ClipboardManager {
  /**
   * Check if clipboard contains image
   */
  async hasImage(): Promise<boolean> {
    try {
      const script = `
import Cocoa
let pasteboard = NSPasteboard.general
let types = pasteboard.types ?? []
let hasImage = types.contains { type -> Bool in
    return type.rawValue.hasPrefix("public.image") || 
           type.rawValue.contains("png") || 
           type.rawValue.contains("jpeg") || 
           type.rawValue.contains("tiff")
}
print(hasImage)
`;
      const { stdout } = await execAsync(`swift -e '${script}'`);
      return stdout.trim() === "true";
    } catch (error) {
      console.error("Failed to check clipboard image:", error);
      return false;
    }
  }

  /**
   * Get image data from clipboard - using Swift solution, returns Base64 encoding
   */
  async getImage(): Promise<Buffer | null> {
    try {
      const script = `
import Cocoa
import Foundation

let pasteboard = NSPasteboard.general

// Iterate through clipboard types to find image data
let types = pasteboard.types ?? []
var foundImage = false

for type in types {
    let typeString = type.rawValue
    
    if typeString.hasPrefix("public.image") || 
       typeString.contains("png") || 
       typeString.contains("jpeg") || 
       typeString.contains("tiff") {
        
        if let imageData = pasteboard.data(forType: type) {
            let base64String = imageData.base64EncodedString()
            let mimeType: String
            
            if typeString.contains("png") {
                mimeType = "image/png"
            } else if typeString.contains("jpeg") {
                mimeType = "image/jpeg"
            } else if typeString.contains("tiff") {
                mimeType = "image/tiff"
            } else {
                mimeType = "image/png"  // default
            }
            
            print("data:\\(mimeType);base64,\\(base64String)")
            foundImage = true
            break
        }
    }
}

if !foundImage {
    print("NO_IMAGE")
}
`;

      const { stdout } = await execAsync(`swift -e '${script}'`);
      const result = stdout.trim();

      if (result === "NO_IMAGE") {
        console.log("❌ No image data in clipboard");
        return null;
      }

      if (result.startsWith("data:image/")) {
        // Extract Base64 data (remove data:image/xxx;base64, prefix)
        const base64Data = result.split(",")[1];
        const imageBuffer = Buffer.from(base64Data, "base64");
        return imageBuffer;
      }

      console.log("❌ Incorrect image format:", result);
      return null;
    } catch (error) {
      console.error("Failed to get image:", error);
      return null;
    }
  }

  /**
   * Get text data from clipboard
   */
  async getText(): Promise<string | null> {
    try {
      const { stdout } = await execAsync("pbpaste");
      return stdout || null;
    } catch (error) {
      console.error("Failed to get clipboard text:", error);
      return null;
    }
  }
}

// Create clipboard manager based on platform
export function createClipboardManager(): ClipboardManager {
  const platform = os.platform();

  if (platform === "darwin") {
    return new MacClipboardManager();
  }

  // Other platforms temporarily return empty implementation
  return {
    hasImage: async () => false,
    getImage: async () => null,
    getText: async () => null,
  };
}
