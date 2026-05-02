export type DriveMindMessageType =
  | "CONNECT_DRIVE"
  | "LIST_FILES"
  | "INDEX_DRIVE"
  | "SEARCH_INDEX"
  | "READ_FILE"
  | "SUMMARIZE_FILE"
  | "GENERATE_MANIFEST";

export interface DriveMindRequest {
  id: string;
  type: DriveMindMessageType;
  payload: Record<string, unknown>;
}

export interface DriveMindResponse {
  id: string;
  ok: boolean;
  payload?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  };
}
