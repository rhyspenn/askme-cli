import * as fs from "fs";
import * as net from "net";
import { CONFIG } from "../config/index.js";
import type { SocketMessage } from "../types/index.js";

// Common function to clean up socket file
export const cleanupSocket = (socketPath: string): void => {
  if (fs.existsSync(socketPath)) {
    try {
      fs.unlinkSync(socketPath);
      console.error(`🧹 Cleaned up socket file: ${socketPath}`);
    } catch (error) {
      console.error(
        `❌ Failed to clean up socket file: ${(error as Error).message}`
      );
    }
  }
};

// Create Unix Socket server - return complete user confirmation message
export const createSocketServer = (
  socketPath: string
): Promise<SocketMessage> => {
  return new Promise((resolve, reject) => {
    const socketServer = net.createServer((socket) => {
      let buffer = Buffer.alloc(0);

      socket.on("data", (data: Buffer) => {
        buffer = Buffer.concat([buffer, data]);

        try {
          const message: SocketMessage = JSON.parse(buffer.toString());

          socket.end();
          socketServer.close();
          cleanupSocket(socketPath);

          // Return complete message object instead of just text
          resolve(message);
        } catch (error) {
          // Wait for more data
        }
      });

      socket.on("error", (error: Error) => {
        console.error("Socket error:", error);
        socketServer.close();
        cleanupSocket(socketPath);
        reject(new Error(`Socket connection error: ${error.message}`));
      });
    });

    socketServer.listen(socketPath);

    socketServer.on("error", (error: Error) => {
      console.error("Unix Socket server error:", error);
      cleanupSocket(socketPath);
      reject(new Error(`Unix Socket server failed to start: ${error.message}`));
    });

    // Set timeout cleanup
    setTimeout(() => {
      socketServer.close();
      cleanupSocket(socketPath);
      reject(new Error("User input timeout (10 minutes)"));
    }, CONFIG.TIMEOUT_MS);
  });
};
