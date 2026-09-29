import SwiftUI

struct SyncHomeView: View {
    @ObservedObject var auth: AuthService
    @StateObject private var viewModel = SyncViewModel()

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text(viewModel.statusMessage)
                    if let error = viewModel.errorMessage {
                        Text(error).foregroundStyle(.red)
                    }
                }

                Section("Sincronización") {
                    Button(viewModel.isLoading ? "Sincronizando..." : "Sincronizar ahora") {
                        Task { await viewModel.synchronizeNow(userId: auth.user?.uid) }
                    }
                    .disabled(viewModel.isLoading)

                    HStack {
                        StatPill(label: "Nuevos", value: viewModel.importedCount)
                        StatPill(label: "Existentes", value: viewModel.existingCount)
                        StatPill(label: "Omitidos", value: viewModel.skippedCount)
                        StatPill(label: "Errores", value: viewModel.failedCount)
                    }
                }

                Section("Últimos entrenos") {
                    if viewModel.isLoading {
                        ProgressView("Sincronizando...")
                    } else if viewModel.workouts.isEmpty {
                        Text("No hay entrenos cargados todavía.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(viewModel.workouts) { workout in
                            WorkoutRow(workout: workout)
                        }
                    }
                }
            }
            .navigationTitle("Sync iOS")
            .toolbar {
                Button("Salir") {
                    auth.logout()
                }
            }
        }
    }
}

private struct StatPill: View {
    let label: String
    let value: Int

    var body: some View {
        VStack {
            Text("\(value)").font(.headline)
            Text(label).font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}
