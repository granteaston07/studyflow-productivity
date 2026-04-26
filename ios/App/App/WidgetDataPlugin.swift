import Foundation
import Capacitor
import WidgetKit

// Called from JavaScript whenever task/streak/XP data changes.
// Writes a JSON snapshot to the shared App Group UserDefaults so widgets can read it.

@objc(WidgetDataPlugin)
public class WidgetDataPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetDataPlugin"
    public let jsName = "WidgetData"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise)
    ]

    private let appGroupID = "group.us.studyflow.app"

    @objc func update(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            call.reject("App Group not configured")
            return
        }

        // Build JSON from JS payload
        var payload: [String: Any] = [
            "taskCount":      call.getInt("taskCount") ?? 0,
            "completedToday": call.getInt("completedToday") ?? 0,
            "streak":         call.getInt("streak") ?? 0,
            "levelName":      call.getString("levelName") ?? "Rookie",
            "xp":             call.getInt("xp") ?? 0,
            "xpToNext":       call.getInt("xpToNext") ?? 500,
            "lastUpdated":    ISO8601DateFormatter().string(from: Date()),
        ]

        if let tasks = call.getArray("nextTasks") as? [[String: Any]] {
            payload["nextTasks"] = tasks
        }
        if let ct = call.getString("countdownTitle") {
            payload["countdownTitle"] = ct
        }
        if let cd = call.getInt("countdownDays") {
            payload["countdownDays"] = cd
        }

        if let data = try? JSONSerialization.data(withJSONObject: payload) {
            defaults.set(data, forKey: "propel_widget_data")
        }

        // Tell WidgetKit to reload all timelines
        WidgetCenter.shared.reloadAllTimelines()

        call.resolve()
    }
}
