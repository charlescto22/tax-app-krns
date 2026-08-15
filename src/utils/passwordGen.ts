const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const SPECIAL = "!@#$%&*";

function pick(chars: string): string {
  const idx = Math.floor(Math.random() * chars.length);
  return chars[idx];
}

/** Generates a strong temporary password meeting app strength rules. */
export function generateSecurePassword(length = 14): string {
  const required = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SPECIAL)];
  const all = UPPER + LOWER + DIGITS + SPECIAL;
  const rest = Array.from({ length: Math.max(length - required.length, 0) }, () => pick(all));
  const chars = [...required, ...rest];
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
