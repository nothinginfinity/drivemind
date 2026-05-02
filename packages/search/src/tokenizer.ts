export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9_/-]+/i)
    .filter(Boolean);
}
