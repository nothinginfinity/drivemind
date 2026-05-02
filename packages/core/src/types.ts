export type TextLikeExtension =
  | "txt"
  | "md"
  | "json"
  | "jsonl"
  | "csv"
  | "html"
  | "xml"
  | "js"
  | "ts"
  | "py"
  | "swift"
  | "sql"
  | "log"
  | "yaml"
  | "toml";

export interface FileRecord {
  file_id: string;
  drive_id: string;
  path: string;
  name: string;
  extension?: string | null;
  mime?: string | null;
  size_bytes: number;
  modified_at?: string | null;
  sha256?: string | null;
  indexed_status: string;
  tags?: string[];
}

export interface DriveManifest {
  manifest_id: string;
  drive_id: string;
  drive_name: string;
  generated_at: string;
  file_count: number;
  total_size_bytes: number;
  files: FileRecord[];
}
