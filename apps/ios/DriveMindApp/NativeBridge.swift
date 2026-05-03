import WebKit
import Foundation

/// Receives messages from the web UI and dispatches native operations.
/// Installed as a WKScriptMessageHandler on the webView's userContentController.
///
/// JS usage:
///   window.webkit.messageHandlers.driveMind.postMessage({ type: "connectDrive" })
///   window.webkit.messageHandlers.driveMind.postMessage({ type: "listFiles" })
///   window.webkit.messageHandlers.driveMind.postMessage({ type: "readFileChunk", fileId: "/path", maxBytes: 20000 })
final class NativeBridge: NSObject, WKScriptMessageHandler {

    private weak var driveManager: DriveManager?
    private weak var webView: WKWebView?

    init(driveManager: DriveManager, webView: WKWebView) {
        self.driveManager = driveManager
        self.webView = webView
    }

    // MARK: - Message handler

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "driveMind",
              let body = message.body as? [String: Any],
              let type = body["type"] as? String else { return }

        Task { @MainActor in
            switch type {
            case "connectDrive":
                // Trigger is handled by SwiftUI sheet; just return current status
                self.send(id: body["id"] as? String, ok: true, payload: [
                    "connected": self.driveManager?.connectedDriveURL != nil,
                    "mode": "native"
                ])

            case "listFiles":
                let files = self.driveManager?.driveFiles ?? []
                let encoded = files.map { self.encodeFileRecord($0) }
                self.send(id: body["id"] as? String, ok: true, payload: ["files": encoded])

            case "readFileChunk":
                guard let path = body["fileId"] as? String else {
                    self.send(id: body["id"] as? String, ok: false, error: "Missing fileId")
                    return
                }
                let maxBytes = body["maxBytes"] as? Int ?? 20_000
                let text = self.driveManager?.readFileChunk(path: path, maxBytes: maxBytes)
                self.send(id: body["id"] as? String, ok: true, payload: ["text": text ?? ""])

            default:
                self.send(id: body["id"] as? String, ok: false, error: "Unknown message type: \(type)")
            }
        }
    }

    // MARK: - Response helpers

    private func send(id: String?, ok: Bool, payload: [String: Any] = [:], error: String? = nil) {
        var response: [String: Any] = ["ok": ok]
        if let id { response["id"] = id }
        if !payload.isEmpty { response["payload"] = payload }
        if let error { response["error"] = ["message": error] }

        guard let data = try? JSONSerialization.data(withJSONObject: response),
              let json = String(data: data, encoding: .utf8) else { return }

        webView?.evaluateJavaScript("window.DriveMindNative?.onBridgeResponse(\(json))")
    }

    private func encodeFileRecord(_ record: FileRecord) -> [String: Any] {
        var dict: [String: Any] = [
            "file_id":       record.fileId,
            "drive_id":      record.driveId,
            "path":          record.path,
            "name":          record.name,
            "size_bytes":    record.sizeBytes,
            "indexed_status": record.indexedStatus.rawValue
        ]
        if let ext = record.extension { dict["extension"] = ext }
        if let date = record.modifiedAt {
            dict["modified_at"] = ISO8601DateFormatter().string(from: date)
        }
        return dict
    }
}
