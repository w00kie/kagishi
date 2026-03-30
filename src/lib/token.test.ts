import { describe, expect, test } from "bun:test";
import { CHARSETS } from "./charsets.ts";
import { estimateEntropyBits } from "./entropy.ts";
import { formatTokenOutput } from "./format.ts";
import { generateToken } from "./token.ts";

describe("generateToken", () => {
  test("generates the default structured token format", () => {
    const result = generateToken();

    expect(result.prefix).toBe("sk");
    expect(result.env).toBe("live");
    expect(result.secretLength).toBe(40);
    expect(result.idSuffix).toBeUndefined();
    expect(result.token).toMatch(/^sk_live_[A-Za-z0-9]{40}$/);
  });

  test("supports an independently generated public id suffix", () => {
    const result = generateToken({
      prefix: "whsec",
      env: "test",
      secretLength: 24,
      includeId: true,
      idLength: 6
    });

    expect(result.token).toMatch(/^whsec_test_[A-Za-z0-9]{24}_[A-Za-z0-9]{6}$/);
    expect(result.idSuffix).toHaveLength(6);
    expect(result.idSuffix).not.toBe(result.secret.slice(-6));
  });

  test("uses only the selected charset", () => {
    const result = generateToken({
      secretLength: 64,
      charset: "hex"
    });

    expect(result.secret).toMatch(/^[0-9a-f]{64}$/);
  });

  test("reports estimated entropy from the secret body only", () => {
    const result = generateToken({
      secretLength: 10,
      charset: "base32",
      includeId: true,
      idLength: 8
    });

    expect(result.estimatedEntropyBits).toBe(estimateEntropyBits(10, CHARSETS.base32.length));
  });
});

describe("formatting", () => {
  test("formats env output for shell usage", () => {
    const result = generateToken({
      prefix: "rk",
      env: "live",
      secretLength: 12
    });

    expect(
      formatTokenOutput(result, {
        format: "env",
        variableName: "API_TOKEN"
      })
    ).toMatch(/^API_TOKEN=rk_live_[A-Za-z0-9]{12}$/);
  });

  test("formats json output with structured metadata", () => {
    const result = generateToken({
      prefix: "pk",
      env: "test",
      secretLength: 16,
      includeId: true,
      idLength: 4
    });

    const parsed = JSON.parse(
      formatTokenOutput(result, {
        format: "json",
        variableName: "IGNORED"
      })
    );

    expect(parsed.prefix).toBe("pk");
    expect(parsed.environment).toBe("test");
    expect(parsed.secretLength).toBe(16);
    expect(parsed.idSuffix).toHaveLength(4);
  });
});
