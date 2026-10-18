import Foundation
import Combine

struct LocalFile: Identifiable {
    /// Filenames are identifiers only inside the currently selected root.
    let id: String
    let sizeBytes: Int64
}

/// Manages one explicitly granted folder; no recursive index or background read.
@MainActor
final class ScopedFolderStore: ObservableObject {
    @Published private(set) var files: [LocalFile] = []
    @Published private(set) var excerpt: ApprovedExcerpt?
    @Published private(set) var statusText = "No folder selected"
    @Published private(set) var folderLabel: String?
    @Published private(set) var hasBookmark = false

    private let bookmarkKey = "drivemind.r1a.folderBookmark"
    private var rootURL: URL?

    var isConnected: Bool { rootURL != nil }

    init() {
        restoreBookmarkIfPossible()
    }

    func selectFolder(_ url: URL) {
        releaseScope()
        UserDefaults.standard.removeObject(forKey: bookmarkKey)
        hasBookmark = false

        guard url.isFileURL, url.startAccessingSecurityScopedResource() else {
            statusText = "Permission unavailable. Select a folder again in Files."
            return
        }
        guard (try? url.resourceValues(forKeys: [.isDirectoryKey]))?.isDirectory == true else {
            url.stopAccessingSecurityScopedResource()
            statusText = "Choose a folder, not an individual file."
            return
        }
        rootURL = url
        folderLabel = url.lastPathComponent

        // iOS File Provider bookmark persistence varies by provider and device.
        // Never claim a saved bookmark is a durable permission without revalidation.
        do {
            let bookmark = try url.bookmarkData(
                options: [], includingResourceValuesForKeys: nil, relativeTo: nil
            )
            UserDefaults.standard.set(bookmark, forKey: bookmarkKey)
            hasBookmark = true
        } catch {
            hasBookmark = false
        }
        refresh()
    }

    func refresh() {
        files = []
        excerpt = nil
        guard let rootURL else {
            statusText = "No authorized folder. Reconnect in Files."
            return
        }

        do {
            // A deliberately shallow, bounded listing avoids an implicit drive scan.
            let urls = try FileManager.default.contentsOfDirectory(
                at: rootURL,
                includingPropertiesForKeys: [
                    .isRegularFileKey, .isSymbolicLinkKey, .fileSizeKey
                ],
                options: [.skipsHiddenFiles]
            )
            let rootPath = rootURL.standardizedFileURL.resolvingSymlinksInPath().path
            var visible: [LocalFile] = []
            for url in urls {
                guard visible.count < 200 else { break }
                let name = url.lastPathComponent
                guard !name.hasPrefix("."),
                      ApprovedExcerptReader.allowedExtensions.contains(
                        url.pathExtension.lowercased()
                      ),
                      url.standardizedFileURL.resolvingSymlinksInPath()
                        .deletingLastPathComponent().path == rootPath else { continue }

                let values = try url.resourceValues(
                    forKeys: [.isRegularFileKey, .isSymbolicLinkKey, .fileSizeKey]
                )
                guard values.isRegularFile == true,
                      values.isSymbolicLink != true else { continue }
                visible.append(LocalFile(
                    id: name, sizeBytes: Int64(values.fileSize ?? 0)
                ))
            }
            files = visible.sorted {
                $0.id.localizedStandardCompare($1.id) == .orderedAscending
            }
            statusText = "Local folder accessible • \(files.count) eligible files shown"
        } catch {
            releaseScope()
            statusText = "Drive unavailable or permission expired. Re-select in Files."
        }
    }

    /// This method is invoked ONLY after the native confirmation dialog.
    /// It accepts an enumerated filename, never an arbitrary path.
    func readUserApproved(_ fileID: String) {
        excerpt = nil
        guard let rootURL,
              files.contains(where: { $0.id == fileID }),
              !fileID.isEmpty, fileID != ".", fileID != "..",
              !fileID.contains("/"), !fileID.contains("\\") else {
            statusText = "File is not in the approved selection."
            return
        }
        do {
            let selectedURL = rootURL.appendingPathComponent(fileID, isDirectory: false)
            excerpt = try ApprovedExcerptReader.read(
                fileURL: selectedURL, approvedRoot: rootURL
            )
            statusText = "Local preview ready • no data sent"
        } catch {
            statusText = error.localizedDescription
        }
    }

    func clearExcerpt() {
        excerpt = nil
    }

    func disconnect() {
        releaseScope()
        UserDefaults.standard.removeObject(forKey: bookmarkKey)
        hasBookmark = false
        statusText = "Disconnected. Folder permission cleared."
    }

    private func releaseScope() {
        rootURL?.stopAccessingSecurityScopedResource()
        rootURL = nil
        folderLabel = nil
        files = []
        excerpt = nil
    }

    private func restoreBookmarkIfPossible() {
        guard let data = UserDefaults.standard.data(forKey: bookmarkKey) else { return }
        var stale = false
        do {
            let url = try URL(
                resolvingBookmarkData: data, options: [],
                relativeTo: nil, bookmarkDataIsStale: &stale
            )
            guard !stale else {
                UserDefaults.standard.removeObject(forKey: bookmarkKey)
                statusText = "Saved permission is stale. Re-select the folder."
                return
            }
            guard url.startAccessingSecurityScopedResource(),
                  (try? url.resourceValues(forKeys: [.isDirectoryKey]))?.isDirectory == true else {
                url.stopAccessingSecurityScopedResource()
                UserDefaults.standard.removeObject(forKey: bookmarkKey)
                statusText = "Saved folder is unavailable. Reconnect and re-select."
                return
            }
            rootURL = url
            folderLabel = url.lastPathComponent
            hasBookmark = true
            refresh()
        } catch {
            UserDefaults.standard.removeObject(forKey: bookmarkKey)
            statusText = "Unable to restore permission. Re-select the folder."
        }
    }
}
