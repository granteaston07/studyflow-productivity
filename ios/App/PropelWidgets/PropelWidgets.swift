import WidgetKit
import SwiftUI

// ─── Timeline Provider ───────────────────────────────────────────────────────

struct PropelEntry: TimelineEntry {
    let date: Date
    let data: PropelWidgetData
}

struct PropelProvider: TimelineProvider {
    func placeholder(in context: Context) -> PropelEntry {
        PropelEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (PropelEntry) -> Void) {
        completion(PropelEntry(date: Date(), data: .load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PropelEntry>) -> Void) {
        let data = PropelWidgetData.load()
        let entry = PropelEntry(date: Date(), data: data)
        // Refresh every 15 minutes
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

// ─── Colors ──────────────────────────────────────────────────────────────────

extension Color {
    static let propelPurple  = Color(red: 0.49, green: 0.23, blue: 0.93)
    static let propelSuccess = Color(red: 0.09, green: 0.64, blue: 0.29)
    static let propelWarning = Color(red: 0.96, green: 0.62, blue: 0.04)
    static let propelError   = Color(red: 0.86, green: 0.15, blue: 0.15)
    static let propelBg      = Color(red: 0.06, green: 0.06, blue: 0.10)
    static let propelCard    = Color(red: 0.09, green: 0.09, blue: 0.14)

    static func priorityColor(_ priority: String) -> Color {
        switch priority {
        case "high":   return .propelError
        case "medium": return .propelWarning
        default:       return .propelSuccess
        }
    }
}

// ─── Small: Tasks Today ───────────────────────────────────────────────────────

struct TasksTodayWidgetView: View {
    let data: PropelWidgetData

    var body: some View {
        ZStack {
            ContainerRelativeShape().fill(Color.propelBg)
            VStack(alignment: .leading, spacing: 6) {
                Image(systemName: "checkmark.square.fill")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.propelPurple)
                Spacer()
                Text("\(data.taskCount)")
                    .font(.system(size: 38, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                    .minimumScaleFactor(0.6)
                Text(data.taskCount == 1 ? "task left" : "tasks left")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.white.opacity(0.55))
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .padding(14)
        }
    }
}

// ─── Small: Streak ────────────────────────────────────────────────────────────

struct StreakWidgetView: View {
    let data: PropelWidgetData

    var body: some View {
        ZStack {
            ContainerRelativeShape().fill(Color.propelBg)
            VStack(alignment: .leading, spacing: 6) {
                Text("🔥")
                    .font(.system(size: 22))
                Spacer()
                Text("\(data.streak)")
                    .font(.system(size: 38, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                    .minimumScaleFactor(0.6)
                Text(data.streak == 1 ? "day streak" : "day streak")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.white.opacity(0.55))
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .padding(14)
        }
    }
}

// ─── Medium: Up Next ─────────────────────────────────────────────────────────

struct UpNextWidgetView: View {
    let data: PropelWidgetData

    var body: some View {
        ZStack {
            ContainerRelativeShape().fill(Color.propelBg)
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Up Next")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white.opacity(0.45))
                        .textCase(.uppercase)
                        .tracking(0.8)
                    Spacer()
                    Text("\(data.taskCount) left")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.propelPurple)
                }

                if data.nextTasks.isEmpty {
                    Text("All done! 🎉")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.white.opacity(0.6))
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                } else {
                    ForEach(data.nextTasks.prefix(3)) { task in
                        HStack(spacing: 8) {
                            Circle()
                                .fill(Color.priorityColor(task.priority))
                                .frame(width: 7, height: 7)
                            Text(task.title)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.white)
                                .lineLimit(1)
                            Spacer()
                            if let sub = task.subject {
                                Text(sub)
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundColor(.white.opacity(0.4))
                                    .lineLimit(1)
                            }
                        }
                    }
                }

                Spacer(minLength: 0)
            }
            .padding(14)
        }
    }
}

// ─── Medium: Streak + XP ─────────────────────────────────────────────────────

struct StreakXPWidgetView: View {
    let data: PropelWidgetData

    var body: some View {
        ZStack {
            ContainerRelativeShape().fill(Color.propelBg)
            HStack(spacing: 12) {
                // Streak
                VStack(alignment: .leading, spacing: 4) {
                    Text("🔥")
                        .font(.system(size: 20))
                    Text("\(data.streak)")
                        .font(.system(size: 32, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("day streak")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.white.opacity(0.5))
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                // Divider
                Rectangle()
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 1)

                // XP
                VStack(alignment: .leading, spacing: 4) {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.propelPurple)
                    Text(data.levelName)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 3)
                                .fill(Color.white.opacity(0.12))
                                .frame(height: 5)
                            RoundedRectangle(cornerRadius: 3)
                                .fill(Color.propelPurple)
                                .frame(width: geo.size.width * CGFloat(data.xp) / CGFloat(max(data.xpToNext, 1)), height: 5)
                        }
                    }
                    .frame(height: 5)
                    Text("\(data.xp) / \(data.xpToNext) XP")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.45))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(14)
        }
    }
}

// ─── Medium: Countdown ───────────────────────────────────────────────────────

struct CountdownWidgetView: View {
    let data: PropelWidgetData

