#!/usr/bin/env bun

import { copyToClipboard } from "./lib/clipboard.ts";
import { formatTokenOutput } from "./lib/format.ts";
import { generateToken } from "./lib/token.ts";
import { renderHelp } from "./cli/help.ts";
import { parseArgv } from "./cli/parse.ts";
import { runWizard } from "./cli/wizard.ts";

async function main() {
  const argv = Bun.argv.slice(2);

  if (argv.length === 0) {
    process.exit(await runWizard());
  }

  try {
    const parsed = parseArgv(argv);

    if (parsed.command === "help") {
      console.log(renderHelp());
      return;
    }

    const results = Array.from({ length: parsed.options.count }, () =>
      generateToken({
        prefix: parsed.options.prefix,
        env: parsed.options.env,
        secretLength: parsed.options.length,
        separator: parsed.options.separator,
        charset: parsed.options.charset,
        includeId: parsed.options.includeId,
        idLength: parsed.options.idLength
      })
    );

    if (parsed.options.format === "json" && parsed.options.count > 1) {
      const payload = results.map((result) =>
        JSON.parse(
          formatTokenOutput(result, {
            format: "json",
            variableName: parsed.options.variableName,
            quiet: parsed.options.quiet
          })
        )
      );

      console.log(JSON.stringify(payload, null, 2));
    } else {
      for (const result of results) {
        console.log(
          formatTokenOutput(result, {
            format: parsed.options.format,
            variableName: parsed.options.variableName,
            quiet: parsed.options.quiet
          })
        );
      }
    }

    if (parsed.options.copy) {
      const copyResult = copyToClipboard(results[results.length - 1].token);
      if (!parsed.options.quiet) {
        console.error(copyResult.message);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`kagishi: ${message}`);
    console.error("Run `kagishi help` for usage.");
    process.exit(1);
  }
}

void main();
