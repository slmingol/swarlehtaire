#!/bin/sh
set -e

VERSION=$(cat /usr/share/nginx/html/version.txt 2>/dev/null || echo "unknown")
BUILD_DATE=$(cat /usr/share/nginx/html/build-date.txt 2>/dev/null || echo "unknown")

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║           S W A R L E H T A I R E        ║"
echo "╠══════════════════════════════════════════╣"
echo "║  Version   : ${VERSION}"
echo "║  Built     : ${BUILD_DATE}"
echo "║  Source    : github.com/slmingol/swarlehtaire"
echo "╚══════════════════════════════════════════╝"
echo ""
