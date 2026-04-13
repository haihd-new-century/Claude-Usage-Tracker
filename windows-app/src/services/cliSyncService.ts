import { getClaudeConfigDir, fileExists, readFile, writeFile } from "./tauriBridge";

interface CLICredentials {
  claudeAiOauth?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
    scopes?: string[];
  };
  subscription?: string;
}

/** Read Claude Code CLI credentials from %USERPROFILE%\.claude\.credentials.json */
export async function readCLICredentials(): Promise<CLICredentials | null> {
  try {
    const configDir = await getClaudeConfigDir();
    const credPath = `${configDir}\\.credentials.json`;
    if (!(await fileExists(credPath))) return null;

    const raw = await readFile(credPath);
    return JSON.parse(raw) as CLICredentials;
  } catch {
    return null;
  }
}

/** Check if Claude Code is installed on this Windows machine */
export async function isClaudeCodeInstalled(): Promise<boolean> {
  try {
    const configDir = await getClaudeConfigDir();
    return await fileExists(`${configDir}\\.credentials.json`);
  } catch {
    return false;
  }
}

/** Sync CLI credentials into a profile's cliCredentialsJSON field */
export async function syncCLICredentials(): Promise<{
  json: string;
  hasAccount: boolean;
} | null> {
  const creds = await readCLICredentials();
  if (!creds || !creds.claudeAiOauth?.accessToken) return null;

  return {
    json: JSON.stringify(creds),
    hasAccount: true,
  };
}

/** Get the access token from CLI credentials JSON */
export function extractAccessToken(cliCredentialsJSON: string | null): string | null {
  if (!cliCredentialsJSON) return null;
  try {
    const creds = JSON.parse(cliCredentialsJSON) as CLICredentials;
    return creds.claudeAiOauth?.accessToken ?? null;
  } catch {
    return null;
  }
}

/** Read Claude Code settings.json for statusline configuration */
export async function readClaudeCodeSettings(): Promise<Record<string, unknown> | null> {
  try {
    const configDir = await getClaudeConfigDir();
    const settingsPath = `${configDir}\\settings.json`;
    if (!(await fileExists(settingsPath))) return null;

    const raw = await readFile(settingsPath);
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Write Claude Code settings.json for statusline configuration */
export async function writeClaudeCodeSettings(settings: Record<string, unknown>): Promise<void> {
  const configDir = await getClaudeConfigDir();
  const settingsPath = `${configDir}\\settings.json`;
  await writeFile(settingsPath, JSON.stringify(settings, null, 2));
}
