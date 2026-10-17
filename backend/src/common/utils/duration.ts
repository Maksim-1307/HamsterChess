const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

/**
 * Parses a human duration like "1h", "7d", "30m" or a raw number of seconds
 * into milliseconds (used for cookie maxAge).
 */
export function parseDurationToMs(value: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d|w)$/i.exec(value.trim());
  if (!match) {
    const seconds = Number(value);
    if (Number.isFinite(seconds)) {
      return seconds * 1000;
    }
    throw new Error(`Invalid duration value: "${value}"`);
  }

  const amount = Number(match[1]);
  return amount * UNIT_TO_MS[match[2].toLowerCase()];
}
