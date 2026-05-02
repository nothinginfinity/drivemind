import type { TextLikeExtension } from "./types";

const TEXT_LIKE_EXTENSIONS = new Set<TextLikeExtension>([
  "txt", "md", "json", "jsonl", "csv", "html", "xml",
  "js", "ts", "py", "swift", "sql", "log", "yaml", "toml"
]);

const ALREADY_COMPRESSED_EXTENSIONS = new Set([
  "zip", "gz", "zst", "rar", "7z",
  "jpg", "jpeg", "png", "heic",
  "mp4", "mov", "mp3", "aac"
]);

export function getExtension(path: string): string | null {
  const last = path.split("/").pop() ?? path;
  const index = last.lastIndexOf(".");
  if (index === -1) return null;
  return last.slice(index + 1).toLowerCase();
}

export function isTextLikeExtension(extension?: string | null): boolean {
  if (!extension) return false;
  return TEXT_LIKE_EXTENSIONS.has(extension as TextLikeExtension);
}

export function isAlreadyCompressedExtension(extension?: string | null): boolean {
  if (!extension) return false;
  return ALREADY_COMPRESSED_EXTENSIONS.has(extension.toLowerCase());
}
