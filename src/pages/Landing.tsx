import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Flame, Timer, CheckSquare, Music, Zap, Star, ChevronRight,
  CalendarDays, Sparkles, Smartphone, Monitor, Share2, Download
} from 'lucide-react';
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-ai-primary/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
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
            Tasks with subtasks, Pomodoro timers, streaks, AI coaching, and ambient sounds —
            everything in one place so you stop switching apps and start finishing assignments.
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
            { icon: Timer, label: 'Pomodoro timer', color: 'text-primary', bg: 'bg-primary/10' },
            { icon: CheckSquare, label: 'Tasks & subtasks', color: 'text-success', bg: 'bg-success/10' },
            { icon: Sparkles, label: 'AI study coach', color: 'text-ai-primary', bg: 'bg-ai-primary/10' },
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

          {/* Tasks + subtasks */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-success text-sm font-semibold mb-4">
                <CheckSquare className="h-4 w-4" /> Tasks & Subtasks
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                Break it down.<br />Check it off.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Add subtasks to any assignment so big projects feel manageable.
                Sort by subject or priority, filter by due date, and watch your list shrink.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-card border border-border/50 rounded-2xl p-5 w-full max-w-xs shadow-xl shadow-black/5 space-y-2">
                {[
                  { label: 'Write intro paragraph', done: true, sub: null },
                  { label: 'Research paper', done: false, sub: '2 / 4 subtasks' },
                  { label: 'Math problem set', done: false, sub: '0 / 6 subtasks' },
                ].map(({ label, done, sub }) => (
                  <div key={label} className={`flex items-start gap-2.5 p-3 rounded-xl border ${done ? 'border-success/20 bg-success/5' : 'border-border/50 bg-muted/20'}`}>
                    <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${done ? 'bg-success' : 'border border-border/60 bg-background'}`}>
                      {done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{label}</p>
                      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Focus timer + auto-pomodoro */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-4">
                <Timer className="h-4 w-4" /> Focus Timer
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                Lock in.<br />Auto-cycle breaks.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Pick a 25-minute focus session or the auto-cycling 20/5 Pomodoro mode.
                Breaks start automatically — no babysitting required.
                The timer keeps running even when you switch tabs.
              </p>
            </div>
            <div className="md:order-1 flex justify-center">
              <div className="bg-card border border-border/50 rounded-2xl p-8 w-full max-w-xs shadow-xl shadow-black/5">
                <div className="text-center space-y-4">
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
                  <div className="flex gap-2 justify-center">
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold border border-primary/20">20/5 auto</div>
                    <div className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-xs font-medium">25m</div>
                    <div className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-xs font-medium">45m</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Coach */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-ai-primary text-sm font-semibold mb-4">
                <Sparkles className="h-4 w-4" /> AI Study Coach
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                Stuck? Ask your<br />built-in coach.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Get AI-powered tips on any task — study strategies, time estimates,
                how to break down complex work. Your daily brief tells you what to tackle first.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-card border border-border/50 rounded-2xl p-5 w-full max-w-xs shadow-xl shadow-black/5 space-y-3">
                <div className="flex items-center gap-2 text-ai-primary text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5" /> AI Daily Brief
                </div>
                <p className="text-sm text-foreground font-medium leading-snug">
                  You have 3 tasks due this week. Start with the research paper — it needs the most time.
                </p>
                <div className="pt-1 border-t border-border/40 space-y-2">
                  <div className="text-xs text-muted-foreground font-medium">Study tip for Math problem set:</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Break it into 2–3 problems per session. Use the 25m timer and aim to finish half today.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar + subjects */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <div className="inline-flex items-center gap-2 text-warning text-sm font-semibold mb-4">
                <CalendarDays className="h-4 w-4" /> Calendar & Subjects
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                See the full picture.<br />Stay ahead of deadlines.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                A monthly calendar shows every due date at a glance — tap a day to filter your task list.
                Organize everything by subject with custom colors.
              </p>
            </div>
            <div className="md:order-1 flex justify-center">
              <div className="bg-card border border-border/50 rounded-2xl p-5 w-full max-w-xs shadow-xl shadow-black/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-foreground">April 2025</span>
                  <div className="flex gap-1">
                    {['M','T','W','T','F','S','S'].map((d, i) => (
                      <div key={i} className="w-7 text-center text-xs text-muted-foreground font-medium">{d}</div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                    <div key={day} className={`h-7 flex flex-col items-center justify-center rounded-lg text-xs relative ${day === 15 ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground hover:bg-muted/50'}`}>
                      {day}
                      {[3, 8, 14, 15, 22, 28].includes(day) && day !== 15 && (
                        <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-warning" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  {[{ color: 'bg-primary/60', label: 'Math' }, { color: 'bg-warning/60', label: 'History' }, { color: 'bg-success/60', label: 'English' }].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-warning text-sm font-semibold mb-4">
                <Flame className="h-4 w-4 streak-fire" /> Streaks
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                Build the habit.<br />Watch it compound.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Study every day and your streak grows. Earn XP for every task you finish,
                level up over time, and make consistency feel rewarding.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-card border border-border/50 rounded-2xl p-8 w-full max-w-xs shadow-xl shadow-black/5">
                <div className="text-center">
                  <div className="text-6xl mb-2 streak-fire">🔥</div>
                  <div className="text-5xl font-black text-foreground mb-1">14</div>
                  <div className="text-muted-foreground text-sm font-medium mb-4">day streak</div>
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${i < 6 ? 'bg-warning/20 text-warning font-bold' : 'bg-muted text-muted-foreground'}`}>
                        {i < 6 ? '✓' : '·'}
                      </div>
                    ))}
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-ai-primary rounded-full" style={{ width: '72%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Scholar III · 1,440 / 2,000 XP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ambient sounds + quick links */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <div className="inline-flex items-center gap-2 text-ai-primary text-sm font-semibold mb-4">
                <Music className="h-4 w-4" /> Ambient Sounds & Quick Links
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                Everything in reach.<br />Nothing in the way.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Rain, café noise, lo-fi beats — pick your focus sound.
                Pin your most-used resources as quick links so you never have to hunt for a tab.
              </p>
            </div>
            <div className="md:order-1 flex justify-center gap-3">
              <div className="bg-card border border-border/50 rounded-2xl p-5 w-36 shadow-xl shadow-black/5 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Sounds</p>
                {[
                  { emoji: '🌧️', label: 'Rain', active: true },
                  { emoji: '☕', label: 'Café', active: false },
                  { emoji: '🌊', label: 'Waves', active: false },
                ].map(({ emoji, label, active }) => (
                  <div key={label} className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${active ? 'border-primary/30 bg-primary/8' : 'border-border/50 bg-muted/30'}`}>
                    <span className="text-base">{emoji}</span>
                    <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-5 w-36 shadow-xl shadow-black/5 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Quick Links</p>
                {[
                  { emoji: '📚', label: 'Canvas' },
                  { emoji: '🔍', label: 'Scholar' },
                  { emoji: '📝', label: 'Docs' },
                ].map(({ emoji, label }) => (
                  <div key={label} className="flex items-center gap-2 p-2 rounded-xl border border-border/50 bg-muted/30">
                    <span className="text-base">{emoji}</span>
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
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
            See your progress compound — separately for every account.
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

      {/* Install / Get the app */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Add it to your devices
            </h2>
            <p className="text-muted-foreground text-lg">
              StudyFlow works like a native app on Mac and iPhone — no App Store required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Mac */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xl shadow-black/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Monitor className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Mac</p>
                  <p className="text-xs text-muted-foreground">Chrome or Edge</p>
                </div>
              </div>
              <ol className="space-y-3">
                {[
                  { n: '1', text: 'Open studyflow.us in Chrome or Edge' },
                  { n: '2', text: 'Click the install icon (⊕) in the address bar — or open the browser menu and choose "Install StudyFlow"' },
                  { n: '3', text: 'Click Install. StudyFlow lands in your Applications folder and Dock.' },
                ].map(({ n, text }) => (
                  <li key={n} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                    <p className="text-sm text-muted-foreground leading-snug">{text}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-5 p-3 rounded-xl bg-muted/40 border border-border/40">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Safari on Mac:</span> File → Add to Dock. Works the same way.
                </p>
              </div>
            </div>

            {/* iPhone */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xl shadow-black/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-bold text-foreground">iPhone</p>
                  <p className="text-xs text-muted-foreground">Safari required</p>
                </div>
              </div>
              <ol className="space-y-3">
                {[
                  { n: '1', text: 'Open studyflow.us in Safari (must be Safari, not Chrome)' },
                  { n: '2', text: 'Tap the Share button at the bottom of the screen (the box with an arrow pointing up)' },
                  { n: '3', text: 'Scroll down and tap "Add to Home Screen", then tap Add.' },
                ].map(({ n, text }) => (
                  <li key={n} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-success/15 text-success text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                    <p className="text-sm text-muted-foreground leading-snug">{text}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-5 p-3 rounded-xl bg-muted/40 border border-border/40">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">iPad works too.</span> Same steps — tap the Share icon in the top toolbar.
                </p>
              </div>
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
