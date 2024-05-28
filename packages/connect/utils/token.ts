import OAuth from "oauth-1.0a";

export function encodeToken(token: OAuth.Consumer) {
  return Buffer.from(JSON.stringify(token)).toString("base64");
}

export function decodeToken(secret: string) {
  const text = Buffer.from(secret, "base64").toString("utf-8");
  return JSON.parse(text) as OAuth.Consumer;
}