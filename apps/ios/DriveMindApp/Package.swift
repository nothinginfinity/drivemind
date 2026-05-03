// swift-tools-version: 5.10
import PackageDescription

/// DriveMind iOS — Phase 2 Native Shell
/// No external Swift dependencies at this stage.
/// All required frameworks (UIKit, SwiftUI, WebKit, UniformTypeIdentifiers)
/// are part of the iOS SDK.
let package = Package(
    name: "DriveMindApp",
    platforms: [.iOS(.v17)],
    targets: [
        .target(
            name: "DriveMindApp",
            path: ".",
            exclude: ["Info.plist"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency")
            ]
        )
    ]
)
