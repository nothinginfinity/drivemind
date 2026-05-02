export interface TextChunk {
  chunk_id: string;
  file_id: string;
  chunk_index: number;
  text: string;
  token_estimate: number;
}

export function chunkText(input: {
  fileId: string;
  text: string;
  maxChars?: number;
}): TextChunk[] {
  const maxChars = input.maxChars ?? 4000;
  const chunks: TextChunk[] = [];

  for (let start = 0; start < input.text.length; start += maxChars) {
    const text = input.text.slice(start, start + maxChars);
    const chunkIndex = chunks.length;

    chunks.push({
      chunk_id: `${input.fileId}_chunk_${chunkIndex}`,
      file_id: input.fileId,
      chunk_index: chunkIndex,
      text,
      token_estimate: Math.ceil(text.length / 4)
    });
  }

  return chunks;
}
