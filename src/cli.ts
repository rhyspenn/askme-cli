#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";

// Color output functions
const colors = {
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

// Show help information
function showHelp(): void {
  console.log(`${colors.bold(
    colors.cyan("ASKME-CLI")
  )} - User Confirmation MCP Server

${colors.bold("Usage:")}
  ${colors.green("npx askme-cli")}           Run MCP server directly
  ${colors.green("npx askme-cli help")}      Show help information

${colors.bold("Configuration Examples:")}
Add to your IDE MCP configuration file:

${colors.yellow("# Cursor (.cursor/mcp_servers.json)")}
${colors.cyan(`{
  "mcpServers": {
    "askme-cli": {
      "command": "npx",
      "args": ["askme-cli"]
    }
  }
}`)}

${colors.yellow("# Other IDEs that support MCP")}
${colors.cyan(`{
  "mcpServers": {
    "askme-cli": {
      "command": "npx",
      "args": ["askme-cli"],
      "env": {}
    }
  }
}`)}

${colors.bold("About:")}
  ASKME-CLI is an MCP (Model Context Protocol) server that
  provides terminal interface for user confirmation and next plan collection for AI assistants.
  
  ${colors.bold("Tool:")} ask_me - Collect user's next plan or confirmation`);
}

// Run MCP server
async function runServer(): Promise<void> {
  try {
    // Get current directory in ES module
    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.dirname(__filename);
    const serverPath = path.join(__dirname, "mcp-cli-server.js");

    if (!fs.existsSync(serverPath)) {
      console.log(
        `${colors.red("✗")} Server file does not exist: ${colors.cyan(
          serverPath
        )}`
      );
      console.log(
        `${colors.yellow("Please run first:")} ${colors.green("npm run build")}`
      );
      return;
    }

    const serverProcess = spawn("node", [serverPath], {
      stdio: "inherit",
    });

    serverProcess.on("exit", (code) => {
      process.exit(code || 0);
    });
  } catch (error) {
    console.error(
      `${colors.red("Failed to start MCP server:")} ${(error as Error).message}`
    );
    process.exit(1);
  }
}

// Main function
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "help":
    case "--help":
    case "-h":
      showHelp();
      break;

    default:
      // Default behavior: run MCP server
      await runServer();
      break;
  }
}

// Error handling
process.on("uncaughtException", (error) => {
  console.error(`${colors.red("Uncaught exception:")} ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(`${colors.red("Unhandled promise rejection:")} ${reason}`);
  process.exit(1);
});

// Always run main function (since this file is specifically used as CLI entry)
main().catch((error) => {
  console.error(`${colors.red("Execution failed:")} ${error.message}`);
  process.exit(1);
});

export { main };
