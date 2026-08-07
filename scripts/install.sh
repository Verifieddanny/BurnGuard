#!/bin/sh
set -e

REPO="Verifieddanny/BunGuard"
BINARY="burnguard"

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
case "$ARCH" in
    x86_64) ARCH="amd64" ;;
    aarch64|arm64) ARCH="arm64" ;;
esac

LATEST=$(curl -sI "https://github.com/$REPO/releases/latest" | grep -i location | sed 's/.*tag\///' | tr -d '\r\n')
URL="https://github.com/$REPO/releases/download/$LATEST/${BINARY}_${OS}_${ARCH}.tar.gz"

echo "Downloading BurnGuard $LATEST for $OS/$ARCH..."
curl -sL "$URL" | tar xz -C /usr/local/bin "$BINARY"
chmod +x "/usr/local/bin/$BINARY"
echo "✅ BurnGuard installed. Run 'burnguard init' to get started."