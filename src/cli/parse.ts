import { isCharsetMode, type CharsetMode } from "../lib/charsets.ts";
import type { OutputFormat } from "../lib/format.ts";

export interface ParsedArgs {
  command: "generate" | "help";
  options: {
    prefix: string;
    env: string;
    length: number;
    idLength: number;
    includeId: boolean;
    charset: CharsetMode;
    format: OutputFormat;
    variableName: string;
    count: number;
    separator: string;
    entropyBits?: number;
    copy: boolean;
    quiet: boolean;
  };
  positionals: string[];
}

const DEFAULTS: ParsedArgs["options"] = {
  prefix: "sk",
  env: "live",
  length: 40,
  idLength: 8,
  includeId: false,
  charset: "alnum",
  format: "plain",
  variableName: "API_TOKEN",
  count: 1,
  separator: "_",
  entropyBits: undefined,
  copy: false,
  quiet: false
};

export function parseArgv(argv: string[]): ParsedArgs {
  const commandArg = argv[0];
  const command =
    !commandArg || commandArg.startsWith("-")
      ? "generate"
      : isCommand(commandArg)
        ? commandArg
        : "generate";

  const args = command === "generate" && commandArg && !isCommand(commandArg) ? argv : argv.slice(1);
  const options = { ...DEFAULTS };
  const positionals: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg.startsWith("-")) {
      positionals.push(arg);
      continue;
    }

    if (arg === "--with-id") {
      options.includeId = true;
      continue;
    }

    if (arg === "--no-id") {
      options.includeId = false;
      continue;
    }

    if (arg === "--copy") {
      options.copy = true;
      continue;
    }

    if (arg === "--quiet") {
      options.quiet = true;
      continue;
    }

    const [flag, inlineValue] = arg.split("=", 2);
    const value = inlineValue ?? args[index + 1];

    if (!inlineValue) {
      index += 1;
    }

    switch (flag) {
      case "--prefix":
        options.prefix = requireValue(flag, value);
        break;
      case "--env":
        options.env = requireValue(flag, value);
        break;
      case "--length":
        options.length = parsePositiveInt(flag, value);
        break;
      case "--id-length":
        options.idLength = parsePositiveInt(flag, value);
        break;
      case "--charset":
        options.charset = parseCharset(flag, value);
        break;
      case "--format":
        options.format = parseFormat(flag, value);
        break;
      case "--var-name":
        options.variableName = requireValue(flag, value);
        break;
      case "--count":
        options.count = parsePositiveInt(flag, value);
        break;
      case "--separator":
        options.separator = requireValue(flag, value);
        break;
      case "--entropy-bits":
        options.entropyBits = parsePositiveInt(flag, value);
        break;
      case "-h":
      case "--help":
        return { command: "help", options, positionals };
      default:
        throw new Error(`Unknown flag: ${flag}`);
    }
  }

  if (options.entropyBits) {
    const alphabetSize =
      options.charset === "alnum" ? 62 : options.charset === "base32" ? 32 : options.charset === "hex" ? 16 : 64;
    options.length = Math.max(options.length, Math.ceil(options.entropyBits / Math.log2(alphabetSize)));
  }

  return { command, options, positionals };
}

function requireValue(flag: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing value for ${flag}`);
  }

  return value;
}

function parsePositiveInt(flag: string, value: string | undefined): number {
  const parsed = Number.parseInt(requireValue(flag, value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer.`);
  }
  return parsed;
}

function parseCharset(flag: string, value: string | undefined): CharsetMode {
  const parsed = requireValue(flag, value);
  if (!isCharsetMode(parsed)) {
    throw new Error(`${flag} must be one of alnum, base32, hex, urlsafe.`);
  }
  return parsed;
}

function parseFormat(flag: string, value: string | undefined): OutputFormat {
  const parsed = requireValue(flag, value);
  if (parsed === "plain" || parsed === "env" || parsed === "json") {
    return parsed;
  }
  throw new Error(`${flag} must be one of plain, env, json.`);
}

function isCommand(value: string): value is ParsedArgs["command"] {
  return value === "generate" || value === "help";
}
