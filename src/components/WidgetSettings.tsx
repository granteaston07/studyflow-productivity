import { useState } from 'react';
import { Settings, ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useWidgetPreferences, WidgetPreferences } from '@/hooks/useWidgetPreferences';
import { cn } from '@/lib/utils';

const widgetLabels: Record<keyof WidgetPreferences, { label: string }> = {
  show_ai_prioritization: { label: 'AI Prioritization' },
  show_progress_tracker: { label: 'Progress Tracker' },
  show_study_links: { label: 'Study Links' },
  show_quick_notes: { label: 'Quick Notes' },
  show_focus_timer: { label: 'Focus Timer' },
  show_analytics_dashboard: { label: 'Analytics' },
  show_learning_insights: { label: 'Learning Insights' },
  show_study_calendar: { label: 'Study Calendar' },
  show_floating_status: { label: 'Floating Status' },
};

export function WidgetSettings() {
  const { preferences, loading, updatePreference } = useWidgetPreferences();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return null;

  return (
    <div className="flex flex-col items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground text-xs gap-1.5"
      >
        <Settings className="h-3.5 w-3.5" />
        Widget Preferences
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </Button>
      
      {isOpen && (
        <div className="mt-3 p-4 rounded-lg bg-card border border-border shadow-lg z-50 w-full max-w-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(Object.keys(widgetLabels) as Array<keyof WidgetPreferences>).map((key) => (
              <div key={key} className="flex items-center justify-between gap-2 text-sm">
                <Label htmlFor={key} className="text-xs cursor-pointer">
                  {widgetLabels[key].label}
                </Label>
                <Switch
                  id={key}
                  checked={preferences[key]}
                  onCheckedChange={(checked) => updatePreference(key, checked)}
                  className="scale-75"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
