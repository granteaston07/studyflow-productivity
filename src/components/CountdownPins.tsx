import { useState } from 'react';
import { Plus, CalendarDays } from 'lucide-react';
import { SwipeToDelete } from '@/components/SwipeToDelete';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { useCountdowns } from '@/hooks/useCountdowns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';

const EMOJI_OPTIONS = ['📚', '🧪', '📝', '🏆', '💼', '🎓', '🎯', '🚀', '⚡', '🔬', '🎤', '📊'];

function daysUntilLabel(days: number) {
  if (days < 0) return 'Past due';
  if (days === 0) return 'Today!';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

function cardStyle(days: number) {
  if (days <= 0) return { bg: 'bg-error/10 border-error/30', num: 'text-error', badge: 'bg-error/15 text-error' };
  if (days <= 3) return { bg: 'bg-warning/10 border-warning/30', num: 'text-warning', badge: 'bg-warning/15 text-warning' };
  if (days <= 7) return { bg: 'bg-primary/8 border-primary/25', num: 'text-primary', badge: 'bg-primary/12 text-primary' };
  return { bg: 'bg-muted/40 border-border/50', num: 'text-foreground', badge: 'bg-muted/60 text-muted-foreground' };
}

export function CountdownPins() {
  const { countdowns, addCountdown, deleteCountdown } = useCountdowns();
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [emoji, setEmoji] = useState('📚');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = [...countdowns]
    .map(c => ({ ...c, daysLeft: differenceInCalendarDays(parseISO(c.date), today) }))
    .filter(c => c.daysLeft >= -1) // keep past-due for 1 day as reminder
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const handleAdd = () => {
    if (!title.trim() || !date) return;
    addCountdown(title.trim(), date, emoji);
    setTitle('');
    setDate('');
    setEmoji('📚');
    setAddOpen(false);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Countdowns</p>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold active:bg-primary/20 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>

        {sorted.length === 0 ? (
          <button
            onClick={() => setAddOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border border-dashed border-border/60 text-muted-foreground active:bg-muted/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Add a countdown</p>
              <p className="text-xs">Exams, projects, deadlines…</p>
            </div>
          </button>
        ) : (
          <div className="space-y-2.5">
            {sorted.map(c => {
              const style = cardStyle(c.daysLeft);
              return (
                <SwipeToDelete key={c.id} onDelete={() => deleteCountdown(c.id)}>
                  <div className={`flex items-center gap-4 px-4 py-4 rounded-2xl border ${style.bg}`}>
                    {/* Emoji */}
                    <div className="w-12 h-12 rounded-2xl bg-background/60 flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
                      {c.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground leading-tight truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(parseISO(c.date), 'MMMM d, yyyy')}
                      </p>
                    </div>

                    {/* Countdown number */}
                    <div className="flex flex-col items-end flex-shrink-0 gap-1">
                      <span className={`text-3xl font-black leading-none ${style.num}`}>
                        {c.daysLeft <= 0 ? '!' : c.daysLeft}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                        {daysUntilLabel(c.daysLeft)}
                      </span>
                    </div>
                  </div>
                </SwipeToDelete>
              );
            })}

            {/* Add another */}
            <button
              onClick={() => setAddOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-dashed border-border/50 text-xs font-semibold text-muted-foreground active:bg-muted/30 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another
            </button>
          </div>
        )}
      </div>

      {/* Add Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              New Countdown
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            {/* Emoji picker */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Pick an icon</p>
              <div className="flex gap-2 flex-wrap">
                {EMOJI_OPTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      emoji === e
                        ? 'bg-primary/15 border-2 border-primary/40 scale-110'
                        : 'bg-muted/40 border border-border/40 hover:scale-105'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">What is it?</p>
              <Input
                placeholder="e.g. Biology final exam"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                className="h-11 text-sm"
                autoFocus
              />
            </div>

            {/* Date */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Due date</p>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!title.trim() || !date}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-40 active:opacity-80 transition-opacity"
            >
              Add Countdown
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
