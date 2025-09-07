import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PartyPopper, RotateCcw } from 'lucide-react';

interface TimerCelebrationProps {
  isVisible: boolean;
  onDismiss: () => void;
  onReset: () => void;
}

const TimerCelebration = ({ isVisible, onDismiss, onReset }: TimerCelebrationProps) => {
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'][Math.floor(Math.random() * 7)],
        delay: Math.random() * 2
      }));
      setConfettiPieces(pieces);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-md animate-fade-in">
      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 rounded-full animate-bounce"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: '2s',
            animationIterationCount: 'infinite'
          }}
        />
      ))}
      
      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: '3s'
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Main celebration content */}
      <div className="relative z-10 text-center space-y-8 p-8 rounded-2xl bg-card/90 backdrop-blur-sm border shadow-2xl animate-scale-in w-full max-w-md">
        {/* Party icon with animation */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center animate-pulse">
            <PartyPopper className="w-12 h-12 text-primary-foreground" />
          </div>
          
          {/* Animated rings */}
          <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-primary/30 rounded-full animate-ping" />
          <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-secondary/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Success message */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-primary animate-fade-in">
            🎉 Amazing Work! 🎉
          </h2>
          <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Your focus session is complete!
          </p>
          <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Take a well-deserved break or start a new session.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button 
            onClick={onReset}
            className="flex-1 h-12 text-lg font-semibold hover:scale-105 transition-all duration-300"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Continue Study Session
          </Button>
          <Button 
            variant="outline" 
            onClick={onDismiss}
            className="flex-1 h-12 text-lg font-semibold hover:scale-105 transition-all duration-300"
          >
            Take a Break
          </Button>
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-primary animate-pulse" />
      </div>
    </div>
  );
};

export default TimerCelebration;