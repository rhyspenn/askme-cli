import * as net from "net";
import { AskMeMessage, ImageAttachment } from "../types/index.js";

// Send ask me to Unix Socket
export const sendAskMeToSocket = async (
  socketPath: string,
  askMe: string,
  images?: ImageAttachment[]
): Promise<void> => {
  if (!socketPath) {
    console.error("❌ Socket path not provided");
    return;
  }

  try {
    const socket = net.createConnection(socketPath);

    socket.on("connect", () => {
      const message: AskMeMessage = {
        ask_me: askMe || "",
        timestamp: Date.now(),
        images: images && images.length > 0 ? images : undefined,
      };

      socket.write(JSON.stringify(message));
      socket.end();
    });

    socket.on("error", (error: Error) => {
      console.error("❌ Socket connection failed:", error);
    });
  } catch (error) {
    console.error("❌ Failed to send request:", error);
  }
};
