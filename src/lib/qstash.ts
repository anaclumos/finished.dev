import crypto from "node:crypto";

type VerifyQstashSignatureOptions = {
  signature: string;
  body: string | Buffer;
};

const SIGNATURE_KEY_PREFIX = "v1=";

const getSignatureValue = (signatureHeader: string) => {
  const value = signatureHeader.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith(SIGNATURE_KEY_PREFIX)) {
    return value.slice(SIGNATURE_KEY_PREFIX.length);
  }

  if (!value.includes(",")) {
    return value;
  }

  const parts = value.split(",").map((part) => part.trim());
  const v1Part = parts.find((part) => part.startsWith(SIGNATURE_KEY_PREFIX));
  if (v1Part) {
    return v1Part.slice(SIGNATURE_KEY_PREFIX.length);
  }

  return parts[0] ?? null;
};

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const matchesSignature = (provided: string, key: string, body: string | Buffer) => {
  const base64 = crypto.createHmac("sha256", key).update(body).digest("base64");
  const hex = crypto.createHmac("sha256", key).update(body).digest("hex");
  const base64Url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

  return (
    safeEqual(provided, base64) ||
    safeEqual(provided, base64Url) ||
    safeEqual(provided, hex)
  );
};

export const verifyQstashSignature = ({ signature, body }: VerifyQstashSignatureOptions) => {
  const signatureValue = getSignatureValue(signature);

  if (!signatureValue) {
    return false;
  }

  const keys = [
    process.env.QSTASH_CURRENT_SIGNING_KEY,
    process.env.QSTASH_NEXT_SIGNING_KEY,
  ].filter((value): value is string => Boolean(value));

  if (keys.length === 0) {
    return false;
  }

  return keys.some((key) => matchesSignature(signatureValue, key, body));
};
