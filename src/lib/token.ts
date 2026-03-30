import { getCharset, type CharsetMode } from "./charsets.ts";
import { estimateEntropyBits } from "./entropy.ts";
import { secureRandomString } from "./random.ts";

export interface TokenOptions {
  prefix: string;
  env: string;
  secretLength: number;
  separator: string;
  charset: CharsetMode;
  includeId: boolean;
  idLength: number;
}

export interface TokenResult {
  token: string;
  prefix: string;
  env: string;
  separator: string;
  charset: CharsetMode;
  secret: string;
  secretLength: number;
  idSuffix?: string;
  estimatedEntropyBits: number;
}

export const DEFAULT_TOKEN_OPTIONS: TokenOptions = {
  prefix: "sk",
  env: "live",
  secretLength: 40,
  separator: "_",
  charset: "alnum",
  includeId: false,
  idLength: 8
};

export function generateToken(options: Partial<TokenOptions> = {}): TokenResult {
  const resolved = { ...DEFAULT_TOKEN_OPTIONS, ...options };
  validateTokenOptions(resolved);

  const alphabet = getCharset(resolved.charset);
  const secret = secureRandomString(resolved.secretLength, alphabet);
  const parts = [resolved.prefix, resolved.env, secret];

  let idSuffix: string | undefined;
  if (resolved.includeId) {
    idSuffix = secureRandomString(resolved.idLength, alphabet);
    parts.push(idSuffix);
  }

  return {
    token: parts.join(resolved.separator),
    prefix: resolved.prefix,
    env: resolved.env,
    separator: resolved.separator,
    charset: resolved.charset,
    secret,
    secretLength: resolved.secretLength,
    idSuffix,
    estimatedEntropyBits: estimateEntropyBits(resolved.secretLength, alphabet.length)
  };
}

export function validateTokenOptions(options: TokenOptions): void {
  const segments = [
    ["prefix", options.prefix],
    ["env", options.env],
    ["separator", options.separator]
  ] as const;

  if (!Number.isInteger(options.secretLength) || options.secretLength <= 0) {
    throw new Error("Secret length must be a positive integer.");
  }

  if (!Number.isInteger(options.idLength) || options.idLength <= 0) {
    throw new Error("ID length must be a positive integer.");
  }

  for (const [name, value] of segments) {
    if (!value.trim()) {
      throw new Error(`${name} cannot be empty.`);
    }
  }

  if (options.prefix.includes(options.separator) || options.env.includes(options.separator)) {
    throw new Error("Prefix and env cannot contain the active separator.");
  }

  if (!/^[A-Za-z0-9_-]+$/.test(options.prefix)) {
    throw new Error("Prefix must only contain URL-safe, shell-safe characters.");
  }

  if (!/^[A-Za-z0-9_-]+$/.test(options.env)) {
    throw new Error("Environment must only contain URL-safe, shell-safe characters.");
  }

  if (!/^[A-Za-z0-9_-]+$/.test(options.separator)) {
    throw new Error("Separator must be URL-safe and shell-safe.");
  }
}
