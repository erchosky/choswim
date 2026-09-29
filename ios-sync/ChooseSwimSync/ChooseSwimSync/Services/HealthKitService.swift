import Foundation
import HealthKit

/// Sin estado mutable: HKHealthStore es seguro entre hilos, así que el servicio puede usarse desde cualquier actor.
final class HealthKitService: Sendable {
    private let store = HKHealthStore()

    var isAvailable: Bool {
        HKHealthStore.isHealthDataAvailable()
    }

    func requestAuthorization() async throws {
        guard isAvailable else {
            throw SyncError.healthKitUnavailable
        }

        var readTypes: Set<HKObjectType> = [HKObjectType.workoutType()]
        if let distance = HKObjectType.quantityType(forIdentifier: .distanceSwimming) { readTypes.insert(distance) }
        if let activeEnergy = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned) { readTypes.insert(activeEnergy) }
        if let basalEnergy = HKObjectType.quantityType(forIdentifier: .basalEnergyBurned) { readTypes.insert(basalEnergy) }
        if let heartRate = HKObjectType.quantityType(forIdentifier: .heartRate) { readTypes.insert(heartRate) }

        try await store.requestAuthorization(toShare: [], read: readTypes)
    }

    func fetchSwimmingWorkouts(limit: Int = 30) async throws -> [ImportedSwimWorkout] {
        let predicate = HKQuery.predicateForWorkouts(with: .swimming)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

        let workouts: [HKWorkout] = try await withCheckedThrowingContinuation { continuation in
            let query = HKSampleQuery(sampleType: .workoutType(), predicate: predicate, limit: limit, sortDescriptors: [sort]) { _, samples, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                continuation.resume(returning: (samples as? [HKWorkout]) ?? [])
            }
            store.execute(query)
        }

        var imported: [ImportedSwimWorkout] = []
        for workout in workouts {
            let heartRate = (try? await heartRateStats(for: workout)) ?? (avg: nil, max: nil)
            imported.append(map(workout: workout, heartRate: heartRate))
        }
        return imported
    }

    private func map(workout: HKWorkout, heartRate: (avg: Double?, max: Double?)) -> ImportedSwimWorkout {
        let distance = workout.totalDistance?.doubleValue(for: .meter()) ?? 0
        let activeEnergy = workout.totalEnergyBurned?.doubleValue(for: .kilocalorie())
        let poolLength = (workout.metadata?[HKMetadataKeyLapLength] as? HKQuantity)?.doubleValue(for: .meter())
        let locationType = swimmingLocationType(from: workout.metadata?[HKMetadataKeySwimmingLocationType])

        return ImportedSwimWorkout(
            id: workout.uuid.uuidString,
            healthKitWorkoutUUID: workout.uuid.uuidString,
            startDate: workout.startDate,
            endDate: workout.endDate,
            totalDistanceMeters: distance,
            totalTimeMinutes: workout.duration / 60,
            activeEnergyKcal: activeEnergy,
            totalEnergyKcal: activeEnergy,
            avgHeartRate: heartRate.avg,
            maxHeartRate: heartRate.max,
            poolLengthMeters: poolLength,
            swimmingLocationType: locationType,
            imported: false
        )
    }

    private func heartRateStats(for workout: HKWorkout) async throws -> (avg: Double?, max: Double?) {
        guard let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate) else {
            return (nil, nil)
        }
        let predicate = HKQuery.predicateForSamples(withStart: workout.startDate, end: workout.endDate, options: [.strictStartDate, .strictEndDate])

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsQuery(quantityType: heartRateType, quantitySamplePredicate: predicate, options: [.discreteAverage, .discreteMax]) { _, stats, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                let unit = HKUnit.count().unitDivided(by: .minute())
                continuation.resume(returning: (
                    stats?.averageQuantity()?.doubleValue(for: unit),
                    stats?.maximumQuantity()?.doubleValue(for: unit)
                ))
            }
            store.execute(query)
        }
    }

    private func swimmingLocationType(from raw: Any?) -> String? {
        guard let value = raw as? Int else { return nil }
        switch value {
        case 1: return "pool"
        case 2: return "open_water"
        default: return "unknown"
        }
    }
}

enum SyncError: LocalizedError {
    case healthKitUnavailable
    case missingUser

    var errorDescription: String? {
        switch self {
        case .healthKitUnavailable: return "HealthKit no está disponible en este dispositivo."
        case .missingUser: return "Necesitas iniciar sesión antes de importar."
        }
    }
}
