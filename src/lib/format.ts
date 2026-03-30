import type { TokenResult } from "./token.ts";

export type OutputFormat = "plain" | "env" | "json";

export interface OutputOptions {
  format: OutputFormat;
  variableName: string;
  quiet?: boolean;
}

export function formatTokenOutput(result: TokenResult, options: OutputOptions): string {
  switch (options.format) {
    case "plain":
      return result.token;
    case "env":
      return `${options.variableName}=${result.token}`;
    case "json":
      return JSON.stringify(
        {
          token: result.token,
          prefix: result.prefix,
          environment: result.env,
          separator: result.separator,
          charset: result.charset,
          secretLength: result.secretLength,
          idSuffix: result.idSuffix ?? null,
          estimatedEntropyBits: Number(result.estimatedEntropyBits.toFixed(2))
        },
        null,
        2
      );
  }
}
