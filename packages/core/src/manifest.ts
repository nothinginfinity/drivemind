import type { DriveManifest, FileRecord } from "./types";

export function createDriveManifest(input: {
  driveId: string;
  driveName: string;
  files: FileRecord[];
}): DriveManifest {
  const totalSize = input.files.reduce((sum, file) => sum + file.size_bytes, 0);

  return {
    manifest_id: `manifest_${Date.now()}`,
    drive_id: input.driveId,
    drive_name: input.driveName,
    generated_at: new Date().toISOString(),
    file_count: input.files.length,
    total_size_bytes: totalSize,
    files: input.files
  };
}
