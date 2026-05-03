import SwiftUI

struct ContentView: View {
    @EnvironmentObject var driveManager: DriveManager
    @State private var showDrivePicker = false

    var body: some View {
        ZStack(alignment: .bottom) {
            // Web UI host fills the screen
            WebViewController(driveManager: driveManager)
                .ignoresSafeArea()

            // Overlay: show connect prompt if no drive is connected
            if driveManager.connectedDriveURL == nil {
                DriveConnectView(showPicker: $showDrivePicker)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: driveManager.connectedDriveURL)
        .sheet(isPresented: $showDrivePicker) {
            DocumentPickerView { url in
                driveManager.connectDrive(url: url)
                showDrivePicker = false
            }
        }
    }
}
