export function copyToClipboard(text: string): { ok: boolean; message: string } {
  const platform = process.platform;

  const commands =
    platform === "darwin"
      ? [["pbcopy"]]
      : platform === "win32"
        ? [["clip"]]
        : [["wl-copy"], ["xclip", "-selection", "clipboard"], ["xsel", "--clipboard", "--input"]];

  for (const [cmd, ...args] of commands) {
    const result = Bun.spawnSync({
      cmd: [cmd, ...args],
      stdin: new TextEncoder().encode(text),
      stdout: "ignore",
      stderr: "ignore"
    });

    if (result.exitCode === 0) {
      return { ok: true, message: "Copied to clipboard." };
    }
  }

  return { ok: false, message: "Clipboard support is unavailable on this system." };
}
