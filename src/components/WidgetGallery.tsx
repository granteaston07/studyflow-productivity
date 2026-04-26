import { X, Smartphone, Sparkles } from 'lucide-react';

interface WidgetGalleryProps {
  onClose: () => void;
}

export function WidgetGallery({ onClose }: WidgetGalleryProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-background rounded-t-3xl sm:rounded-3xl border border-border/50 flex flex-col overflow-hidden"
        style={{ height: 'min(400px, 70dvh)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Smartphone className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Home Screen Widgets</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Coming soon content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 gap-5 text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="h-9 w-9 text-primary" />
          </div>
          <div>
            <p className="text-lg font-black text-foreground mb-2">Coming Soon</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Home screen widgets are in the works — tasks, streak, countdown, and more, right on your lock screen.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold active:opacity-80"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
