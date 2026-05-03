import SwiftUI
import WebKit

/// SwiftUI wrapper around WKWebView.
/// Loads the DriveMind web UI and installs the NativeBridge.
struct WebViewController: UIViewRepresentable {
    let driveManager: DriveManager

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()

        // Install bridge handler
        let bridge = NativeBridge(
            driveManager: driveManager,
            webView: context.coordinator.webView
        )
        config.userContentController.add(bridge, name: "driveMind")

        // Inject DriveMindNative shim so the web UI can call the bridge
        let shimScript = WKUserScript(
            source: nativeBridgeShim,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        config.userContentController.addUserScript(shimScript)

        let webView = context.coordinator.webView
        webView.configuration.userContentController.add(bridge, name: "driveMind")
        webView.scrollView.bounces = false
        webView.isInspectable = true // Safari Web Inspector support

        loadWebUI(into: webView)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    class Coordinator {
        let webView = WKWebView()
    }

    // MARK: - Load web UI

    private func loadWebUI(into webView: WKWebView) {
        // In development: load from Vite dev server
        // In production: load from bundled dist/ folder
        #if DEBUG
        if let devURL = URL(string: "http://localhost:5173") {
            webView.load(URLRequest(url: devURL))
            return
        }
        #endif

        // Production: load bundled index.html from app bundle
        if let bundleURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist") {
            webView.loadFileURL(bundleURL, allowingReadAccessTo: bundleURL.deletingLastPathComponent())
        }
    }

    // MARK: - Bridge shim injected into the web page

    private var nativeBridgeShim: String {
        """
        (function() {
          const pending = {};
          let seq = 0;

          window.DriveMindNative = {
            onBridgeResponse: function(response) {
              const resolve = pending[response.id];
              if (resolve) { resolve(response); delete pending[response.id]; }
            },
            connectDrive: function() {
              return new Promise(resolve => {
                const id = 'msg_' + (++seq);
                pending[id] = resolve;
                window.webkit.messageHandlers.driveMind.postMessage({ type: 'connectDrive', id });
              });
            },
            listFiles: function() {
              return new Promise(resolve => {
                const id = 'msg_' + (++seq);
                pending[id] = resolve;
                window.webkit.messageHandlers.driveMind.postMessage({ type: 'listFiles', id });
              });
            },
            readFileChunk: function(fileId, maxBytes) {
              return new Promise(resolve => {
                const id = 'msg_' + (++seq);
                pending[id] = resolve;
                window.webkit.messageHandlers.driveMind.postMessage({ type: 'readFileChunk', id, fileId, maxBytes: maxBytes || 20000 });
              });
            }
          };
        })();
        """
    }
}
