import { describe, expect, test } from "bun:test";
import { secureRandomString } from "./random.ts";

describe("secureRandomString", () => {
  test("generates the requested length from the supplied alphabet", () => {
    const value = secureRandomString(64, "abc123");

    expect(value).toHaveLength(64);
    expect(value).toMatch(/^[abc123]+$/);
  });

  test("rejects alphabets with duplicate characters", () => {
    expect(() => secureRandomString(8, "aabc")).toThrow(
      "Alphabet characters must be unique.",
    );
  });

  test("rejects alphabets larger than one byte of entropy mapping", () => {
    const alphabet = Array.from({ length: 257 }, (_, index) =>
      String.fromCodePoint(index),
    ).join("");

    expect(() => secureRandomString(8, alphabet)).toThrow(
      "Alphabet cannot contain more than 256 characters.",
    );
  });
});
