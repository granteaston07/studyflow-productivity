import { useRef, useState, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { hapticImpact } from '@/lib/haptics';

interface SwipeToDeleteProps {
  onDelete: () => void;
  children: ReactNode;
  disabled?: boolean;
}

const THRESHOLD = 90; // px to trigger delete

type State = 'idle' | 'dragging' | 'returning' | 'flying';

export function SwipeToDelete({ onDelete, children, disabled = false }: SwipeToDeleteProps) {
  const [offset, setOffset] = useState(0);
  const [state, setState] = useState<State>('idle');
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thresholdHapticFired = useRef(false);

  if (disabled) return <>{children}</>;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (state === 'flying') return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    thresholdHapticFired.current = false;
    setState('idle');
    setOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (state === 'flying') return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (isHorizontal.current === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    if (!isHorizontal.current) return;
    if (dx >= 0) { setOffset(0); setState('idle'); return; }

    e.preventDefault();
    setState('dragging');

    const raw = Math.abs(dx);
    // Fire a light haptic exactly when crossing the threshold
    if (raw >= THRESHOLD && !thresholdHapticFired.current) {
      thresholdHapticFired.current = true;
      hapticImpact('medium');
    } else if (raw < THRESHOLD) {
      thresholdHapticFired.current = false;
    }
    // Light resistance past threshold to signal it's ready
    const dampened = raw > THRESHOLD ? THRESHOLD + (raw - THRESHOLD) * 0.15 : raw;
    setOffset(dampened);
  };

  const handleTouchEnd = () => {
    if (state === 'flying') return;
    isHorizontal.current = null;

    if (offset >= THRESHOLD) {
      // Fly card fully off screen, then delete
      setState('flying');
      hapticImpact('heavy');
      const width = containerRef.current?.offsetWidth ?? 400;
      setOffset(width + 60);
      setTimeout(() => {
        onDelete();
      }, 320);
    } else {
      // Snap back
      setState('returning');
      setOffset(0);
      setTimeout(() => setState('idle'), 300);
    }
  };

  const isDragging = state === 'dragging';
  const isFlying  = state === 'flying';
  const isReturning = state === 'returning';

  // Background fills the full card as it flies out
  const bgWidth = isFlying ? '100%' : `${Math.max(offset, 0)}px`;
  const trashOpacity = offset > 24 ? 1 : 0;
  // Scale up the icon slightly when past threshold for a satisfying "locked in" feel
  const trashScale = offset >= THRESHOLD ? 1.2 : 1;

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl">
      {/* Red background — only rendered when there's an active swipe */}
      {(offset > 0 || isFlying) && (
        <div
          className="absolute inset-y-0 right-0 bg-error rounded-2xl flex items-center justify-end pr-5"
          style={{
            width: bgWidth,
            transition: isDragging ? 'none' : isFlying ? 'width 0.32s cubic-bezier(0.4,0,0.2,1)' : 'width 0.25s ease-out',
          }}
        >
          <Trash2
            className="h-5 w-5 text-white flex-shrink-0"
            style={{
              opacity: trashOpacity,
              transform: `scale(${trashScale})`,
              transition: 'opacity 0.12s, transform 0.15s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />
        </div>
      )}

      {/* Card — slides left while dragging, flies off on confirm, snaps back on cancel */}
      <div
        style={{
          transform: `translateX(-${offset}px)`,
          transition: isDragging
            ? 'none'
            : isFlying
              ? 'transform 0.32s cubic-bezier(0.4,0,0.2,1)'
              : 'transform 0.3s cubic-bezier(0.34,1.2,0.64,1)',
          willChange: 'transform',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
