# kagishi

`kagishi` (鍵師, "locksmith") is an open-source Bun CLI for generating structured API tokens in the style of Stripe, Clerk, and OpenAI keys.

It produces prefix-based, URL-safe, shell-safe secrets such as `sk_live_...`, `pk_test_...`, `whsec_live_...`, and `rk_live_...`, with production-friendly defaults and a guided zero-argument wizard.

## Why it exists

Modern API keys are usually more than random blobs:

- They have a recognizable prefix.
- They often encode an environment like `live` or `test`.
- They avoid awkward characters that break shells, `.env` files, URLs, and headers.
- They sometimes include a short public identifier for support, rotation, and debugging workflows.

`kagishi` packages those conventions into a small CLI without trying to manage storage, rotation, or backend validation for you.

## Install

### Run with `bunx`

```bash
bunx kagishi generate --prefix sk --env live
```

### Install globally

```bash
bun install -g kagishi
kagishi generate --prefix whsec --env live --length 48
```

### Homebrew

Homebrew tap support is planned, but not yet published.

## Usage

### Interactive mode

Running `kagishi` with no arguments launches the guided wizard:

```bash
kagishi
```

The wizard helps choose:

- token type / preset
- prefix
- environment segment
- secret length
- whether to include a public ID suffix
- output format
- whether to copy the final token to the clipboard

### CLI mode

```bash
kagishi generate [flags]
```

Supported commands:

- `kagishi generate`
- `kagishi help`

## Examples

Generate a default secret key:

```bash
kagishi generate
```

Generate a webhook secret:

```bash
kagishi generate --prefix whsec --env live --length 48
```

Generate a key with a public ID suffix:

```bash
kagishi generate --prefix rk --env live --with-id --id-length 6
```

Print as an environment variable assignment:

```bash
kagishi generate --format env --var-name API_TOKEN
```

Print structured JSON for scripts:

```bash
kagishi generate --format json --with-id
```

Generate multiple tokens:

```bash
kagishi generate --count 5 --prefix sk --env test
```

## Flags

### Core generation flags

- `--prefix sk`
- `--env live`
- `--length 48`
- `--id-length 8`
- `--with-id`
- `--no-id`
- `--charset alnum`
- `--format plain|env|json`
- `--var-name API_TOKEN`
- `--count 5`

### Extra flags

- `--separator _`
- `--entropy-bits 192`
- `--copy`
- `--quiet`

## Token format

The default pattern is:

```text
<prefix>_<env>_<random>
```

When a public identifier is enabled:

```text
<prefix>_<env>_<random>_<id>
```

Examples:

- `sk_live_VJ4L6oI8...`
- `pk_test_uY7smkC2...`
- `whsec_live_hWJQ2..._A7KD12`

## Charset and safety choices

By default, `kagishi` uses an alphanumeric charset.

That keeps generated tokens friendly for:

- `.env` files
- shell commands
- URLs
- HTTP headers
- logs and support tooling

`kagishi` intentionally avoids raw base64 output because traditional base64 introduces characters like `+`, `/`, and `=` padding, which are more awkward in environment files, shells, URL contexts, and copy/paste workflows.

Supported charset modes in the MVP:

- `alnum`
- `base32`
- `hex`
- `urlsafe`

## Security notes

- `kagishi` uses cryptographically secure randomness via `node:crypto`.
- The default secret body length is `40` alphanumeric characters, which is roughly `238` bits of entropy.
- The optional trailing ID is public metadata, not part of the security boundary.
- The ID suffix is generated independently by default; it is not derived from the secret body.
- If you store generated tokens in a backend, prefer hashing secrets at rest instead of storing them in plaintext.
- `kagishi` only generates tokens. It does not store, validate, rotate, or revoke them.
- A checksum, if ever added in the future, should be clearly distinct from the public ID suffix.

## Development

```bash
bun test
```

## Publishing notes

This package is prepared as a Bun executable via the `bin` field and a Bun shebang entrypoint, making it suitable for:

- `bunx kagishi`
- global executable installs
- future Homebrew packaging

## License

MIT. See [LICENSE](/Users/francois/Projects/kagishi/LICENSE).
