import Foundation

// Shared data model read by all widgets
// Written by the main app via WidgetDataPlugin, read here via App Group UserDefaults

let appGroupID = "group.us.studyflow.app"

struct WidgetTask: Codable, Identifiable {
    let id: String
    let title: String
    let priority: String  // "high" | "medium" | "low"
    let subject: String?
    let dueDateLabel: String?
}

struct PropelWidgetData: Codable {
    var taskCount: Int
    var completedToday: Int
    var streak: Int
    var levelName: String
    var xp: Int
    var xpToNext: Int
    var nextTasks: [WidgetTask]
    var countdownTitle: String?
    var countdownDays: Int?
    var lastUpdated: Date

    static var placeholder: PropelWidgetData {
        PropelWidgetData(
            taskCount: 4,
            completedToday: 2,
            streak: 7,
            levelName: "Scholar II",
            xp: 320,
            xpToNext: 500,
            nextTasks: [
                WidgetTask(id: "1", title: "Biology reading", priority: "high", subject: "Bio", dueDateLabel: "Due today"),
                WidgetTask(id: "2", title: "Math problem set", priority: "medium", subject: "Math", dueDateLabel: "Due tomorrow"),
                WidgetTask(id: "3", title: "Essay outline", priority: "low", subject: "English", dueDateLabel: nil),
            ],
            countdownTitle: "Biology Final",
            countdownDays: 5,
            lastUpdated: Date()
        )
    }

    static func load() -> PropelWidgetData {
        guard
            let defaults = UserDefaults(suiteName: appGroupID),
            let data = defaults.data(forKey: "propel_widget_data"),
            let decoded = try? JSONDecoder().decode(PropelWidgetData.self, from: data)
        else {
            return .placeholder
        }
        return decoded
    }
}
