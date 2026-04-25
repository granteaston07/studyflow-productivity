import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SubjectInsight {
  subject: string;
  count: number;
  avgDifficulty: number;   // 1–10
  avgTimeMinutes: number;
  trend: "harder" | "easier" | "stable" | "unknown";
}

export function useSubjectInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<SubjectInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setInsights([]); return; }

    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("task_feedback")
        .select("subject, difficulty_rating, time_taken_minutes, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error || !data) { setLoading(false); return; }

      // Group by subject
      const map = new Map<string, { difficulty: number[]; time: number[] }>();
      for (const row of data) {
        const s = row.subject || "General";
        if (!map.has(s)) map.set(s, { difficulty: [], time: [] });
        const entry = map.get(s)!;
        if (row.difficulty_rating != null) entry.difficulty.push(row.difficulty_rating);
        if (row.time_taken_minutes != null) entry.time.push(row.time_taken_minutes);
      }

      const result: SubjectInsight[] = [];
      for (const [subject, { difficulty, time }] of map.entries()) {
        if (difficulty.length === 0) continue;
        const avgDifficulty = difficulty.reduce((a, b) => a + b, 0) / difficulty.length;
        const avgTimeMinutes = time.length > 0 ? time.reduce((a, b) => a + b, 0) / time.length : 0;

        let trend: SubjectInsight["trend"] = "unknown";
        if (difficulty.length >= 4) {
          const recent = difficulty.slice(-Math.ceil(difficulty.length / 2));
          const older = difficulty.slice(0, Math.floor(difficulty.length / 2));
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
          const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
          if (recentAvg > olderAvg + 0.8) trend = "harder";
          else if (recentAvg < olderAvg - 0.8) trend = "easier";
          else trend = "stable";
        }

        result.push({ subject, count: difficulty.length, avgDifficulty, avgTimeMinutes, trend });
      }

      setInsights(result.sort((a, b) => b.count - a.count));
      setLoading(false);
    };

    fetch();
  }, [user]);

  return { insights, loading };
}
