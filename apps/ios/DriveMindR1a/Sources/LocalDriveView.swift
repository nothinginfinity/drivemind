import SwiftUI
import UIKit

struct LocalDriveView: View {
    @EnvironmentObject private var store: ScopedFolderStore
    @State private var showPicker = false
    @State private var showReadApproval = false
    @State private var pendingFileID: String?

    var body: some View {
        NavigationStack {
            List {
                Section("Connection") {
                    Label(
                        store.isConnected ? "Folder connected" : "No folder connected",
                        systemImage: store.isConnected ? "externaldrive.fill" : "externaldrive.badge.xmark"
                    )
                    .foregroundStyle(store.isConnected ? Color.green : Color.secondary)

                    if let folder = store.folderLabel {
                        LabeledContent("Selected folder", value: folder)
                    }
                    Text(store.statusText)
                        .font(.footnote)
                        .foregroundStyle(.secondary)

                    Button("Choose USB-C drive folder") { showPicker = true }
                    if store.isConnected {
                        Button("Refresh connection") { store.refresh() }
                        Button("Revoke local folder access", role: .destructive) {
                            store.disconnect()
                        }
                    }
                }

                Section {
                    Text("Only .txt, .md, .json, .csv and .log files directly inside the selected folder are shown (up to 200). No automatic scanning or network transfer.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                    if store.files.isEmpty {
                        Text("No eligible files. Select a folder or refresh.")
                            .foregroundStyle(.secondary)
                    }
                    ForEach(store.files) { file in
                        Button {
                            pendingFileID = file.id
                            showReadApproval = true
                        } label: {
                            HStack {
                                Image(systemName: "doc.text")
                                Text(file.id)
                                    .lineLimit(2)
                                Spacer()
                                Text(ByteCountFormatter.string(
                                    fromByteCount: file.sizeBytes, countStyle: .file
                                ))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            }
                        }
                    }
                } header: {
                    Text("Choose a file to approve")
                }

                if let excerpt = store.excerpt {
                    Section("Approved local excerpt") {
                        Text(excerpt.fileName)
                            .font(.headline)
                        Text("\(excerpt.utf8Bytes) UTF-8 bytes shown (maximum 16,384).")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        if excerpt.isTruncated {
                            Text("Showing the bounded beginning only; the file continues.")
                                .font(.caption)
                                .foregroundStyle(.orange)
                        }
                        Text(excerpt.text)
                            .font(.system(.body, design: .monospaced))
                            .textSelection(.enabled)
                        Button("Clear preview") { store.clearExcerpt() }
                    }
                }

                Section("Privacy boundary") {
                    Label("Local only â¢ no upload â¢ no MCP relay", systemImage: "lock.shield")
                    Text("File content is untrusted text. DriveMind never treats it as instructions or shares it automatically.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("DriveMind")
            .sheet(isPresented: $showPicker) {
                FolderPicker { url in
                    store.selectFolder(url)
                    showPicker = false
                }
            }
            .alert("Approve a local file read?", isPresented: $showReadApproval) {
                Button("Cancel", role: .cancel) { pendingFileID = nil }
                Button("Read locally") {
                    if let pendingFileID { store.readUserApproved(pendingFileID) }
                    pendingFileID = nil
                }
            } message: {
                Text("Read up to 16,384 UTF-8 bytes from \(pendingFileID ?? "this file")? This only displays text on your iPhone; it does not transmit anything.")
            }
            .onReceive(NotificationCenter.default.publisher(
                for: UIApplication.willResignActiveNotification
            )) { _ in
                store.clearExcerpt()
            }
        }
    }
}
