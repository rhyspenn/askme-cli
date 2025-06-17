// MCP-CLI Server Entry Point
import { startMCPServer } from "./server/core/mcp-server.js";

// Set up global process event listeners for resource cleanup
process.on("exit", () => {
  // Clean up when process exits
  console.error("🔚 Server is exiting...");
});

process.on("SIGINT", () => {
  console.error("\n⚠️ Received interrupt signal, cleaning up resources...");
  process.exit();
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error);
  process.exit(1);
});

// Start server
async function main(): Promise<void> {
  await startMCPServer();
}

main();
