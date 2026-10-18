import Foundation
import Darwin

struct ApprovedExcerpt {
    let fileName: String
    let text: String
    let utf8Bytes: Int
    let isTruncated: Bool
}

enum LocalReadError: LocalizedError {
    case outsideRoot
    case unsupportedType
    case invalidFile
    case inaccessible
    case unreadableText
    case emptyFile

    var errorDescription: String? {
        switch self {
        case .outsideRoot: return "File is outside the approved folder."
        case .unsupportedType: return "Only .txt, .md, .json, .csv and .log files are supported."
        case .invalidFile: return "Directories, links and non-regular files are not readable."
        case .inaccessible: return "The file is unavailable. Reconnect the drive and try again."
        case .unreadableText: return "The excerpt is not valid UTF-8 text."
        case .emptyFile: return "The file is empty."
        }
    }
}

/// A single explicitly approved local read. Never accepts a remote path or a tool request.
enum ApprovedExcerptReader {
    static let maximumBytes = 16_384
    static let allowedExtensions: Set<String> = ["txt", "md", "json", "csv", "log"]

    static func read(fileURL: URL, approvedRoot: URL) throws -> ApprovedExcerpt {
        guard fileURL.isFileURL, approvedRoot.isFileURL else {
            throw LocalReadError.outsideRoot
        }
        guard allowedExtensions.contains(fileURL.pathExtension.lowercased()) else {
            throw LocalReadError.unsupportedType
        }

        // Immediate children only in R1a. Resolve any symlink BEFORE containment.
        let root = approvedRoot.standardizedFileURL.resolvingSymlinksInPath()
        let file = fileURL.standardizedFileURL.resolvingSymlinksInPath()
        guard file.deletingLastPathComponent().path == root.path,
              file != root else {
            throw LocalReadError.outsideRoot
        }
        let values = try fileURL.resourceValues(
            forKeys: [.isRegularFileKey, .isSymbolicLinkKey]
        )
        guard values.isRegularFile == true, values.isSymbolicLink != true else {
            throw LocalReadError.invalidFile
        }

        // NSFileCoordinator respects external File Provider access and file handoff.
        var coordinationError: NSError?
        var result: Result<ApprovedExcerpt, Error>?
        let coordinator = NSFileCoordinator(filePresenter: nil)
        coordinator.coordinate(readingItemAt: fileURL, options: [], error: &coordinationError) {
            coordinatedURL in
            result = Result {
                try readOpenedFile(coordinatedURL, displayName: fileURL.lastPathComponent)
            }
        }
        if let coordinationError { throw coordinationError }
        guard let result else { throw LocalReadError.inaccessible }
        return try result.get()
    }

    private static func readOpenedFile(
        _ url: URL, displayName: String
    ) throws -> ApprovedExcerpt {
        // O_NOFOLLOW blocks a symlink swap at open; fstat verifies a regular file.
        let descriptor = Darwin.open(url.path, O_RDONLY | O_NOFOLLOW | O_CLOEXEC)
        guard descriptor >= 0 else { throw LocalReadError.inaccessible }
        let handle = FileHandle(fileDescriptor: descriptor, closeOnDealloc: true)
        defer { try? handle.close() }
        var info = stat()
        guard fstat(descriptor, &info) == 0,
              (info.st_mode & mode_t(S_IFMT)) == mode_t(S_IFREG) else {
            throw LocalReadError.invalidFile
        }

        // Read no more than 16,385 bytes; the extra byte identifies truncation.
        var read = Data()
        while read.count < maximumBytes + 1 {
            let next = try handle.read(upToCount: maximumBytes + 1 - read.count) ?? Data()
            if next.isEmpty { break }
            read.append(next)
        }
        guard !read.isEmpty else { throw LocalReadError.emptyFile }
        let isTruncated = read.count > maximumBytes
        let prefix = Data(read.prefix(maximumBytes))
        guard !prefix.contains(0) else { throw LocalReadError.unreadableText }

        // Only trim an incomplete UTF-8 suffix when the excerpt hit the limit.
        // A short malformed file is rejected without repairing its contents.
        let trims: ClosedRange<Int> = isTruncated ? 0...3 : 0...0
        for trim in trims where prefix.count >= trim {
            let bounded = Data(prefix.prefix(prefix.count - trim))
            if let text = String(data: bounded, encoding: .utf8) {
                return ApprovedExcerpt(
                    fileName: displayName, text: text,
                    utf8Bytes: bounded.count, isTruncated: isTruncated
                )
            }
        }
        throw LocalReadError.unreadableText
    }
}
