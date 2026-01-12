import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useWidgetPreferences, WidgetPreferences } from '@/hooks/useWidgetPreferences';

const widgetLabels: Record<keyof WidgetPreferences, { label: string; description: string }> = {
  show_ai_prioritization: {
    label: 'AI Task Prioritization',
    description: 'Smart AI recommendations for task ordering',
  },
  show_progress_tracker: {
    label: 'Progress Tracker',
    description: 'Visual task completion statistics',
  },
  show_study_links: {
    label: 'Study Links',
    description: 'Quick access to your study resources',
  },
  show_quick_notes: {
    label: 'Quick Notes',
    description: 'Jot down quick notes and thoughts',
  },
  show_focus_timer: {
    label: 'Focus Timer',
    description: 'Pomodoro-style study timer',
  },
  show_analytics_dashboard: {
    label: 'Analytics Dashboard',
    description: 'Study performance analytics',
  },
  show_learning_insights: {
    label: 'Learning Insights',
    description: 'Personalized learning recommendations',
  },
  show_study_calendar: {
    label: 'Study Calendar',
    description: 'Calendar with study goals',
  },
  show_floating_status: {
    label: 'Floating Status',
    description: 'Compact task and timer status window',
  },
};

export function WidgetSettings() {
  const { preferences, loading, updatePreference } = useWidgetPreferences();

  if (loading) {
    return null;
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-primary" />
          Widget Preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Toggle widgets on or off to customize your dashboard
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(widgetLabels) as Array<keyof WidgetPreferences>).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className="flex-1 min-w-0 mr-3">
                <Label
                  htmlFor={key}
                  className="text-sm font-medium cursor-pointer"
                >
                  {widgetLabels[key].label}
                </Label>
                <p className="text-xs text-muted-foreground truncate">
                  {widgetLabels[key].description}
                </p>
              </div>
              <Switch
                id={key}
                checked={preferences[key]}
                onCheckedChange={(checked) => updatePreference(key, checked)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
