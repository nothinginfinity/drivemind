import Foundation
import Combine

/// Manages the connected external drive folder.
/// Handles security-scoped bookmarks so access survives app restarts.
@MainActor
final class DriveManager: ObservableObject {

    // MARK: - Published state

    @Published var connectedDriveURL: URL?
    @Published var driveFiles: [FileRecord] = []
    @Published var isIndexing: Bool = false
    @Published var errorMessage: String?

    // MARK: - Persistence key

    private let bookmarkKey = "drivemind.driveBookmark"

    // MARK: - Init

    init() {
        restoreBookmark()
    }

    // MARK: - Connect

    func connectDrive(url: URL) {
        guard url.startAccessingSecurityScopedResource() else {
            errorMessage = "Could not access the selected folder."
            return
        }
        connectedDriveURL = url
        saveBookmark(url: url)
        Task { await listFiles() }
    }

    func disconnectDrive() {
        connectedDriveURL?.stopAccessingSecurityScopedResource()
        connectedDriveURL = nil
        driveFiles = []
        UserDefaults.standard.removeObject(forKey: bookmarkKey)
    }

    // MARK: - File listing

    func listFiles() async {
        guard let root = connectedDriveURL else { return }
        isIndexing = true
        defer { isIndexing = false }

        let fm = FileManager.default
        var records: [FileRecord] = []

        guard let enumerator = fm.enumerator(
            at: root,
            includingPropertiesForKeys: [
                .fileSizeKey,
                .contentModificationDateKey,
                .isRegularFileKey
            ],
            options: [.skipsHiddenFiles]
        ) else { return }

        for case let fileURL as URL in enumerator {
            guard let resourceValues = try? fileURL.resourceValues(
                forKeys: [.isRegularFileKey, .fileSizeKey, .contentModificationDateKey]
            ), resourceValues.isRegularFile == true else { continue }

            let record = FileRecord(
                fileId: fileURL.path,
                driveId: root.path,
                path: fileURL.path,
                name: fileURL.lastPathComponent,
                extension: fileURL.pathExtension.lowercased().nonEmpty,
                sizeBytes: resourceValues.fileSize ?? 0,
                modifiedAt: resourceValues.contentModificationDate,
                indexedStatus: .pendingMetadata
            )
            records.append(record)
        }

        driveFiles = records.sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
    }

    // MARK: - Read file chunk

    func readFileChunk(path: String, maxBytes: Int = 20_000) -> String? {
        guard let url = URL(string: path) ?? URL(fileURLWithPath: path) as URL?,
              let data = try? Data(contentsOf: url, options: .mappedIfSafe) else { return nil }
        let slice = data.prefix(maxBytes)
        return String(data: slice, encoding: .utf8)
            ?? String(data: slice, encoding: .isoLatin1)
    }

    // MARK: - Bookmark persistence

    private func saveBookmark(url: URL) {
        guard let bookmark = try? url.bookmarkData(
            options: .minimalBookmark,
            includingResourceValuesForKeys: nil,
            relativeTo: nil
        ) else { return }
        UserDefaults.standard.set(bookmark, forKey: bookmarkKey)
    }

    private func restoreBookmark() {
        guard let data = UserDefaults.standard.data(forKey: bookmarkKey) else { return }
        var isStale = false
        guard let url = try? URL(
            resolvingBookmarkData: data,
            options: .withoutUI,
            relativeTo: nil,
            bookmarkDataIsStale: &isStale
        ) else { return }

        if isStale { saveBookmark(url: url) }

        guard url.startAccessingSecurityScopedResource() else { return }
        connectedDriveURL = url
        Task { await listFiles() }
    }
}

// MARK: - Helpers

private extension String {
    var nonEmpty: String? { isEmpty ? nil : self }
}
