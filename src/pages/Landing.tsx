import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, Timer, CheckSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudyFlowLogo } from '@/components/StudyFlowLogo';
import { useAuth } from '@/hooks/useAuth';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (user) { navigate('/app'); return; }
    setMounted(true);
  }, [user]);

  if (user) return null;

  return (
    <div className={`min-h-screen bg-background transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <StudyFlowLogo size={26} />
            <span className="font-bold text-foreground text-base tracking-tight">StudyFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}
              className="text-muted-foreground hover:text-foreground hidden sm:flex">
              Sign in
            </Button>
            <Button size="sm" onClick={() => navigate('/auth?tab=signup')}
              className="gap-1.5">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute top-32 right-1/4 w-72 h-72 bg-ai-primary/6 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-foreground leading-none mb-5">
            Actually stay on top<br />
            <span className="primary-gradient-text">of your work.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Tasks, Pomodoro timers, streaks, and AI coaching —
            everything a student needs in one clean app.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button size="lg" onClick={() => navigate('/auth?tab=signup')}
              className="h-12 px-8 gap-2 text-base shadow-lg shadow-primary/20">
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/app')}
              className="h-12 px-8 text-base border-border/60">
              Try without signing up
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-y border-border/40 bg-muted/20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: CheckSquare, label: 'Tasks & subtasks', color: 'text-success', bg: 'bg-success/10' },
            { icon: Timer,       label: 'Pomodoro timer',  color: 'text-primary',  bg: 'bg-primary/10' },
            { icon: Flame,       label: 'Daily streaks',   color: 'text-warning',  bg: 'bg-warning/10' },
            { icon: Sparkles,    label: 'AI study coach',  color: 'text-ai-primary', bg: 'bg-ai-primary/10' },
          ].map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4 leading-tight">
            Ready to actually<br />
            <span className="primary-gradient-text">get things done?</span>
          </h2>
          <p className="text-muted-foreground mb-8">Free. No credit card. Works in your browser.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/auth?tab=signup')}
              className="h-12 px-10 gap-2 text-base shadow-lg shadow-primary/20">
              Create free account <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/app')}
              className="h-12 px-10 text-base text-muted-foreground hover:text-foreground">
              Try without signing up
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <StudyFlowLogo size={18} />
            <span className="text-sm font-semibold text-foreground">StudyFlow</span>
            <span className="text-xs text-muted-foreground">· Made by Grant Easton</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-foreground transition-colors">Terms</button>
            <button onClick={() => navigate('/auth')} className="hover:text-foreground transition-colors">Sign in</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
