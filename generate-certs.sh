#!/bin/bash

# Self-signed certificate generator for development/testing
# For production, use Let's Encrypt or your certificate authority

set -e

CERT_DIR="backend/certs"
KEY_FILE="$CERT_DIR/server.key"
CERT_FILE="$CERT_DIR/server.cert"

echo "🔐 Generating self-signed SSL certificates..."

# Create directory if it doesn't exist
mkdir -p "$CERT_DIR"

# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo "✅ Certificates generated:"
echo "   Key:  $KEY_FILE"
echo "   Cert: $CERT_FILE"
echo ""
echo "⚠️  These are self-signed certificates for development only!"
echo "   For production, use Let's Encrypt or a trusted CA."
echo ""
echo "To enable HTTPS, update your .env file:"
echo "   USE_HTTPS=true"
echo "   SSL_KEY_PATH=/app/certs/server.key"
echo "   SSL_CERT_PATH=/app/certs/server.cert"
