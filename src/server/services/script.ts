import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { CONFIG } from "../config/index.js";

// Function to escape shell strings
export const escapeShellString = (str: string): string => {
  return str.replace(/'/g, "'\"'\"'");
};

// Create user confirmation collection script
export const createAskMeScript = (
  __dirname: string,
  message: string,
  socketPath: string
): string => {
  const escapedMessage = escapeShellString(message);
  const escapedSocketPath = escapeShellString(socketPath);

  const scriptContent = `#!/bin/bash
cd "${__dirname}"
echo "🚀 Start ASKME-CLI UI..."
echo ""
node ${CONFIG.UI_FILE} '${escapedMessage}' '${escapedSocketPath}'
echo ""
/bin/rm "$0"  # Delete script file itself
`;

  const scriptFile = path.join(os.tmpdir(), `askme-script-${Date.now()}.sh`);
  fs.writeFileSync(scriptFile, scriptContent);
  fs.chmodSync(scriptFile, "755");

  return scriptFile;
};
