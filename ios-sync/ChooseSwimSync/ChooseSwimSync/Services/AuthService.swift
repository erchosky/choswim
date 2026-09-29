import Foundation
import FirebaseAuth

@MainActor
final class AuthService: ObservableObject {
    @Published private(set) var user: User?
    @Published var errorMessage: String?

    init() {
        user = Auth.auth().currentUser
    }

    func login(email: String, password: String) async {
        errorMessage = nil
        do {
            let result = try await Auth.auth().signIn(withEmail: email, password: password)
            user = result.user
        } catch {
            errorMessage = "No se pudo iniciar sesión. Revisa email, contraseña y conexión."
        }
    }

    func logout() {
        do {
            try Auth.auth().signOut()
            user = nil
        } catch {
            errorMessage = "No se pudo cerrar sesión."
        }
    }
}
