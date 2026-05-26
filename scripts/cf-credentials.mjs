/**
 * Read Cloudflare credentials. Source order:
 *   1. macOS Keychain (recommended) — set via:
 *        security add-generic-password -U -a "$USER" -s "joyful-visual-kit-cf-token"   -w
 *        security add-generic-password -U -a "$USER" -s "joyful-visual-kit-cf-account" -w
 *   2. Environment variables CF_API_TOKEN / CF_ACCOUNT_ID (fallback for CI).
 *   3. .env file (legacy; still works but no longer recommended).
 */
import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'

const KEYCHAIN_TOKEN_SERVICE = 'joyful-visual-kit-cf-token'
const KEYCHAIN_ACCOUNT_SERVICE = 'joyful-visual-kit-cf-account'

function readKeychain(service) {
  try {
    const out = execSync(
      `security find-generic-password -a "${process.env.USER}" -s "${service}" -w`,
      { stdio: ['ignore', 'pipe', 'ignore'] },
    )
    return out.toString().trim() || null
  } catch {
    return null
  }
}

function readDotEnv() {
  const path = new URL('../.env', import.meta.url).pathname
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/i)
    if (!m) continue
    out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

export function getCredentials() {
  const fromEnv = readDotEnv()
  const token =
    readKeychain(KEYCHAIN_TOKEN_SERVICE) ||
    process.env.CF_API_TOKEN ||
    fromEnv.CF_API_TOKEN
  const accountId =
    readKeychain(KEYCHAIN_ACCOUNT_SERVICE) ||
    process.env.CF_ACCOUNT_ID ||
    fromEnv.CF_ACCOUNT_ID

  if (!token || !accountId) {
    console.error(
      'Missing Cloudflare credentials. Store them in Keychain (recommended):\n' +
        `  security add-generic-password -U -a "$USER" -s "${KEYCHAIN_TOKEN_SERVICE}" -w\n` +
        `  security add-generic-password -U -a "$USER" -s "${KEYCHAIN_ACCOUNT_SERVICE}" -w\n` +
        '\nEach command prompts for the value (hidden input). Paste, press Enter.',
    )
    process.exit(1)
  }

  return { token, accountId }
}
