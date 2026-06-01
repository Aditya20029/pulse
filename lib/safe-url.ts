/**
 * Returns the URL only if it uses a safe scheme (http/https). Anything else
 * (javascript:, data:, vbscript:, etc.) is rejected and replaced with "#" so a
 * malicious news-source URL cannot execute script when clicked.
 */
export function safeUrl(url: string | undefined | null): string {
  if (!url) return "#";
  // Strip whitespace / control chars that could obfuscate a scheme
  // (e.g. a newline inside "java\nscript:") before parsing.
  const cleaned = url.replace(/\s/g, "");
  if (!cleaned) return "#";
  try {
    const parsed = new URL(cleaned, "https://global-pulse-ai.site");
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "#";
  } catch {
    return "#";
  }
}

/** True if the URL is safe to open/navigate. */
export function isSafeUrl(url: string | undefined | null): boolean {
  return safeUrl(url) !== "#";
}