    var body: some View {
        ZStack {
            ContainerRelativeShape().fill(Color.propelBg)
            if let title = data.countdownTitle, let days = data.countdownDays {
                HStack(spacing: 14) {
                    VStack(alignment: .leading, spacing: 4) {
                        Image(systemName: "calendar.badge.clock")
                            .font(.system(size: 16))
                            .foregroundColor(.propelPurple)
                        Text(title)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.white)
                            .lineLimit(2)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(days <= 0 ? "!" : "\(days)")
                            .font(.system(size: 44, weight: .black, design: .rounded))
                            .foregroundColor(days <= 1 ? .propelError : days <= 3 ? .propelWarning : .propelPurple)
                            .minimumScaleFactor(0.5)
                        Text(days <= 0 ? "Today!" : days == 1 ? "day left" : "days left")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
                .padding(14)
            } else {
                VStack(spacing: 6) {
                    Image(systemName: "calendar")
                        .font(.system(size: 24))
                        .foregroundColor(.white.opacity(0.3))
                    Text("No countdown set")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.4))
                }
            }
        }
    }
}

// ─── Large: Dashboard ────────────────────────────────────────────────────────

struct DashboardWidgetView: View {
    let data: PropelWidgetData

    var body: some View {
        ZStack {
            ContainerRelativeShape().fill(Color.propelBg)
            VStack(alignment: .leading, spacing: 10) {
                // Header row
                HStack {
                    VStack(alignment: .leading, spacing: 1) {
                        Text("Propel")
                            .font(.system(size: 13, weight: .black))
                            .foregroundColor(.propelPurple)
                        Text("Today's overview")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.4))
                    }
                    Spacer()
                    HStack(spacing: 8) {
                        Label("\(data.streak)🔥", systemImage: "")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.propelWarning)
                        Label("\(data.taskCount)", systemImage: "checkmark.square")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.propelPurple)
                    }
                }

                Divider().overlay(Color.white.opacity(0.08))

                // Task list
                if data.nextTasks.isEmpty {
                    Text("All done for today! 🎉")
                        .font(.system(size: 13))
                        .foregroundColor(.white.opacity(0.5))
                } else {
                    ForEach(data.nextTasks.prefix(4)) { task in
                        HStack(spacing: 8) {
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color.priorityColor(task.priority))
                                .frame(width: 3, height: 16)
                            Text(task.title)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.white)
                                .lineLimit(1)
                            Spacer()
                            if let label = task.dueDateLabel {
                                Text(label)
                                    .font(.system(size: 10))
                                    .foregroundColor(.white.opacity(0.4))
                            }
                        }
                    }
                }

                Spacer(minLength: 0)

                // XP bar
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(data.levelName)
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(.white.opacity(0.5))
                        Spacer()
                        Text("\(data.xp)/\(data.xpToNext) XP")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.4))
                    }
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 3).fill(Color.white.opacity(0.1)).frame(height: 4)
                            RoundedRectangle(cornerRadius: 3).fill(Color.propelPurple)
                                .frame(width: geo.size.width * CGFloat(data.xp) / CGFloat(max(data.xpToNext, 1)), height: 4)
                        }
                    }
                    .frame(height: 4)
                }
            }
            .padding(14)
        }
    }
}

// ─── Widget Definitions ───────────────────────────────────────────────────────

struct TasksTodayWidget: Widget {
    let kind = "TasksToday"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PropelProvider()) { entry in
            TasksTodayWidgetView(data: entry.data)
                .containerBackground(Color.propelBg, for: .widget)
        }
        .configurationDisplayName("Tasks Today")
        .description("How many tasks you have left today.")
        .supportedFamilies([.systemSmall])
    }
}

struct StreakWidget: Widget {
    let kind = "Streak"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PropelProvider()) { entry in
            StreakWidgetView(data: entry.data)
                .containerBackground(Color.propelBg, for: .widget)
        }
        .configurationDisplayName("Study Streak")
        .description("Your current daily study streak.")
        .supportedFamilies([.systemSmall])
    }
}

struct UpNextWidget: Widget {
    let kind = "UpNext"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PropelProvider()) { entry in
            UpNextWidgetView(data: entry.data)
                .containerBackground(Color.propelBg, for: .widget)
        }
        .configurationDisplayName("Up Next")
        .description("Your next tasks with priority indicators.")
        .supportedFamilies([.systemMedium])
    }
}

struct StreakXPWidget: Widget {
    let kind = "StreakXP"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PropelProvider()) { entry in
            StreakXPWidgetView(data: entry.data)
                .containerBackground(Color.propelBg, for: .widget)
        }
        .configurationDisplayName("Streak & XP")
        .description("Streak count and XP level progress side by side.")
        .supportedFamilies([.systemMedium])
    }
}

struct CountdownWidget: Widget {
    let kind = "Countdown"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PropelProvider()) { entry in
            CountdownWidgetView(data: entry.data)
                .containerBackground(Color.propelBg, for: .widget)
        }
        .configurationDisplayName("Countdown")
        .description("Days until your next big deadline.")
        .supportedFamilies([.systemMedium])
    }
}

struct DashboardWidget: Widget {
    let kind = "Dashboard"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PropelProvider()) { entry in
            DashboardWidgetView(data: entry.data)
                .containerBackground(Color.propelBg, for: .widget)
        }
        .configurationDisplayName("Propel Dashboard")
        .description("Tasks, streak, XP, and countdown all in one.")
        .supportedFamilies([.systemLarge])
    }
}
