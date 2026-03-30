export function estimateEntropyBits(
  length: number,
  alphabetSize: number,
): number {
  if (length <= 0 || alphabetSize <= 1) {
    return 0;
  }

  return length * Math.log2(alphabetSize);
}

export function formatEntropy(bits: number): string {
  return `${bits.toFixed(bits >= 100 ? 0 : 1)} bits`;
}
