import { constants, createPrivateKey, sign } from "node:crypto";
import { readFileSync } from "node:fs";

/**
 * Kalshi Trade API auth: API Key ID + RSA-PSS-SHA256 signature per request.
 * https://docs.kalshi.com/getting_started/quick_start_authenticated_requests
 */
export function loadKalshiPrivateKeyPem(): string | null {
  const path = process.env.KALSHI_PRIVATE_KEY_PATH?.trim();
  if (path) {
    try {
      return readFileSync(path, "utf8").trim();
    } catch {
      return null;
    }
  }

  const inline = process.env.KALSHI_PRIVATE_KEY?.trim();
  if (inline) {
    return inline.replace(/\\n/g, "\n");
  }
  return null;
}

export function getKalshiAccessKeyId(): string | null {
  return process.env.KALSHI_ACCESS_KEY_ID?.trim() || null;
}

export function hasKalshiRsaCredentials(): boolean {
  return Boolean(getKalshiAccessKeyId() && loadKalshiPrivateKeyPem());
}

export function buildKalshiAuthHeaders(
  method: string,
  requestUrl: string,
  privateKeyPem: string,
  accessKeyId: string
): Record<string, string> {
  const url = new URL(requestUrl);
  const pathForSign = url.pathname;
  const timestamp = String(Date.now());
  const message = `${timestamp}${method.toUpperCase()}${pathForSign}`;

  const key = createPrivateKey({ key: privateKeyPem, format: "pem" });
  const signature = sign("sha256", Buffer.from(message, "utf8"), {
    key,
    padding: constants.RSA_PKCS1_PSS_PADDING,
    saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
  });

  return {
    "KALSHI-ACCESS-KEY": accessKeyId,
    "KALSHI-ACCESS-TIMESTAMP": timestamp,
    "KALSHI-ACCESS-SIGNATURE": signature.toString("base64"),
  };
}
