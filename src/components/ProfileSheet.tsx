import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, LogIn, Sun, Moon, Bell, BellOff, Check, Pencil, X,
  Shield, Palette, Link, BookOpen, ChevronRight,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  guestName?: string;
  onGuestNameChange?: (name: string) => void;
  streakCount: number;
  level: number;
  levelName: string;
  xpInLevel: number;
  xpToNext: number;
  xpProgress: number;
  completedCount: number;
  onManageSubjects?: () => void;
  onManageLinks?: () => void;
}

export function ProfileSheet({
  open, onOpenChange, userName, guestName, onGuestNameChange,
  streakCount, level, levelName, xpInLevel, xpToNext, xpProgress, completedCount,
  onManageSubjects, onManageLinks,
}: ProfileSheetProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { permission, requestPermission } = useNotifications();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const displayName = user
    ? (user.user_metadata?.display_name || user.email?.split("@")[0] || "User")
    : (guestName || "Guest");

  const initials = displayName.slice(0, 2).toUpperCase();
  const email = user?.email ?? null;

  const startEditName = () => {
    setNameInput(displayName);
    setEditingName(true);
  };

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    if (user) {
      const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } });
      if (error) { toast.error("Failed to update name"); return; }
      toast.success("Name updated");
    } else {
      localStorage.setItem("studyflow_guest_name", trimmed);
      onGuestNameChange?.(trimmed);
      toast.success("Name updated");
    }
    setEditingName(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:w-80 flex flex-col gap-0 p-0 overflow-y-auto">
        <SheetHeader className="px-5 pt-6 pb-4 border-b border-border/40">
          <SheetTitle className="text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Profile & Settings
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 px-5 py-5 space-y-6">

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
              {!user && <p className="text-xs text-muted-foreground mt-0.5">Guest mode</p>}
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
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-xl streak-fire">🔥</span>
            <div>
              <p className="text-sm font-bold text-foreground">{streakCount} day streak</p>
              <p className="text-xs text-muted-foreground">
                {streakCount === 0 ? "Complete a task to start!" : streakCount >= 7 ? "You're on fire!" : "Keep it going!"}
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Palette className="h-3.5 w-3.5" /> Appearance
            </p>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 active:bg-muted/70 transition-colors duration-150"
            >
              <div className="flex items-center gap-2.5">
                {theme === "dark" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm text-foreground font-medium">Theme</span>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{theme}</span>
            </button>

          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Bell className="h-3.5 w-3.5" /> Notifications
            </p>
            {permission === "granted" ? (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4 w-4 text-success" />
                  <span className="text-sm text-foreground font-medium">Reminders</span>
                </div>
                <span className="text-xs text-success font-medium">On</span>
              </div>
            ) : permission === "denied" ? (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium">Reminders</span>
                </div>
                <span className="text-xs text-muted-foreground">Blocked in browser</span>
              </div>
            ) : (
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
          </div>

          {/* Account */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Shield className="h-3.5 w-3.5" /> Account
            </p>
            {user ? (
              <button
                onClick={() => { onOpenChange(false); signOut(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40 hover:bg-error/8 hover:border-error/20 hover:text-error transition-colors duration-150"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sign out</span>
              </button>
            ) : (
              <button
                onClick={() => { onOpenChange(false); navigate("/auth"); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-primary/8 border border-primary/20 text-primary hover:bg-primary/12 transition-colors duration-150"
              >
                <LogIn className="h-4 w-4" />
                <span className="text-sm font-medium">Sign in to save data</span>
              </button>
            )}
          </div>
        </div>

        {/* Version footer */}
        <div className="px-5 py-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center">StudyFlow · studyflow.us</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
