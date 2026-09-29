import Foundation
import FirebaseAuth
import FirebaseFirestore

/// Sin estado propio: usa la instancia compartida de Firestore (segura entre hilos) en cada llamada.
final class FirestoreSessionUploader: Sendable {
    private var db: Firestore { Firestore.firestore() }

    func upload(_ workout: ImportedSwimWorkout, userId: String) async throws -> UploadResult {
        guard workout.totalDistanceMeters >= 25, workout.totalTimeMinutes > 0 else {
            return .skippedInvalid
        }

        let documentId = "apple_health_\(userId)_\(workout.healthKitWorkoutUUID)".replacingOccurrences(of: "/", with: "_")
        let ref = db.collection("swimSessions").document(documentId)
        let snapshot = try await ref.getDocument()
        if snapshot.exists { return .alreadyExists }

        let poolLength = normalizedPoolLength(workout.poolLengthMeters)
        let laps = max(1, Int((workout.totalDistanceMeters / Double(poolLength)).rounded()))
        let now = FieldValue.serverTimestamp()

        var payload: [String: Any] = [
            "userId": userId,
            "source": "apple_health",
            "healthKitWorkoutUUID": workout.healthKitWorkoutUUID,
            "date": Timestamp(date: workout.startDate),
            "startDate": Timestamp(date: workout.startDate),
            "endDate": Timestamp(date: workout.endDate),
            "totalTimeMinutes": max(1, workout.totalTimeMinutes),
            "activeTimeMinutes": max(1, workout.totalTimeMinutes),
            "restTimeMinutes": 0,
            "totalDistanceMeters": max(1, workout.totalDistanceMeters),
            "poolLengthMeters": poolLength,
            "laps": laps,
            "style": "mixed",
            "intensity": 5,
            "perceivedEffort": 5,
            "waterWeights": "none",
            "goal": "endurance",
            "notes": "Importado desde Apple Watch",
            "processingStatus": "pending",
            "createdAt": now,
            "updatedAt": now
        ]
        if let activeEnergy = workout.activeEnergyKcal { payload["activeEnergyKcal"] = activeEnergy }
        if let totalEnergy = workout.totalEnergyKcal { payload["totalEnergyKcal"] = totalEnergy }
        if let avgHeartRate = workout.avgHeartRate { payload["avgHeartRate"] = avgHeartRate }
        if let maxHeartRate = workout.maxHeartRate { payload["maxHeartRate"] = maxHeartRate }
        if let location = workout.swimmingLocationType { payload["swimmingLocationType"] = location }

        try await ref.setData(payload, merge: false)
        return .imported
    }

    private func normalizedPoolLength(_ meters: Double?) -> Int {
        guard let meters else { return 25 }
        if meters <= 22 { return 20 }
        if meters >= 45 { return 50 }
        return 25
    }
}

enum UploadResult: Sendable {
    case imported
    case alreadyExists
    case skippedInvalid
}
