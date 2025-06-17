import open from "open";
import { getTerminalApp } from "../config/index.js";
import { cleanupSocket } from "./socket.js";

// Launch terminal app (supports multiple terminals)
export const launchTerminal = (
  scriptFile: string,
  socketPath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const terminalConfig = getTerminalApp();

    console.error(`🖥️ Using terminal app: ${terminalConfig.name}`);

    // Use open library to open script file
    open(scriptFile, { app: { name: terminalConfig.name } })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        cleanupSocket(socketPath);
        reject(
          new Error(
            `Cannot open ${terminalConfig.name}: ${error.message}. Please make sure ${terminalConfig.name} terminal app is installed.`
          )
        );
      });
  });
};
