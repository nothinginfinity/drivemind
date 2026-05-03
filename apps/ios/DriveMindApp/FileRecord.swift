import Foundation

/// Mirrors the TypeScript FileRecord type in packages/core/src/types.ts
struct FileRecord: Identifiable, Codable {
    let id: String          // = fileId for SwiftUI List
    let fileId: String
    let driveId: String
    let path: String
    let name: String
    let `extension`: String?
    let sizeBytes: Int
    let modifiedAt: Date?
    var indexedStatus: IndexedStatus
    var tags: [String]

    enum IndexedStatus: String, Codable {
        case pending
        case pendingMetadata = "pending_metadata"
        case indexedMetadata = "indexed_metadata"
        case indexedText     = "indexed_text"
        case skippedBinary   = "skipped_binary"
        case skippedTooLarge = "skipped_too_large"
        case error
    }

    init(
        fileId: String,
        driveId: String,
        path: String,
        name: String,
        extension ext: String?,
        sizeBytes: Int,
        modifiedAt: Date?,
        indexedStatus: IndexedStatus,
        tags: [String] = []
    ) {
        self.id           = fileId
        self.fileId       = fileId
        self.driveId      = driveId
        self.path         = path
        self.name         = name
        self.extension    = ext
        self.sizeBytes    = sizeBytes
        self.modifiedAt   = modifiedAt
        self.indexedStatus = indexedStatus
        self.tags         = tags
    }
}
