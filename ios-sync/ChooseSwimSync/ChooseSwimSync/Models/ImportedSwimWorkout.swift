import Foundation

struct ImportedSwimWorkout: Identifiable, Hashable {
    let id: String
    let healthKitWorkoutUUID: String
    let startDate: Date
    let endDate: Date
    let totalDistanceMeters: Double
    let totalTimeMinutes: Double
    let activeEnergyKcal: Double?
    let totalEnergyKcal: Double?
    let avgHeartRate: Double?
    let maxHeartRate: Double?
    let poolLengthMeters: Double?
    let swimmingLocationType: String?
    var imported: Bool

    var title: String {
        "\(Int(totalDistanceMeters.rounded()))m"
    }
}
