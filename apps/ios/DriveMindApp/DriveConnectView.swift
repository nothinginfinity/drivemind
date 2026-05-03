import SwiftUI

/// Bottom-sheet overlay shown when no drive is connected.
struct DriveConnectView: View {
    @Binding var showPicker: Bool
    @EnvironmentObject var driveManager: DriveManager

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "externaldrive.fill")
                .font(.system(size: 40))
                .foregroundStyle(.teal)

            Text("Connect a Drive")
                .font(.headline)

            Text("Plug in an external SSD and tap below to select a folder.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)

            Button(action: { showPicker = true }) {
                Label("Choose Folder", systemImage: "folder.badge.plus")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(.teal)
            .padding(.horizontal, 24)

            if let error = driveManager.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
            }
        }
        .padding(.vertical, 32)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .shadow(radius: 20)
        .padding(.horizontal, 16)
        .padding(.bottom, 32)
    }
}
