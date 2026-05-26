#!/usr/bin/env node
/**
 * verify-cloudflare — sanity-check Cloudflare credentials.
 * Reads from macOS Keychain (or env / .env as fallback). Never prints values.
 *
 * Run with: npm run verify-cloudflare
 */
import { getCredentials } from './cf-credentials.mjs'

const { token, accountId } = getCredentials()

console.log(`token length: ${token.length} chars`)
console.log(`account length: ${accountId.length} chars`)

const headers = { Authorization: `Bearer ${token}` }

const r1 = await fetch(
  'https://api.cloudflare.com/client/v4/user/tokens/verify',
  { headers },
).then((r) => r.json())
console.log('token:', r1.success ? 'OK' : `FAIL ${JSON.stringify(r1.errors)}`)

// Hit the actual endpoints sync-cloudflare uses (Stream list + Images list).
// Account-info access (GET /accounts/{id}) needs a different permission that
// we don't need for uploads, so testing it gave a misleading 9109.
const r2 = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?per_page=1`,
  { headers },
).then((r) => r.json())
console.log(
  'stream:',
  r2.success ? 'OK' : `FAIL ${JSON.stringify(r2.errors)}`,
)

const r3 = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1?per_page=1`,
  { headers },
).then((r) => r.json())
console.log(
  'images:',
  r3.success ? 'OK' : `FAIL ${JSON.stringify(r3.errors)}`,
)
