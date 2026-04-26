import WidgetKit
import SwiftUI

@main
struct PropelWidgetsBundle: WidgetBundle {
    var body: some Widget {
        TasksTodayWidget()
        StreakWidget()
        UpNextWidget()
        StreakXPWidget()
        CountdownWidget()
        DashboardWidget()
    }
}
