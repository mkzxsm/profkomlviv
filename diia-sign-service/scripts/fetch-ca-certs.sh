#!/usr/bin/env bash
# Завантажує актуальні сертифікати ЦСК (ІІТ) для перевірки підписів Дія.Підпис.
# Використання: scripts/fetch-ca-certs.sh [test|prod] [каталог]
set -euo pipefail
ENVIRONMENT="${1:-test}"
DEST="${2:-DiiaSign.Api/certs}"
mkdir -p "$DEST"
case "$ENVIRONMENT" in
  test) FILE="CACertificates.Test.All.p7b" ;;
  prod) FILE="CACertificates.p7b" ;;
  *) echo "usage: $0 [test|prod] [dir]" >&2; exit 1 ;;
esac
curl -fsSL --proto '=https' --tlsv1.2 -o "$DEST/$FILE.tmp" "https://iit.com.ua/download/productfiles/$FILE"
mv "$DEST/$FILE.tmp" "$DEST/$FILE"
echo "Saved $DEST/$FILE"
