#!/bin/sh
set -eu

RUNTIME_CONFIG_PATH=${RUNTIME_CONFIG_PATH:-/var/www/runtime-config.js}
DEFAULT_BASE_URL=${CONSOLE_API_URL:-${VITE_BASE_URL:-http://localhost:8080/}}

escape_for_js() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

mkdir -p "$(dirname "$RUNTIME_CONFIG_PATH")"

BASE_URL_ESCAPED=$(escape_for_js "$DEFAULT_BASE_URL")
cat <<EOF > "$RUNTIME_CONFIG_PATH"
window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
window.__APP_CONFIG__.BASE_URL = "$BASE_URL_ESCAPED";
EOF

exec nginx -g "daemon off;"
