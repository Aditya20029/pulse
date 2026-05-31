/**
 * Repair an incomplete JSON string by closing unterminated strings, arrays, and
 * objects so it can be parsed mid-stream. Used to render partial Claude
 * responses progressively while still parsing into a structured object.
 */
export function repairPartialJson(input: string): string {
  let s = input.trim();

  // Cut anything before the first { (Claude sometimes prefixes commentary)
  const firstBrace = s.indexOf("{");
  if (firstBrace > 0) s = s.slice(firstBrace);
  if (firstBrace < 0) return "";

  // Cut anything after the last } if balanced; otherwise repair.
  const stack: string[] = [];
  let inString = false;
  let escape = false;
  let lastValidEnd = -1;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch === "}" || ch === "]") {
      stack.pop();
      if (stack.length === 0) lastValidEnd = i;
    }
  }

  if (stack.length === 0 && lastValidEnd >= 0) {
    return s.slice(0, lastValidEnd + 1);
  }

  // Repair: close unterminated string, then close all open brackets
  let repaired = s;
  if (inString) repaired += '"';

  // Trim trailing comma / partial key before closing
  repaired = repaired.replace(/,\s*$/, "").replace(/:\s*$/, ': ""').replace(/,(\s*[}\]])/g, "$1");

  while (stack.length > 0) {
    const open = stack.pop();
    repaired += open === "{" ? "}" : "]";
  }
  return repaired;
}

export function safeParseJson<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

export function parsePartial<T>(input: string): T | null {
  const repaired = repairPartialJson(input);
  if (!repaired) return null;
  return safeParseJson<T>(repaired);
}
