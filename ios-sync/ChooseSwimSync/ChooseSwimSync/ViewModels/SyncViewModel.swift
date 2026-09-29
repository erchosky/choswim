import Foundation
import FirebaseAuth

@MainActor
final class SyncViewModel: ObservableObject {
    @Published var workouts: [ImportedSwimWorkout] = []
    @Published var isLoading = false
    @Published var statusMessage = "Inicia sesión y pide permisos para importar natación."
    @Published var errorMessage: String?
    @Published var importedCount = 0
    @Published var existingCount = 0
    @Published var skippedCount = 0
    @Published var failedCount = 0

    private let healthKit = HealthKitService()
    private let uploader = FirestoreSessionUploader()

    func requestHealthPermissions() async {
        errorMessage = nil
        do {
            try await healthKit.requestAuthorization()
            statusMessage = "Permisos HealthKit concedidos. Ya puedes importar natación."
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadSwimmingWorkouts() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            workouts = try await healthKit.fetchSwimmingWorkouts()
            statusMessage = workouts.isEmpty ? "No se encontraron entrenos de natación." : "Entrenos encontrados: \(workouts.count)."
        } catch {
            errorMessage = "No se pudieron leer entrenos de Apple Health."
        }
    }

    func importWorkouts(userId: String?) async {
        guard let userId else {
            errorMessage = "Necesitas iniciar sesión antes de importar."
            return
        }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        let summary = await uploadLoadedWorkouts(userId: userId)
        apply(summary)
    }

    func synchronizeNow(userId: String?) async {
        guard let userId else {
            errorMessage = "Necesitas iniciar sesión antes de sincronizar."
            return
        }
        isLoading = true
        errorMessage = nil
        statusMessage = "Sincronizando Apple Health..."
        importedCount = 0
        existingCount = 0
        skippedCount = 0
        failedCount = 0
        defer { isLoading = false }

        do {
            try await healthKit.requestAuthorization()
            workouts = try await healthKit.fetchSwimmingWorkouts()
            let summary = await uploadLoadedWorkouts(userId: userId)
            apply(summary)
        } catch {
            errorMessage = "No se pudo sincronizar Apple Health. Revisa permisos, HealthKit y conexión."
        }
    }

    private func uploadLoadedWorkouts(userId: String) async -> UploadSummary {
        var summary = UploadSummary()
        for workout in workouts {
            do {
                switch try await uploader.upload(workout, userId: userId) {
                case .imported:
                    summary.imported += 1
                    summary.syncedWorkoutIds.insert(workout.id)
                case .alreadyExists:
                    summary.existing += 1
                    summary.syncedWorkoutIds.insert(workout.id)
                case .skippedInvalid:
                    summary.skipped += 1
                }
            } catch {
                summary.failed += 1
            }
        }
        return summary
    }

    private func apply(_ summary: UploadSummary) {
        importedCount = summary.imported
        existingCount = summary.existing
        skippedCount = summary.skipped
        failedCount = summary.failed
        workouts = workouts.map { workout in
            var copy = workout
            copy.imported = summary.syncedWorkoutIds.contains(workout.id)
            return copy
        }
        statusMessage = "Sincronización completada: \(summary.imported) nuevos, \(summary.existing) ya existentes, \(summary.skipped) omitidos, \(summary.failed) errores."
    }
}

private struct UploadSummary {
    var imported = 0
    var existing = 0
    var skipped = 0
    var failed = 0
    var syncedWorkoutIds: Set<String> = []
}
