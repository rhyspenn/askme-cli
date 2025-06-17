// Configuration interface definitions
export interface Config {
  SERVER_NAME: string;
  SERVER_VERSION: string;
  TIMEOUT_MS: number;
  UI_FILE: string;
}

// Terminal app configuration interface
export interface TerminalConfig {
  name: string;
}

// Main configuration constants
export const CONFIG: Config = {
  SERVER_NAME: "askme-cli",
  SERVER_VERSION: "1.0.0",
  TIMEOUT_MS: 600000, // 10 minutes
  UI_FILE: "ask-me-ui.js",
};

// Supported terminal app configurations
export const SUPPORTED_TERMINALS: Record<string, TerminalConfig> = {
  warp: {
    name: "Warp",
  },
  iterm2: {
    name: "iTerm",
  },
  terminal: {
    name: "Terminal",
  },
  kitty: {
    name: "kitty",
  },
  alacritty: {
    name: "Alacritty",
  },
  hyper: {
    name: "Hyper",
  },
  windowsterminal: {
    name: "wt",
  },
};

// Get configured terminal app
export const getTerminalApp = (): TerminalConfig => {
  // Get terminal app config from environment variable, default to iterm2
  const terminalApp = (
    process.env.ASKME_CLI_TERMINAL || "iterm2"
  ).toLowerCase();

  if (SUPPORTED_TERMINALS[terminalApp]) {
    return SUPPORTED_TERMINALS[terminalApp];
  }

  // If specified terminal is not in supported list, try to use as custom terminal
  console.error(
    `⚠️ Unknown terminal app: ${terminalApp}, will try to use as custom terminal`
  );
  return {
    name: terminalApp,
  };
};
