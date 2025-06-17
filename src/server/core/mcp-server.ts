import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CONFIG, getTerminalApp } from "../config/index.js";
import { handleAskMeTool } from "./handlers.js";
import type { AskMeArgs } from "../types/index.js";

// Create MCP server instance
const server = new Server(
  {
    name: CONFIG.SERVER_NAME,
    version: CONFIG.SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool list request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "ask_me",
        description:
          "Ask the user for their next plan or obtain the user's confirmation",
        inputSchema: {
          type: "object",
          properties: {
            what_we_did: {
              type: "string",
              description: `Format your response as follows:
1. Start with '**TL;DR**: [brief summary]' on the first line
2. Follow with bullet points for what we did.
3. Use bullet points starting with '•' for each action`,
            },
          },
          required: ["what_we_did"],
        },
      },
    ],
  };
});

// Handle tool call request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "ask_me") {
    return await handleAskMeTool(args as AskMeArgs);
  } else {
    throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
export async function startMCPServer(): Promise<void> {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    const terminalConfig = getTerminalApp();
    console.error("🚀 ASKME-CLI MCP server started");
    console.error("📱 Tool name: ask_me");
    console.error(`🖥️ Using terminal app: ${terminalConfig.name}`);
    console.error(
      "💡 Use terminal + Ink UI to collect user confirmation, press Enter to submit"
    );

    if (process.env.ASKME_CLI_TERMINAL) {
      console.error(
        `⚙️ Terminal config source: environment variable ASKME_CLI_TERMINAL=${process.env.ASKME_CLI_TERMINAL}`
      );
    } else {
      console.error("⚙️ Terminal config: using default terminal (iTerm)");
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
