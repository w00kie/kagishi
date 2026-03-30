export function renderHelp(): string {
  return `
kagishi
Generate structured, provider-style API tokens with Bun.

Usage:
  kagishi                 Launch the interactive wizard
  kagishi generate [flags]
  kagishi help

Generate flags:
  --prefix <value>        Token prefix (default: sk)
  --env <value>           Environment segment (default: live)
  --length <number>       Secret body length (default: 40)
  --with-id               Add an independently generated public ID suffix
  --no-id                 Explicitly disable the public ID suffix
  --id-length <number>    Public ID suffix length (default: 8)
  --charset <mode>        alnum | base32 | hex | urlsafe
  --format <mode>         plain | env | json
  --var-name <name>       Variable name for env output (default: API_TOKEN)
  --count <number>        Generate multiple tokens (default: 1)
  --separator <value>     Segment separator (default: _)
  --entropy-bits <bits>   Minimum secret entropy target
  --copy                  Copy the last generated token to clipboard
  --quiet                 Suppress non-essential wizard text
  -h, --help              Show help

Examples:
  kagishi generate --prefix sk --env live
  kagishi generate --prefix whsec --env prod --length 48 --format env --var-name WEBHOOK_SECRET
  kagishi generate --with-id --id-length 6 --format json
`.trim();
}
