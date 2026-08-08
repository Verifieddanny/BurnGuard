#!/bin/sh
set -e

REPO="Verifieddanny/BunGuard"
BINARY="burnguard"

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
case "$ARCH" in
    x86_64) ARCH="amd64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

echo "Detecting system: $OS/$ARCH"

LATEST=$(curl -sI "https://github.com/$REPO/releases/latest" | grep -i "^location:" | sed 's/.*tag\///' | tr -d '\r\n')

if [ -z "$LATEST" ]; then
    echo "Failed to fetch latest version"
    exit 1
fi

URL="https://github.com/$REPO/releases/download/$LATEST/${BINARY}_${OS}_${ARCH}.tar.gz"

echo "Downloading BurnGuard $LATEST..."

TMPDIR=$(mktemp -d)
curl -sL "$URL" -o "$TMPDIR/burnguard.tar.gz"
tar xzf "$TMPDIR/burnguard.tar.gz" -C "$TMPDIR"

INSTALL_DIR="/usr/local/bin"
if [ ! -w "$INSTALL_DIR" ]; then
    echo "Need sudo to install to $INSTALL_DIR"
    sudo mv "$TMPDIR/$BINARY" "$INSTALL_DIR/$BINARY"
else
    mv "$TMPDIR/$BINARY" "$INSTALL_DIR/$BINARY"
fi

chmod +x "$INSTALL_DIR/$BINARY"
rm -rf "$TMPDIR"

echo ""
echo "✅ BurnGuard $LATEST installed successfully!"
echo ""
echo "Get started:"
echo "  burnguard init    # interactive setup wizard"
echo "  burnguard start   # start the proxy"
echo ""