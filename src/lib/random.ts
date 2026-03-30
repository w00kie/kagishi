export function secureRandomString(length: number, alphabet: string): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Random length must be a positive integer.");
  }

  if (alphabet.length < 2) {
    throw new Error("Alphabet must contain at least two characters.");
  }

  if (alphabet.length > 256) {
    throw new Error("Alphabet cannot contain more than 256 characters.");
  }

  if (new Set(alphabet).size !== alphabet.length) {
    throw new Error("Alphabet characters must be unique.");
  }

  const limit = Math.floor(256 / alphabet.length) * alphabet.length;
  const output: string[] = [];

  while (output.length < length) {
    const remaining = length - output.length;
    const chunk = new Uint8Array(Math.max(remaining * 2, 32));
    crypto.getRandomValues(chunk);

    for (const byte of chunk) {
      if (byte >= limit) {
        continue;
      }

      output.push(alphabet[byte % alphabet.length]);

      if (output.length === length) {
        return output.join("");
      }
    }
  }

  return output.join("");
}
