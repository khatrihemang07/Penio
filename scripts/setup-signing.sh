#!/bin/bash
# Run once on your dev machine.
# Creates a stable self-signed signing cert in a dedicated keychain so that
# macOS TCC (Accessibility / Input Monitoring) permissions survive app updates.
set -e

CERT_NAME="Penio Dev"
KEYCHAIN="$HOME/Library/Keychains/penio-signing.keychain-db"
KEYCHAIN_PASS="peniosigning"

# Remove any old keychain
security delete-keychain "$KEYCHAIN" 2>/dev/null || true

# Create dedicated keychain
security create-keychain -p "$KEYCHAIN_PASS" "$KEYCHAIN"
security unlock-keychain -p "$KEYCHAIN_PASS" "$KEYCHAIN"
security set-keychain-settings -u "$KEYCHAIN"  # disable auto-lock

# Add to user keychain search list alongside login keychain
security list-keychains -d user -s "$HOME/Library/Keychains/login.keychain-db" "$KEYCHAIN"

# Generate self-signed cert with code signing extension
openssl req -x509 -newkey rsa:2048 -keyout /tmp/penio-pk.pem -out /tmp/penio-cert.pem \
  -days 3650 -nodes -subj "/CN=$CERT_NAME" \
  -addext "keyUsage=critical,digitalSignature" \
  -addext "extendedKeyUsage=codeSigning"

# Package as p12 and import into keychain
openssl pkcs12 -export -out /tmp/penio-signing.p12 \
  -inkey /tmp/penio-pk.pem -in /tmp/penio-cert.pem -passout pass:"$KEYCHAIN_PASS"

security import /tmp/penio-signing.p12 -P "$KEYCHAIN_PASS" -T /usr/bin/codesign \
  -k "$KEYCHAIN"
security set-key-partition-list -S apple-tool:,apple: -s -k "$KEYCHAIN_PASS" "$KEYCHAIN"

# Cleanup
rm /tmp/penio-pk.pem /tmp/penio-cert.pem /tmp/penio-signing.p12

echo ""
echo "Done! '$CERT_NAME' installed in $KEYCHAIN"
echo "Tauri will now sign with this identity (signingIdentity: \"$CERT_NAME\" in tauri.conf.json)."
echo ""
echo "To add the cert to CI, re-run this script and then:"
echo "  security export -k \"$KEYCHAIN\" -t identities -f pkcs12 -o /tmp/penio-signing.p12 -P \"$KEYCHAIN_PASS\""
echo "  base64 -i /tmp/penio-signing.p12 | gh secret set SELF_SIGNED_CERT_P12 -R <owner/repo>"
