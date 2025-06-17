[![npm](https://img.shields.io/npm/v/askme-cli)](https://www.npmjs.com/package/askme-cli)
[![GitHub license](https://img.shields.io/github/license/rhyspenn/askme-cli)](https://github.com/rhyspenn/askme-cli/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/rhyspenn/askme-cli)](https://github.com/rhyspenn/askme-cli)
[![npm downloads](https://img.shields.io/npm/dm/askme-cli)](https://www.npmjs.com/package/askme-cli)
# ASKME-CLI

> An MCP (Model Context Protocol) server that provides user confirmation interface for AI assistants

[简体中文](docs/README_zh.md) | [日本語](docs/README_ja.md)

<img src="https://github.com/user-attachments/assets/da71a4cc-69d6-459f-b0f3-7c64d2f22854" style="max-width: 100%; width: 800px;" alt="Usage">

## Why

AI assistants often need user confirmation or next steps, but there's no simple way to get user input during MCP conversations.

This project provides a personal confirmation endpoint via terminal interface.

## How to start

You will need to configure your MCP client to use ASKME-CLI.

Deploy the configuration using the instructions below.

### Quick Setup with npx

```bash
# View help and configuration examples
npx askme-cli help

# Run directly (when called by MCP client)
npx askme-cli
```

### Configure MCP Client

Add to your MCP client configuration file:

#### Cursor (`.cursor/mcp_servers.json`)

```json
{
  "mcpServers": {
    "askme-cli": {
      "command": "npx",
      "args": ["askme-cli"],
      "env": {
        "ASKME_CLI_TERMINAL": "warp"
      }
    }
  }
}
```

#### Other MCP Clients

```json
{
  "mcpServers": {
    "askme-cli": {
      "command": "npx",
      "args": ["askme-cli"],
      "env": {
        "ASKME_CLI_TERMINAL": "iterm2"
      }
    }
  }
}
```

### Local Development

```bash
# Clone and install
git clone <your-repo-url>
cd askme-cli
npm install

# Build and run
npm run build
npm run start
```

## How to use

Once configured, the AI assistant can use the `ask_me` tool to collect user confirmation:

1. AI assistant calls `ask_me` tool with summary of completed work
2. ASKME-CLI opens a new terminal window with confirmation interface  
3. User enters next plan or confirmation and submits
4. AI assistant receives user input to continue

## Terminal Support

Configure via `ASKME_CLI_TERMINAL` environment variable:

| Terminal | Value | Description |
|----------|-------|-------------|
| Warp | `warp` | Default, modern terminal app |
| iTerm2 | `iterm2` | Popular macOS terminal |
| Terminal | `terminal` | macOS system terminal |
| Kitty | `kitty` | Cross-platform terminal |
| Alacritty | `alacritty` | GPU-accelerated terminal |
| Hyper | `hyper` | Web-based terminal |

## API Reference

### ask_me Tool

Collects user's next plan or confirmation.

**Parameters:**
- `what_we_did` (string): Summary of work completed by AI

**Returns:**
- User's input for next plan or confirmation
- Supports text and image input

## Usage Examples

### AI Assistant Integration

To use ASKME-CLI effectively in your AI assistant, add these rules to your system prompt:

```
- Must call the askme-cli.ask_me tool before ending any user prompt every time.
- All prompts starting with /tk, don't modify code or files, and call the askme-cli.ask_me tool before ending.
- When you have questions, always call the askme-cli.ask_me tool before ending.
- If you have ideas for new features or changes, explain them clearly, analyze their feasibility, and ask if I want to proceed.
```

### Example Tool Call

```json
{
  "tool": "ask_me",
  "parameters": {
    "what_we_did": "I've completed setting up the database schema and created the user authentication endpoints. The API is now ready for testing."
  }
}
```

## Tech Stack

- **TypeScript** - Type-safe development
- **React + Ink** - Terminal UI framework  
- **MCP SDK** - Model Context Protocol support
- **Node.js** - Runtime environment

## License

MIT
