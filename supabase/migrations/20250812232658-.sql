-- Tighten RLS on public.profiles to prevent any access by anonymous role and ensure only the owner can read/update/insert
-- This focuses on protecting PII (email) from being harvested

-- Enable RLS (no-op if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to replace them with role-scoped versions
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

-- Recreate policies scoped to authenticated role only
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
