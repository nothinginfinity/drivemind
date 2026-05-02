export type IndexedStatus =
  | "pending"
  | "indexed_metadata"
  | "indexed_text"
  | "skipped_binary"
  | "skipped_too_large"
  | "error";

export interface DriveRecord {
  drive_id: string;
  name: string;
  root_label?: string;
  created_at: string;
  last_indexed_at?: string | null;
}

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
  indexed_status: IndexedStatus;
  tags?: string[];
}
