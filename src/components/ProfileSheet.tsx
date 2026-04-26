import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, Sun, Moon, Laptop, Bell, BellOff, Check, Pencil, X,
  Shield, Palette, Link, BookOpen, ChevronRight, Info, Snowflake,
  Smartphone,
} from "lucide-react";

const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import { useAccentColor, AccentColor } from "@/hooks/useAccentColor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STREAK_FREEZE_KEY = 'propel_streak_freeze';

function getStreakFreezeState(): { available: number; lastGranted: string } {
  try {
    const raw = localStorage.getItem(STREAK_FREEZE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Grant 1 on first load
  const state = { available: 1, lastGranted: new Date().toISOString().split('T')[0] };
  localStorage.setItem(STREAK_FREEZE_KEY, JSON.stringify(state));
  return state;
}

function useStreakFreeze() {
  const [freezeState, setFreezeState] = useState(() => getStreakFreezeState());

  const useFreeze = () => {
    if (freezeState.available < 1) {
      toast.error("No streak freeze available. Earn one by maintaining a 7-day streak!");
      return false;
    }
    const next = { ...freezeState, available: freezeState.available - 1 };
    localStorage.setItem(STREAK_FREEZE_KEY, JSON.stringify(next));
    setFreezeState(next);
    toast.success("Streak freeze used! Your streak is protected for today. ❄️");
    return true;
  };

  return { available: freezeState.available, useFreeze };
}

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  streakCount: number;
  level: number;
  levelName: string;
  xpInLevel: number;
  xpToNext: number;
  xpProgress: number;
  completedCount: number;
  onManageSubjects?: () => void;
  onManageLinks?: () => void;
  onOpenWidgets?: () => void;
}

export function ProfileSheet({
  open, onOpenChange, userName,
  streakCount, level, levelName, xpInLevel, xpToNext, xpProgress, completedCount,
  onManageSubjects, onManageLinks, onOpenWidgets,
}: ProfileSheetProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { permission, requestPermission, settings, updateSettings } = useNotifications();
  const { accentColor, setAccentColor, accentColors } = useAccentColor();
  const { available: freezesAvailable, useFreeze } = useStreakFreeze();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showStreakInfo, setShowStreakInfo] = useState(false);

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const email = user?.email ?? null;

  const startEditName = () => {
    setNameInput(displayName);
    setEditingName(true);
  };

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } });
    if (error) { toast.error("Failed to update name"); return; }
    toast.success("Name updated");
    setEditingName(false);
  };

  if (showStreakInfo) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-full sm:w-80 flex flex-col gap-0 p-0">
          <SheetHeader className="flex-shrink-0 px-5 pb-4 border-b border-border/40" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowStreakInfo(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60">
                <X className="h-4 w-4" />
              </button>
              <SheetTitle className="text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                How Streaks Work
              </SheetTitle>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <div className="flex items-center justify-center py-4">
              <span className="text-5xl streak-fire">🔥</span>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1.5">
                <p className="font-semibold text-foreground text-sm">What counts as a study day?</p>
                <p>Complete at least one task on a given day to count it as an active study day.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1.5">
                <p className="font-semibold text-foreground text-sm">Building your streak</p>
                <p>Each consecutive day you complete a task, your streak grows by 1. Miss a day and the streak resets to 0 — unless you use a freeze.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1.5">
                <p className="font-semibold text-foreground text-sm">❄️ Streak Freeze</p>
                <p>A streak freeze protects your streak for one day when you can't study. Use it wisely — you get one freeze, and earn more by hitting 7-day milestones.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1.5">
                <p className="font-semibold text-foreground text-sm">Streak milestones</p>
                <ul className="space-y-1 mt-1">
                  <li>🔥 3 days — Building momentum</li>
                  <li>🔥🔥 7 days — On fire! Earn a freeze</li>
                  <li>🔥🔥🔥 14 days — Unstoppable</li>
                  <li>⚡ 30 days — Legend</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowStreakInfo(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:opacity-80"
            >
              Got it
            </button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:w-80 flex flex-col gap-0 p-0">
        <SheetHeader className="flex-shrink-0 px-5 pb-4 border-b border-border/40" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
          <SheetTitle className="text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Profile & Settings
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                    className="h-9 text-sm"
                    autoFocus
                  />
                  <button onClick={saveName} className="w-9 h-9 flex items-center justify-center rounded-lg text-success hover:bg-success/10 active:bg-success/20 flex-shrink-0">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => setEditingName(false)} className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 active:bg-muted/80 flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <button onClick={startEditName} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground active:bg-muted/60 transition-colors flex-shrink-0">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {email && <p className="text-xs text-muted-foreground truncate mt-0.5">{email}</p>}
            </div>
          </div>

          {/* XP / level */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">{levelName}</p>
                <p className="text-xs text-muted-foreground">Level {level}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground">{xpInLevel} <span className="text-muted-foreground font-normal">/ {xpToNext} XP</span></p>
                <p className="text-xs text-muted-foreground">{completedCount} tasks done</p>
              </div>
            </div>
            <Progress value={xpProgress} className="h-1.5" />
          </div>

          {/* Streak */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-xl streak-fire">🔥</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{streakCount} day streak</p>
                <p className="text-xs text-muted-foreground">
                  {streakCount === 0 ? "Complete a task to start!" : streakCount >= 7 ? "You're on fire!" : "Keep it going!"}
                </p>
              </div>
              <button
                onClick={() => setShowStreakInfo(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 flex-shrink-0"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            {/* Streak freeze */}
            <button
              onClick={useFreeze}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-colors duration-150 ${
                freezesAvailable > 0
                  ? 'bg-blue-500/8 border-blue-500/25 hover:bg-blue-500/15 active:bg-blue-500/20'
                  : 'bg-muted/30 border-border/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Snowflake className={`h-4 w-4 ${freezesAvailable > 0 ? 'text-blue-400' : 'text-muted-foreground'}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${freezesAvailable > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Streak Freeze
                  </p>
                  <p className="text-xs text-muted-foreground">Protect your streak for one day</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                freezesAvailable > 0
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'bg-muted/60 text-muted-foreground'
              }`}>
                {freezesAvailable} left
              </span>
            </button>
          </div>

          {/* Appearance */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" /> Appearance
            </p>
            {/* Theme */}
            <div className="flex gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/40">
              {([
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Laptop, label: 'System' },
              ] as const).map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    theme === value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
            {/* Accent color */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Accent color</p>
              <div className="flex gap-2 flex-wrap">
                {(Object.entries(accentColors) as [AccentColor, typeof accentColors[AccentColor]][]).map(([key, def]) => (
                  <button
                    key={key}
                    onClick={() => setAccentColor(key)}
                    title={def.label}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                      accentColor === key ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: def.swatch }}
                  >
                    {accentColor === key && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Bell className="h-3.5 w-3.5" /> Notifications
            </p>

            {permission === "denied" ? (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium">Reminders</span>
                </div>
                <span className="text-xs text-muted-foreground">Blocked in browser</span>
              </div>
            ) : permission === "default" ? (
              <button
                onClick={requestPermission}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-150"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium">Reminders</span>
                </div>
                <span className="text-xs text-primary font-semibold">Enable</span>
              </button>
            ) : (
              <div className="rounded-xl bg-muted/30 border border-border/40 divide-y divide-border/30 overflow-hidden">
                <NotifRow
                  label="Due today"
                  description="When you have tasks due"
                  enabled={settings.dueTodayEnabled}
                  onToggle={() => updateSettings({ dueTodayEnabled: !settings.dueTodayEnabled })}
                />
                <NotifRow
                  label="Due tomorrow"
                  description="Evening reminder the night before"
                  enabled={settings.dueTomorrowEnabled}
                  onToggle={() => updateSettings({ dueTomorrowEnabled: !settings.dueTomorrowEnabled })}
                />
                <NotifRow
                  label="Overdue alerts"
                  description="When tasks are past their due date"
                  enabled={settings.overdueEnabled}
                  onToggle={() => updateSettings({ overdueEnabled: !settings.overdueEnabled })}
                />
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Streak reminder</p>
                    <p className="text-xs text-muted-foreground">Daily nudge to keep your streak</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {settings.streakEnabled && (
                      <select
                        value={settings.streakReminderTime}
                        onChange={e => updateSettings({ streakReminderTime: e.target.value })}
                        className="text-xs text-muted-foreground bg-muted/60 border border-border/40 rounded-lg px-1.5 py-1 focus:outline-none"
                      >
                        {["07:00","08:00","09:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"].map(t => (
                          <option key={t} value={t}>{
                            (() => {
                              const [h] = t.split(":").map(Number);
                              return h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`;
                            })()
                          }</option>
                        ))}
                      </select>
                    )}
                    <Toggle
                      enabled={settings.streakEnabled}
                      onToggle={() => updateSettings({ streakEnabled: !settings.streakEnabled })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customize */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Link className="h-3.5 w-3.5" /> Customize
            </p>
            <button
              onClick={() => { onOpenChange(false); onManageLinks?.(); }}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 active:bg-muted/70 transition-colors duration-150"
            >
              <div className="flex items-center gap-2.5">
                <Link className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">Quick Links</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => { onOpenChange(false); onManageSubjects?.(); }}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 active:bg-muted/70 transition-colors duration-150"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">Manage Subjects</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => { onOpenChange(false); onOpenWidgets?.(); }}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 active:bg-muted/70 transition-colors duration-150"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">Home Screen Widgets</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Account */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Shield className="h-3.5 w-3.5" /> Account
            </p>
            <button
              onClick={() => { onOpenChange(false); signOut(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40 hover:bg-error/8 hover:border-error/20 hover:text-error transition-colors duration-150"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>
        </div>

        {/* Version footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center">Propel · Made By Grant Easton · 2025</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

function NotifRow({
  label, description, enabled, onToggle,
}: { label: string; description: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}
