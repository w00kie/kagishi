export const CHARSETS = {
  alnum: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  base32: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  hex: "0123456789abcdef",
  urlsafe: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_",
} as const;

export type CharsetMode = keyof typeof CHARSETS;

export function getCharset(mode: CharsetMode): string {
  return CHARSETS[mode];
}

export function isCharsetMode(value: string): value is CharsetMode {
  return value in CHARSETS;
}
