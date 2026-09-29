import SwiftUI

struct WorkoutRow: View {
    let workout: ImportedSwimWorkout

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(workout.title)
                    .font(.headline)
                Spacer()
                Text(workout.imported ? "Importado" : "Pendiente")
                    .font(.caption.bold())
                    .foregroundStyle(workout.imported ? .green : .orange)
            }
            Text("\(workout.startDate.formatted(date: .abbreviated, time: .shortened)) · \(Int(workout.totalTimeMinutes.rounded())) min")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            HStack {
                if let avg = workout.avgHeartRate {
                    Text("FC media \(Int(avg.rounded()))")
                }
                if let energy = workout.activeEnergyKcal {
                    Text("\(Int(energy.rounded())) kcal")
                }
                if let pool = workout.poolLengthMeters {
                    Text("Piscina \(Int(pool.rounded()))m")
                }
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .padding(.vertical, 6)
    }
}
