import SwiftUI

struct ContentView: View {
    @StateObject private var auth = AuthService()

    var body: some View {
        if auth.user == nil {
            LoginView(auth: auth)
        } else {
            SyncHomeView(auth: auth)
        }
    }
}
