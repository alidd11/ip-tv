import SwiftUI

@main
struct IPTVApp: App {
    var body: some Scene {
        WindowGroup {
            MobileHomeView()
                .preferredColorScheme(.dark)
        }
    }
}
