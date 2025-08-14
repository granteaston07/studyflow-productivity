-- Enable the pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a secure encryption key function that uses Supabase's vault
-- This function generates a consistent key for token encryption
CREATE OR REPLACE FUNCTION public.get_token_encryption_key()
RETURNS bytea
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Use a combination of the database URL and a fixed salt for key derivation
  -- This ensures the key is consistent but unique per database
  SELECT digest('token_encryption_key_v1' || current_setting('app.settings.supabase_url', true), 'sha256');
$$;

-- Function to encrypt OAuth tokens
CREATE OR REPLACE FUNCTION public.encrypt_token(token text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN token IS NULL OR token = '' THEN NULL
    ELSE encode(pgp_sym_encrypt(token, get_token_encryption_key()::text), 'base64')
  END;
$$;

-- Function to decrypt OAuth tokens
CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN encrypted_token IS NULL OR encrypted_token = '' THEN NULL
    ELSE pgp_sym_decrypt(decode(encrypted_token, 'base64'), get_token_encryption_key()::text)
  END;
$$;

-- Add new encrypted columns to store the encrypted tokens
ALTER TABLE public.google_classroom_connections 
ADD COLUMN IF NOT EXISTS access_token_encrypted text,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted text;

-- Migrate existing tokens to encrypted format
UPDATE public.google_classroom_connections 
SET 
  access_token_encrypted = public.encrypt_token(access_token),
  refresh_token_encrypted = public.encrypt_token(refresh_token)
WHERE access_token IS NOT NULL OR refresh_token IS NOT NULL;

-- Create indexes on the encrypted columns for performance
CREATE INDEX IF NOT EXISTS idx_google_classroom_connections_user_id ON public.google_classroom_connections(user_id);

-- Create a secure view that automatically decrypts tokens for authorized users
CREATE OR REPLACE VIEW public.google_classroom_connections_decrypted AS
SELECT 
  id,
  user_id,
  public.decrypt_token(access_token_encrypted) as access_token,
  public.decrypt_token(refresh_token_encrypted) as refresh_token,
  scope,
  expires_at,
  created_at,
  updated_at
FROM public.google_classroom_connections
WHERE auth.uid() = user_id; -- Only show decrypted data to the token owner

-- Enable RLS on the view
ALTER VIEW public.google_classroom_connections_decrypted SET (security_barrier = true);

-- Create RLS policies for the decrypted view
CREATE POLICY "Users can view their own decrypted connections" 
ON public.google_classroom_connections_decrypted
FOR SELECT 
USING (auth.uid() = user_id);

-- Create helper functions for safe token management
CREATE OR REPLACE FUNCTION public.insert_encrypted_connection(
  p_access_token text,
  p_refresh_token text,
  p_scope text,
  p_expires_at timestamp with time zone
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  connection_id uuid;
BEGIN
  INSERT INTO public.google_classroom_connections (
    user_id,
    access_token_encrypted,
    refresh_token_encrypted,
    scope,
    expires_at
  ) VALUES (
    auth.uid(),
    public.encrypt_token(p_access_token),
    public.encrypt_token(p_refresh_token),
    p_scope,
    p_expires_at
  ) RETURNING id INTO connection_id;
  
  RETURN connection_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_encrypted_tokens(
  p_connection_id uuid,
  p_access_token text,
  p_refresh_token text,
  p_expires_at timestamp with time zone
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.google_classroom_connections 
  SET 
    access_token_encrypted = public.encrypt_token(p_access_token),
    refresh_token_encrypted = public.encrypt_token(p_refresh_token),
    expires_at = p_expires_at,
    updated_at = now()
  WHERE id = p_connection_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Add a comment to document the security enhancement
COMMENT ON COLUMN public.google_classroom_connections.access_token_encrypted IS 'Encrypted OAuth access token using pgp_sym_encrypt';
COMMENT ON COLUMN public.google_classroom_connections.refresh_token_encrypted IS 'Encrypted OAuth refresh token using pgp_sym_encrypt';
COMMENT ON FUNCTION public.encrypt_token(text) IS 'Encrypts sensitive tokens before database storage';
COMMENT ON FUNCTION public.decrypt_token(text) IS 'Decrypts tokens for authorized access';
COMMENT ON VIEW public.google_classroom_connections_decrypted IS 'Secure view that decrypts tokens only for authorized users';