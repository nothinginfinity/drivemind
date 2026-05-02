export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export const driveMindTools: ToolDefinition[] = [
  {
    name: "search_files",
    description: "Search indexed files on the connected external drive.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        extensions: { type: "array", items: { type: "string" } },
        max_results: { type: "integer", default: 20 }
      },
      required: ["query"]
    }
  },
  {
    name: "read_file",
    description: "Read a selected file or a limited range from a file.",
    parameters: {
      type: "object",
      properties: {
        file_id: { type: "string" },
        max_bytes: { type: "integer", default: 20000 }
      },
      required: ["file_id"]
    }
  },
  {
    name: "summarize_file",
    description: "Summarize a selected indexed file.",
    parameters: {
      type: "object",
      properties: {
        file_id: { type: "string" }
      },
      required: ["file_id"]
    }
  },
  {
    name: "generate_manifest",
    description: "Generate a compressed manifest of the connected drive.",
    parameters: {
      type: "object",
      properties: {
        drive_id: { type: "string" },
        include_summaries: { type: "boolean", default: false }
      },
      required: ["drive_id"]
    }
  }
];
