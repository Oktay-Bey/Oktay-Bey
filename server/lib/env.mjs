import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let isLoaded = false;

function parseEnv(content) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce((acc, line) => {
      const eqIndex = line.indexOf('=');
      if (eqIndex === -1) {
        return acc;
      }
      const key = line.slice(0, eqIndex).trim();
      const rawValue = line.slice(eqIndex + 1).trim();
      const value = rawValue.replace(/^"|"$/g, '');
      acc[key] = value;
      return acc;
    }, {});
}

export function loadEnv() {
  if (isLoaded) {
    return process.env;
  }

  const currentFile = fileURLToPath(import.meta.url);
  const rootDir = path.resolve(path.dirname(currentFile), '../../');
  const envPath = path.join(rootDir, '.env');

  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    const parsed = parseEnv(content);
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof process.env[key] === 'undefined') {
        process.env[key] = value;
      }
    });
  }

  isLoaded = true;
  return process.env;
}

export function getEnv(key, fallback = undefined) {
  const env = loadEnv();
  const value = env[key];
  if (typeof value === 'undefined') {
    return fallback;
  }
  return value;
}
