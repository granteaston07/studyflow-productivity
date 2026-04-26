import { X, CheckSquare, Timer, Flame, Zap, TrendingUp, CalendarDays, Sparkles, BookOpen, Info } from 'lucide-react';

interface WidgetGalleryProps {
  onClose: () => void;
}

interface WidgetDef {
  id: string;
  name: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  preview: React.ReactNode;
}

const WIDGETS: WidgetDef[] = [
  {
    id: 'tasks-today',
    name: 'Tasks Today',
    description: 'Shows how many tasks you have left today.',
    size: 'small',
    preview: (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl">
        <CheckSquare className="h-4 w-4 text-primary" />
        <div>
          <p className="text-2xl font-black text-foreground leading-none">3</p>
          <p className="text-[10px] text-muted-foreground font-medium">tasks left</p>
        </div>
      </div>
    ),
  },
  {
    id: 'streak',
    name: 'Study Streak',
    description: 'Your daily study streak at a glance.',
    size: 'small',
    preview: (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-gradient-to-br from-warning/20 to-warning/5 rounded-2xl">
        <span className="text-lg">🔥</span>
        <div>
          <p className="text-2xl font-black text-foreground leading-none">12</p>
          <p className="text-[10px] text-muted-foreground font-medium">day streak</p>
        </div>
      </div>
    ),
  },
  {
    id: 'xp',
    name: 'XP Progress',
    description: 'Your XP bar and level.',
    size: 'small',
    preview: (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-gradient-to-br from-primary/15 to-transparent rounded-2xl">
        <Zap className="h-4 w-4 text-primary" />
        <div>
          <p className="text-[10px] font-semibold text-foreground">Scholar II</p>
          <div className="mt-1 w-full bg-muted/50 rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: '60%' }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">300 / 500 XP</p>
        </div>
      </div>
    ),
  },
  {
    id: 'focus-timer',
    name: 'Focus Timer',
    description: 'Start or see your active Pomodoro timer.',
    size: 'medium',
    preview: (
      <div className="w-full h-full flex items-center gap-3 p-3 bg-gradient-to-br from-primary/15 to-transparent rounded-2xl">
        <div className="w-12 h-12 rounded-full border-2 border-primary/40 flex items-center justify-center flex-shrink-0">
          <Timer className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xl font-black text-foreground leading-none">24:58</p>
          <p className="text-[10px] text-muted-foreground">Focus session</p>
          <div className="mt-1 w-20 bg-muted/50 rounded-full h-1">
            <div className="bg-primary h-1 rounded-full" style={{ width: '4%' }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'next-tasks',
    name: 'Up Next',
    description: 'Your next 3 tasks with priorities.',
    size: 'medium',
    preview: (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-card rounded-2xl">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Up Next</p>
        <div className="space-y-1.5">
          {[
            { title: 'Math homework', dot: 'bg-error' },
            { title: 'Read chapter 5', dot: 'bg-warning' },
            { title: 'Essay outline', dot: 'bg-success' },
          ].map(t => (
            <div key={t.title} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.dot}`} />
              <p className="text-[10px] text-foreground font-medium truncate">{t.title}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'countdown',
    name: 'Countdown',
    description: 'Countdown to your next due date.',
    size: 'medium',
    preview: (
      <div className="w-full h-full flex items-center gap-3 p-3 bg-gradient-to-br from-error/10 to-transparent rounded-2xl">
        <CalendarDays className="h-5 w-5 text-error flex-shrink-0" />
        <div>
          <p className="text-2xl font-black text-foreground leading-none">3</p>
          <p className="text-[10px] text-muted-foreground font-medium">days until</p>
          <p className="text-[10px] font-semibold text-foreground truncate">Biology exam</p>
        </div>
      </div>
    ),
  },
  {
    id: 'weekly-progress',
    name: 'Weekly Progress',
    description: 'Bar chart of tasks completed each day this week.',
    size: 'large',
    preview: (
      <div className="w-full h-full p-3 bg-card rounded-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">This Week</p>
          <TrendingUp className="h-3 w-3 text-primary" />
        </div>
        <div className="flex items-end gap-1 flex-1 py-2">
          {[3, 5, 2, 6, 4, 0, 0].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-sm ${h > 0 ? 'bg-primary/60' : 'bg-muted/40'}`}
                style={{ height: `${Math.max(h * 6, 4)}px` }}
              />
              <span className="text-[8px] text-muted-foreground">
                {['M','T','W','T','F','S','S'][i]}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">20 tasks this week</p>
      </div>
    ),
  },
  {
    id: 'ai-tip',
    name: 'AI Study Tip',
    description: 'Daily AI-generated study tip or motivation.',
    size: 'large',
    preview: (
      <div className="w-full h-full p-3 bg-gradient-to-br from-ai-primary/15 via-transparent to-transparent rounded-2xl flex flex-col justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-ai-primary" />
          <p className="text-[9px] font-bold text-ai-primary uppercase tracking-wider">AI Tip</p>
        </div>
        <p className="text-[11px] text-foreground leading-relaxed font-medium">
          "Break your biggest task into 3 micro-steps. Start with the easiest one to build momentum."
        </p>
        <p className="text-[9px] text-muted-foreground">Tap to get a new tip</p>
      </div>
    ),
  },
  {
    id: 'subject-focus',
    name: 'Subject Focus',
    description: 'Tasks grouped by your top subject today.',
    size: 'large',
    preview: (
      <div className="w-full h-full p-3 bg-card rounded-2xl flex flex-col justify-between">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3 w-3 text-primary" />
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Math · 3 tasks</p>
        </div>
        <div className="space-y-1.5">
          {['Algebra worksheet', 'Review chapter 4', 'Practice problems'].map(t => (
            <div key={t} className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm border border-border/60 flex-shrink-0" />
              <p className="text-[10px] text-foreground truncate">{t}</p>
            </div>
          ))}
        </div>
        <div className="w-full bg-muted/40 rounded-full h-1">
          <div className="bg-primary h-1 rounded-full" style={{ width: '33%' }} />
        </div>
      </div>
    ),
  },
];

const SIZE_LABELS: Record<WidgetDef['size'], string> = {
  small: 'Small · 2×2',
  medium: 'Medium · 2×4',
  large: 'Large · 4×4',
};

const SIZE_DIMS: Record<WidgetDef['size'], string> = {
  small: 'w-[80px] h-[80px]',
  medium: 'w-[168px] h-[80px]',
  large: 'w-[168px] h-[168px]',
};

export function WidgetGallery({ onClose }: WidgetGalleryProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-background rounded-t-3xl sm:rounded-3xl border border-border/50 flex flex-col overflow-hidden"
        style={{ height: 'min(620px, 88dvh)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">Home Screen Widgets</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Add Propel widgets to your iOS home screen</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* How to add */}
        <div className="mx-5 mb-3 flex-shrink-0 flex items-start gap-2.5 p-3 rounded-xl bg-primary/8 border border-primary/20">
          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            On your iPhone, <strong className="text-foreground">long-press the home screen</strong> → tap <strong className="text-foreground">+</strong> → search <strong className="text-foreground">Propel</strong> → choose a widget.
          </p>
        </div>

        {/* Widget list */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
          {(['small', 'medium', 'large'] as const).map(size => {
            const group = WIDGETS.filter(w => w.size === size);
            return (
              <div key={size}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {SIZE_LABELS[size]}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {group.map(widget => (
                    <div key={widget.id} className="flex flex-col gap-2">
                      <div className={`${SIZE_DIMS[size]} ${size === 'large' ? 'w-full' : ''}`}>
                        {widget.preview}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{widget.name}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{widget.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
