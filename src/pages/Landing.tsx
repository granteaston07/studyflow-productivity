import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, Timer, CheckSquare, Music, Zap, Star, ChevronRight } from 'lucide-react';
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
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <StudyFlowLogo size={28} />
            <span className="font-bold text-foreground text-base tracking-tight">StudyFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-foreground hidden sm:flex">
              Sign in
            </Button>
            <Button size="sm" onClick={() => navigate('/auth?tab=signup')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-ai-primary/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Social proof pill */}
          <div className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-8 border border-border/50">
            <span className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-warning text-warning" />
              ))}
            </span>
            <span>Used by students everywhere</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-foreground leading-none mb-6">
            Actually stay on top<br />
            <span className="primary-gradient-text">of your work.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Tasks, focus timers, streaks, and ambient sounds —
            everything you need to stop procrastinating and start shipping assignments.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button size="lg" onClick={() => navigate('/auth?tab=signup')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base h-12 px-8 gap-2 shadow-lg shadow-primary/20">
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/app')}
              className="text-base h-12 px-8 border-border/60 hover:bg-muted/60">
              Try it first — no sign up
            </Button>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="py-16 px-4 border-y border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Flame, label: 'Daily streaks', color: 'text-warning', bg: 'bg-warning/10' },
            { icon: Timer, label: 'Focus timer', color: 'text-primary', bg: 'bg-primary/10' },
            { icon: CheckSquare, label: 'Smart tasks', color: 'text-success', bg: 'bg-success/10' },
            { icon: Music, label: 'Ambient sounds', color: 'text-ai-primary', bg: 'bg-ai-primary/10' },
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

      {/* Features deep dive */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto space-y-20">

          {/* Streak feature */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-warning text-sm font-semibold mb-4">
                <Flame className="h-4 w-4 streak-fire" /> Streaks
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                Build the habit.<br />Watch it compound.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Study every day and your streak grows. Miss a day and it resets.
                It sounds simple because it is — and it works.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-card border border-border/50 rounded-2xl p-8 w-full max-w-xs shadow-xl shadow-black/5">
                <div className="text-center">
                  <div className="text-6xl mb-2 streak-fire">🔥</div>
                  <div className="text-5xl font-black text-foreground mb-1">14</div>
                  <div className="text-muted-foreground text-sm font-medium">day streak</div>
                  <div className="mt-4 flex justify-center gap-1">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${i < 6 ? 'bg-warning/20 text-warning font-bold' : 'bg-muted text-muted-foreground'}`}>
                        {i < 6 ? '✓' : '·'}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">This week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Focus timer */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-4">
                <Timer className="h-4 w-4" /> Focus Timer
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                Lock in.<br />Time yourself.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Pick a session, hit start. Work for 25 minutes, take a 5 minute break.
                Your brain works better in sprints — science backs it, we built it.
              </p>
            </div>
            <div className="md:order-1 flex justify-center">
              <div className="bg-card border border-border/50 rounded-2xl p-8 w-full max-w-xs shadow-xl shadow-black/5">
                <div className="text-center space-y-4">
                  {/* Circular timer preview */}
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" strokeWidth="8" className="stroke-muted" />
                      <circle cx="60" cy="60" r="50" fill="none" strokeWidth="8"
                        stroke="hsl(var(--primary))" strokeLinecap="round"
                        strokeDasharray="314" strokeDashoffset="94"
                        className="transition-all duration-500" />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-2xl font-black text-foreground tabular-nums">19:32</div>
                      <div className="text-xs text-muted-foreground">remaining</div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                    🧠 Lock In — 25m
                  </div>
                  <div className="flex justify-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                      <div className="w-0 h-0 border-t-4 border-b-4 border-l-7 border-transparent border-l-white ml-0.5" />
                    </div>
                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                      <div className="text-muted-foreground text-xs font-bold">↺</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ambient sounds */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-ai-primary text-sm font-semibold mb-4">
                <Music className="h-4 w-4" /> Ambient Sounds
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                Set the vibe.<br />Block out everything.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Rain, coffee shop, white noise — built right in.
                No Spotify tab. No ads. Just the sounds that help you focus.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-xs shadow-xl shadow-black/5 space-y-3">
                {[
                  { emoji: '🌧️', label: 'Rain', active: true },
                  { emoji: '☕', label: 'Coffee Shop', active: false },
                  { emoji: '🌊', label: 'White Noise', active: false },
                  { emoji: '🌙', label: 'Night Ambience', active: false },
                ].map(({ emoji, label, active }) => (
                  <div key={label}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${active ? 'border-primary/30 bg-primary/8' : 'border-border/50 bg-muted/30'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{emoji}</span>
                      <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                    </div>
                    {active && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* XP / gamification section */}
      <section className="py-20 px-4 bg-muted/20 border-y border-border/40">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-ai-secondary text-sm font-semibold mb-4">
            <Zap className="h-4 w-4" /> XP & Levels
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Completing tasks actually feels good.
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Earn XP every time you finish a task. Level up over time.
            See your progress compound.
          </p>
          <div className="bg-card border border-border/50 rounded-2xl p-6 max-w-sm mx-auto shadow-xl shadow-black/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Level</div>
                  <div className="text-sm font-bold text-foreground">Scholar IV</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">XP</div>
                <div className="text-sm font-bold text-primary">2,840 / 3,000</div>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-ai-primary rounded-full" style={{ width: '94%' }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>+50 XP per task</span>
              <span>160 XP to next level</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4 leading-tight">
            Ready to actually<br />
            <span className="primary-gradient-text">get things done?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Free. No credit card. Works in your browser.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/auth?tab=signup')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base h-12 px-10 gap-2 shadow-lg shadow-primary/20">
              Create free account <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/app')}
              className="text-base h-12 px-10 text-muted-foreground hover:text-foreground gap-1">
              Try without signing up <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <StudyFlowLogo size={20} />
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
