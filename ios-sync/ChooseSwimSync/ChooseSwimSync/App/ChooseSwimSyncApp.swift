import SwiftUI
import FirebaseCore

@main
struct ChooseSwimSyncApp: App {
    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
