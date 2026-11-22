import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, defineConfig } from '@playwright/test';

function findCachedPlaywrightChromium(): string | undefined {
  const browsersDir =
    process.env.PLAYWRIGHT_BROWSERS_PATH ||
    (process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'ms-playwright')
      : process.platform === 'darwin'
        ? path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright')
        : path.join(os.homedir(), '.cache', 'ms-playwright'));

  if (!fs.existsSync(browsersDir)) return undefined;

  const entries = fs
    .readdirSync(browsersDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

  const candidates = (dirName: string): string[] => {
    if (process.platform === 'win32') {
      return [
        path.join(browsersDir, dirName, 'chrome-win64', 'chrome.exe'),
        path.join(browsersDir, dirName, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
      ];
    }
    if (process.platform === 'darwin') {
      return [
        path.join(browsersDir, dirName, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        path.join(browsersDir, dirName, 'chrome-mac', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
      ];
    }
    return [
      path.join(browsersDir, dirName, 'chrome-linux64', 'chrome'),
      path.join(browsersDir, dirName, 'chrome-linux', 'chrome'),
      path.join(browsersDir, dirName, 'chrome-headless-shell-linux64', 'chrome-headless-shell'),
    ];
  };

  for (const dirName of entries) {
    if (!dirName.startsWith('chromium-') && !dirName.startsWith('chromium_headless_shell-')) continue;
    for (const candidate of candidates(dirName)) {
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

export function resolveChromiumExecutable(): string | undefined {
  const envExe = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (envExe && fs.existsSync(envExe)) return envExe;

  if (process.platform === 'linux') {
    for (const sysBin of ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']) {
      if (fs.existsSync(sysBin)) return sysBin;
    }
  }

  const defaultExe = chromium.executablePath();
  if (defaultExe && fs.existsSync(defaultExe)) {
    const headlessShellExe = defaultExe
      .replace(/chromium-(\d+)/, 'chromium_headless_shell-$1')
      .replace(/chrome-win64([\\/])chrome\.exe$/, 'chrome-headless-shell-win64$1chrome-headless-shell.exe')
      .replace(/chrome-linux64([\\/])chrome$/, 'chrome-headless-shell-linux64$1chrome-headless-shell');
    if (fs.existsSync(headlessShellExe)) return undefined;
    return defaultExe;
  }

  const cached = findCachedPlaywrightChromium();
  if (cached) return cached;

  if (process.platform === 'win32') {
    const edgePaths = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ];
    return edgePaths.find((p) => fs.existsSync(p));
  }

  return undefined;
}

const executablePath = resolveChromiumExecutable();

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    ignoreHTTPSErrors: true,
    launchOptions: {
      ...(executablePath ? { executablePath } : {}),
      ...(process.platform === 'linux' ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : {}),
    },
  },
  webServer: {
    command: `${process.platform === 'win32' ? 'npm.cmd' : 'npm'} run preview -- --host 127.0.0.1 --port 4173`,
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
