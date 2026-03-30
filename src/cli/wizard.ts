import {
  cancel,
  confirm,
  intro,
  isCancel,
  note,
  select,
  text,
} from "@clack/prompts";
import type { CharsetMode } from "../lib/charsets.ts";
import { copyToClipboard } from "../lib/clipboard.ts";
import { formatEntropy } from "../lib/entropy.ts";
import { formatTokenOutput, type OutputFormat } from "../lib/format.ts";
import { generateToken, type TokenOptions } from "../lib/token.ts";

export async function runWizard(): Promise<number> {
  intro("kagishi  鍵師");

  const preset = await requiredPrompt(
    select({
      message: "What kind of token are you generating?",
      initialValue: "Secret API key",
      options: [
        {
          value: "Secret API key",
          label: "Secret API key",
          hint: "Stripe/OpenAI-style default",
        },
        {
          value: "Publishable key",
          label: "Publishable key",
          hint: "Public client-side token shape",
        },
        {
          value: "Webhook secret",
          label: "Webhook secret",
          hint: "Longer secret with public lookup suffix",
        },
        {
          value: "Restricted key",
          label: "Restricted key",
          hint: "Scoped server-side credentials",
        },
        {
          value: "Custom",
          label: "Custom",
          hint: "Start from a flexible default",
        },
      ],
    }),
  );

  const defaults = getPresetDefaults(preset);
  const prefix = await requiredText(
    "Prefix",
    defaults.prefix,
    "Default comes from the selected token kind, but you can override it.",
  );
  const env = await chooseEnvironment(defaults.env);
  const secretLength = await requiredNumber(
    "Secret length",
    defaults.secretLength,
    "Sensible production default; longer secrets increase entropy.",
  );
  const includeId = await requiredConfirm(
    "Include a public ID suffix?",
    defaults.includeId,
  );
  const idLength = includeId
    ? await requiredNumber(
        "Public ID length",
        defaults.idLength,
        "Sensible default for debugging and support lookups, not security.",
      )
    : defaults.idLength;
  const charset = await requiredPrompt<CharsetMode>(
    select({
      message: "Charset",
      initialValue: defaults.charset,
      options: [
        {
          value: "alnum",
          label: "alnum",
          hint: "Default: compact and shell-safe",
        },
        {
          value: "base32",
          label: "base32",
          hint: "Case-insensitive-friendly alphabet",
        },
        { value: "hex", label: "hex", hint: "Longest but familiar" },
        { value: "urlsafe", label: "urlsafe", hint: "Includes - and _" },
      ],
    }),
  );
  const format = await requiredPrompt<OutputFormat>(
    select({
      message: "Output format",
      initialValue: "plain",
      options: [
        { value: "plain", label: "plain", hint: "Print just the token" },
        {
          value: "env",
          label: "env",
          hint: "Shell assignment like API_TOKEN=...",
        },
        { value: "json", label: "json", hint: "Structured output for scripts" },
      ],
    }),
  );
  const variableName =
    format === "env"
      ? await requiredText(
          "Variable name",
          getDefaultVariableName(preset),
          "Used only for env output.",
        )
      : "API_TOKEN";

  const options: TokenOptions = {
    prefix,
    env,
    secretLength,
    separator: "_",
    charset,
    includeId,
    idLength,
  };

  const shouldCopy = await requiredConfirm(
    "Copy the final token to clipboard?",
    false,
  );

  const finalToken = generateToken(options);
  note(
    formatTokenOutput(finalToken, { format, variableName }),
    `Generated token - ${formatEntropy(finalToken.estimatedEntropyBits)}`,
  );

  if (shouldCopy) {
    const result = copyToClipboard(finalToken.token);
    note(result.message, "Clipboard");
  }
  return 0;
}

function getPresetDefaults(
  preset: string,
): Pick<
  TokenOptions,
  "prefix" | "env" | "secretLength" | "includeId" | "idLength" | "charset"
> {
  switch (preset) {
    case "Publishable key":
      return {
        prefix: "pk",
        env: "test",
        secretLength: 32,
        includeId: false,
        idLength: 8,
        charset: "alnum",
      };
    case "Webhook secret":
      return {
        prefix: "whsec",
        env: "live",
        secretLength: 48,
        includeId: true,
        idLength: 8,
        charset: "alnum",
      };
    case "Restricted key":
      return {
        prefix: "rk",
        env: "live",
        secretLength: 40,
        includeId: true,
        idLength: 8,
        charset: "alnum",
      };
    case "Custom":
      return {
        prefix: "sk",
        env: "live",
        secretLength: 40,
        includeId: false,
        idLength: 8,
        charset: "alnum",
      };
    default:
      return {
        prefix: "sk",
        env: "live",
        secretLength: 40,
        includeId: false,
        idLength: 8,
        charset: "alnum",
      };
  }
}

function getDefaultVariableName(preset: string): string {
  switch (preset) {
    case "Publishable key":
      return "PUBLISHABLE_KEY";
    case "Webhook secret":
      return "WEBHOOK_SECRET";
    case "Restricted key":
      return "RESTRICTED_API_KEY";
    case "Custom":
      return "API_TOKEN";
    default:
      return "API_KEY";
  }
}

async function requiredText(
  message: string,
  defaultValue: string,
  placeholder?: string,
): Promise<string> {
  return requiredPrompt(
    text({
      message,
      initialValue: defaultValue,
      defaultValue,
      placeholder,
      validate(value) {
        if (!value.trim()) {
          return `${message} cannot be empty.`;
        }
      },
    }),
  );
}

async function requiredNumber(
  message: string,
  defaultValue: number,
  placeholder?: string,
): Promise<number> {
  const value = await requiredPrompt(
    text({
      message,
      initialValue: String(defaultValue),
      defaultValue: String(defaultValue),
      placeholder,
      validate(raw) {
        const parsed = Number.parseInt(raw, 10);
        if (!Number.isInteger(parsed) || parsed <= 0) {
          return "Enter a positive integer.";
        }
      },
    }),
  );

  return Number.parseInt(value, 10);
}

async function requiredConfirm(
  message: string,
  initialValue: boolean,
): Promise<boolean> {
  return requiredPrompt(
    confirm({
      message,
      initialValue,
    }),
  );
}

async function chooseEnvironment(defaultValue: string): Promise<string> {
  const selected = await requiredPrompt(
    select({
      message: "Environment segment",
      initialValue:
        defaultValue === "test"
          ? "test"
          : defaultValue === "live"
            ? "live"
            : "other",
      options: [
        { value: "live", label: "live", hint: "Production credentials" },
        {
          value: "test",
          label: "test",
          hint: "Sandbox or staging credentials",
        },
        {
          value: "other",
          label: "other",
          hint: `Use a custom segment${defaultValue !== "live" && defaultValue !== "test" ? ` (${defaultValue})` : ""}`,
        },
      ],
    }),
  );

  if (selected === "other") {
    return requiredText(
      "Custom environment segment",
      defaultValue,
      "Examples: dev, prod, preview.",
    );
  }

  return selected;
}

async function requiredPrompt<T>(promise: Promise<T | symbol>): Promise<T> {
  const value = await promise;

  if (isCancel(value)) {
    cancel("Cancelled.");
    process.exit(0);
  }

  return value as T;
}
