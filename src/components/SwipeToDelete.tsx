import { useRef, useState, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

interface SwipeToDeleteProps {
  onDelete: () => void;
  children: ReactNode;
  disabled?: boolean;
}

const THRESHOLD = 80; // px to trigger delete

export function SwipeToDelete({ onDelete, children, disabled = false }: SwipeToDeleteProps) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  if (disabled) return <>{children}</>;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setSwiping(false);
    setOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (isHorizontal.current === null) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    if (!isHorizontal.current) return;

    // Only left-swipe (negative dx)
    if (dx >= 0) { setOffset(0); setSwiping(false); return; }

    e.preventDefault();
    setSwiping(true);
    // Rubber-band past threshold
    const raw = Math.abs(dx);
    const capped = raw > THRESHOLD ? THRESHOLD + (raw - THRESHOLD) * 0.3 : raw;
    setOffset(capped);
  };

  const handleTouchEnd = () => {
    if (offset >= THRESHOLD) {
      setConfirmed(true);
      setOffset(THRESHOLD);
      setTimeout(() => {
        onDelete();
        setConfirmed(false);
        setOffset(0);
        setSwiping(false);
      }, 250);
    } else {
      setOffset(0);
      setSwiping(false);
    }
    isHorizontal.current = null;
  };

  const deleteOpacity = Math.min(offset / THRESHOLD, 1);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete background */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 bg-error rounded-2xl"
        style={{ opacity: deleteOpacity, width: `${offset + 16}px` }}
      >
        <Trash2 className="h-4 w-4 text-white flex-shrink-0" style={{ opacity: offset > 20 ? 1 : 0, transition: 'opacity 0.1s' }} />
      </div>

      {/* Content layer */}
      <div
        className={`relative transition-transform ${swiping || confirmed ? '' : 'transition-transform duration-200 ease-out'}`}
        style={{ transform: `translateX(-${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
