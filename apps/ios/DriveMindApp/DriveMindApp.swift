import SwiftUI

@main
struct DriveMindApp: App {
    @StateObject private var driveManager = DriveManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(driveManager)
        }
    }
}
