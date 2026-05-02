export interface NativeBridge {
  connectDrive?: () => Promise<unknown>;
  listFiles?: () => Promise<unknown>;
  indexDrive?: () => Promise<unknown>;
  searchIndex?: (query: string) => Promise<unknown>;
  readFile?: (fileId: string) => Promise<unknown>;
}

declare global {
  interface Window {
    DriveMindNative?: NativeBridge;
  }
}

export async function connectDrive() {
  if (window.DriveMindNative?.connectDrive) {
    return window.DriveMindNative.connectDrive();
  }

  return {
    ok: false,
    mode: "web-mock",
    message: "Native bridge unavailable. Running mock web UI."
  };
}
