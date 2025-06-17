import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { CONFIG } from "../config/index.js";
import type { AskMeArgs, SocketMessage } from "../types/index.js";
import { createSocketServer, cleanupSocket } from "../services/socket.js";
import { createAskMeScript } from "../services/script.js";
import { launchTerminal } from "../services/terminal.js";

// Use Ink UI to collect user confirmation - return complete user confirmation message
export async function openTerminalForAskMe(
  message: string = "Please enter your next plan or confirmation:"
): Promise<SocketMessage> {
  // Get project root directory, then locate to dist/client directory
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  const projectRoot = path.resolve(currentDir, "../../../");
  const askMeUIPath = path.join(projectRoot, "dist/client/", CONFIG.UI_FILE);

  // Check if ask-me-ui.js exists
  if (!fs.existsSync(askMeUIPath)) {
    throw new Error(`ask-me-ui.js file does not exist: ${askMeUIPath}`);
  }

  const socketPath = path.join(os.tmpdir(), `askme-socket-${Date.now()}.sock`);

  try {
    // Create socket server
    const askMePromise = createSocketServer(socketPath);

    // Create and launch script
    const scriptFile = createAskMeScript(
      path.dirname(askMeUIPath),
      message,
      socketPath
    );
    await launchTerminal(scriptFile, socketPath);

    // Wait for user confirmation result
    return await askMePromise;
  } catch (error) {
    cleanupSocket(socketPath);
    throw error;
  }
}

// Handle ask_me tool call
export async function handleAskMeTool(args: AskMeArgs) {
  try {
    const { what_we_did } = args || {};
    const message = `# 💬 What we did:\n\n${what_we_did}\n\n# Please provide your next plan or confirmation:`;

    const askMeMessage = await openTerminalForAskMe(message);

    // Build return content
    const responseText =
      askMeMessage.ask_me || "User did not enter any content";

    // If there are images, return images in Cursor supported format
    if (askMeMessage.images && askMeMessage.images.length > 0) {
      const contentArray: any[] = [
        {
          type: "text",
          text: responseText,
        },
      ];

      // Add image type content for each image (Cursor supported format)
      askMeMessage.images.forEach((img) => {
        // Extract pure Base64 data from Base64 data URL
        const base64Data = img.data.split(",")[1] || img.data;

        contentArray.push({
          type: "image",
          data: base64Data, // Use pure Base64 data, no data: prefix
          mimeType: img.mimeType,
        });
      });

      return {
        content: contentArray,
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: responseText,
          },
        ],
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error collecting user confirmation: ${
            (error as Error).message
          }`,
        },
      ],
    };
  }
}
