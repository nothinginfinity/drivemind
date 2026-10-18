import SwiftUI

@main
struct DriveMindR1aApp: App {
    @StateObject private var store = ScopedFolderStore()

    var body: some Scene {
        WindowGroup {
            LocalDriveView()
                .environmentObject(store)
        }
    }
}
