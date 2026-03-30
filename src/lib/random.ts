import { randomBytes } from "node:crypto";

export function secureRandomString(length: number, alphabet: string): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Random length must be a positive integer.");
  }

  if (alphabet.length < 2) {
    throw new Error("Alphabet must contain at least two characters.");
  }

  const limit = Math.floor(256 / alphabet.length) * alphabet.length;
  let output = "";

  while (output.length < length) {
    const chunk = randomBytes(Math.max(length * 2, 32));

    for (const byte of chunk) {
      if (byte >= limit) {
        continue;
      }

      output += alphabet[byte % alphabet.length];

      if (output.length === length) {
        return output;
      }
    }
  }

  return output;
}
