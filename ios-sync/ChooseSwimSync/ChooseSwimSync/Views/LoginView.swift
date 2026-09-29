import SwiftUI

struct LoginView: View {
    @ObservedObject var auth: AuthService
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("ChooseSwim Sync")
                .font(.largeTitle.bold())
            Text("Inicia sesión con el mismo usuario de la PWA.")
                .foregroundStyle(.secondary)

            TextField("Email", text: $email)
                .textInputAutocapitalization(.never)
                .keyboardType(.emailAddress)
                .textFieldStyle(.roundedBorder)

            SecureField("Contraseña", text: $password)
                .textFieldStyle(.roundedBorder)

            Button("Entrar") {
                Task { await auth.login(email: email, password: password) }
            }
            .buttonStyle(.borderedProminent)

            if let error = auth.errorMessage {
                Text(error)
                    .foregroundStyle(.red)
            }
        }
        .padding()
    }
}
