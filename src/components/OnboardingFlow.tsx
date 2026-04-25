import { useState } from "react";
import { CheckSquare, Timer, BarChart2, ArrowRight } from "lucide-react";
import { StudyFlowLogo } from "@/components/StudyFlowLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OnboardingFlowProps {
  onComplete: (name: string) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");

  const handleNameSubmit = () => {
    const trimmed = name.trim();
    setName(trimmed);
    setStep(2);
  };

  const TIPS = [
    { icon: CheckSquare, label: "Add tasks", desc: "Use the Tasks tab to track everything due." },
    { icon: Timer,       label: "Focus timer", desc: "Lock in with a Pomodoro in the Focus tab." },
    { icon: BarChart2,   label: "Track progress", desc: "See your streaks and stats at a glance." },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-scale-in">

        {step === 1 && (
          <div className="space-y-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <StudyFlowLogo size={52} />
              <h1 className="text-2xl font-bold primary-gradient-text">Welcome to StudyFlow</h1>
              <p className="text-sm text-muted-foreground">What should we call you?</p>
            </div>

            <div className="space-y-3">
              <Input
                autoFocus
                placeholder="Your first name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && name.trim() && handleNameSubmit()}
                className="text-center text-base h-11"
              />
              <Button
                className="w-full h-11 gap-2"
                disabled={!name.trim()}
                onClick={handleNameSubmit}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                onClick={() => { setName(""); setStep(2); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <StudyFlowLogo size={52} />
              <h1 className="text-2xl font-bold text-foreground">
                {name ? `Hey ${name}, you're all set!` : "You're all set!"}
              </h1>
              <p className="text-sm text-muted-foreground">Here's how to get the most out of StudyFlow.</p>
            </div>

            <div className="space-y-2 text-left">
              {TIPS.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full h-11 gap-2" onClick={() => onComplete(name)}>
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
