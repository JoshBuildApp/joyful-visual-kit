#!/usr/bin/env bash
# Builds and deploys to Guy's personal Cloudflare account.
# First time only, sign in once:
#   XDG_CONFIG_HOME="$HOME/.config/guyavnaim-wrangler" npx wrangler login
# Run from the repo root. Wrangler hangs on Node 20, so Node from /usr/local/bin comes first.
set -euo pipefail
export PATH="/usr/local/bin:$HOME/.bun/bin:$PATH"
export XDG_CONFIG_HOME="$HOME/.config/guyavnaim-wrangler"
export WRANGLER_SEND_METRICS=false
unset CF_API_TOKEN CF_ACCOUNT_ID CLOUDFLARE_API_TOKEN
empty="$(mktemp)"
trap 'rm -f "$empty"' EXIT
bun run build
# An empty env file stops Wrangler reading .env, whose token can only upload gallery media.
node_modules/.bin/wrangler deploy --env-file "$empty"
