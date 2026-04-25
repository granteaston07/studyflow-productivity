import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface SoundOption {
  id: string;
  emoji: string;
  label: string;
  frequency: number;
  type: OscillatorType | 'pink' | 'brown';
}

const SOUNDS: SoundOption[] = [
  { id: 'rain', emoji: '🌧️', label: 'Rain', frequency: 200, type: 'pink' },
  { id: 'cafe', emoji: '☕', label: 'Coffee Shop', frequency: 400, type: 'brown' },
  { id: 'white', emoji: '🌊', label: 'White Noise', frequency: 0, type: 'pink' },
  { id: 'night', emoji: '🌙', label: 'Night', frequency: 100, type: 'sine' },
  { id: 'deep', emoji: '🎧', label: 'Deep Focus', frequency: 40, type: 'sine' },
];

// Creates noise using Web Audio API
function createNoiseNode(ctx: AudioContext, type: 'pink' | 'brown' | 'white') {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  return src;
}

export function AmbientSounds() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.3);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | OscillatorNode | null>(null);

  const stopCurrent = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current = null;
    }
  };

  const play = (sound: SoundOption) => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    stopCurrent();

    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    if (sound.type === 'pink' || sound.type === 'brown') {
      const node = createNoiseNode(ctx, sound.type);
      if (sound.frequency > 0) {
        // Add a low pass filter for texture
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = sound.frequency * 8;
        node.connect(filter);
        filter.connect(gain);
      } else {
        node.connect(gain);
      }
      node.start();
      sourceRef.current = node;
    } else {
      const osc = ctx.createOscillator();
      osc.type = sound.type as OscillatorType;
      osc.frequency.value = sound.frequency;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      osc.connect(filter);
      filter.connect(gain);
      osc.start();
      sourceRef.current = osc;
    }
  };

  const toggle = (sound: SoundOption) => {
    if (activeId === sound.id) {
      stopCurrent();
      setActiveId(null);
    } else {
      play(sound);
      setActiveId(sound.id);
    }
  };

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopCurrent();
      ctxRef.current?.close();
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {SOUNDS.map((sound) => {
          const isActive = activeId === sound.id;
          return (
            <button
              key={sound.id}
              onClick={() => toggle(sound)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-150 text-center min-h-[64px] ${
                isActive
                  ? 'border-primary/40 bg-primary/10 shadow-sm shadow-primary/10'
                  : 'border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-border active:bg-muted/80'
              }`}
            >
              <span className="text-xl leading-none">{sound.emoji}</span>
              <span className={`text-xs font-medium leading-tight ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {sound.label}
              </span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            </button>
          );
        })}
      </div>

      {activeId && (
        <div className="flex items-center gap-3 pt-1">
          <VolumeX className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <Slider
            value={[volume]}
            onValueChange={([v]) => setVolume(v)}
            min={0} max={1} step={0.02}
            className="flex-1"
          />
          <Volume2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        </div>
      )}
    </div>
  );
}
