import { isAlreadyCompressedExtension, isTextLikeExtension } from "./fileTypes";

export type IndexDecision =
  | "index_text"
  | "metadata_only"
  | "skip_binary"
  | "skip_too_large";

export function decideIndexingPolicy(input: {
  extension?: string | null;
  sizeBytes: number;
  maxTextBytes?: number;
}): IndexDecision {
  const maxTextBytes = input.maxTextBytes ?? 5_000_000;

  if (input.sizeBytes > maxTextBytes && isTextLikeExtension(input.extension)) {
    return "metadata_only";
  }

  if (isTextLikeExtension(input.extension)) {
    return "index_text";
  }

  if (isAlreadyCompressedExtension(input.extension)) {
    return "metadata_only";
  }

  return "skip_binary";
}
