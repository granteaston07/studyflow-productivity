-- Add XP column to profiles so it syncs across devices
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0;

-- Atomic XP increment function (avoids race conditions)
CREATE OR REPLACE FUNCTION public.add_xp(p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_xp integer;
BEGIN
  -- Upsert profile if it doesn't exist yet, then increment
  INSERT INTO public.profiles (user_id, xp, created_at, updated_at)
    VALUES (auth.uid(), GREATEST(p_amount, 0), now(), now())
  ON CONFLICT (user_id)
    DO UPDATE SET
      xp = GREATEST(public.profiles.xp + p_amount, 0),
      updated_at = now()
  RETURNING xp INTO new_xp;

  RETURN new_xp;
END;
$$;
