-- Secure OAuth token storage using Supabase vault
-- This migration encrypts sensitive OAuth tokens for security

-- First, enable the vault extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "vault" WITH SCHEMA "vault";

-- Create a secure table for OAuth connections with encrypted token storage
-- We'll modify the existing table to use encrypted token storage
-- Remove the plain text token columns and replace with encrypted vault references

-- Add columns for encrypted token storage
ALTER TABLE public.google_classroom_connections 
ADD COLUMN access_token_secret_id UUID,
ADD COLUMN refresh_token_secret_id UUID;

-- Create a function to securely store OAuth tokens
CREATE OR REPLACE FUNCTION public.store_oauth_tokens(
  p_user_id UUID,
  p_access_token TEXT,
  p_refresh_token TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE,
  p_scope TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_connection_id UUID;
  v_access_token_id UUID;
  v_refresh_token_id UUID;
BEGIN
  -- Store access token in vault
  INSERT INTO vault.secrets (name, secret, key_id)
  VALUES (
    'oauth_access_token_' || p_user_id || '_' || extract(epoch from now()),
    p_access_token,
    (SELECT id FROM vault.decryption_keys ORDER BY created_at DESC LIMIT 1)
  )
  RETURNING id INTO v_access_token_id;
  
  -- Store refresh token in vault
  INSERT INTO vault.secrets (name, secret, key_id)
  VALUES (
    'oauth_refresh_token_' || p_user_id || '_' || extract(epoch from now()),
    p_refresh_token,
    (SELECT id FROM vault.decryption_keys ORDER BY created_at DESC LIMIT 1)
  )
  RETURNING id INTO v_refresh_token_id;
  
  -- Insert or update the connection record
  INSERT INTO public.google_classroom_connections (
    user_id,
    access_token_secret_id,
    refresh_token_secret_id,
    expires_at,
    scope,
    access_token,
    refresh_token
  ) VALUES (
    p_user_id,
    v_access_token_id,
    v_refresh_token_id,
    p_expires_at,
    p_scope,
    '[ENCRYPTED]',
    '[ENCRYPTED]'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    access_token_secret_id = v_access_token_id,
    refresh_token_secret_id = v_refresh_token_id,
    expires_at = p_expires_at,
    scope = p_scope,
    access_token = '[ENCRYPTED]',
    refresh_token = '[ENCRYPTED]',
    updated_at = now()
  RETURNING id INTO v_connection_id;
  
  RETURN v_connection_id;
END;
$$;

-- Create a function to retrieve OAuth tokens securely
CREATE OR REPLACE FUNCTION public.get_oauth_tokens(p_user_id UUID)
RETURNS TABLE (
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vault.decrypted_secrets.decrypted_secret::TEXT as access_token,
    vault.decrypted_secrets.decrypted_secret::TEXT as refresh_token,
    gcc.expires_at,
    gcc.scope
  FROM public.google_classroom_connections gcc
  LEFT JOIN vault.decrypted_secrets ON vault.decrypted_secrets.id = gcc.access_token_secret_id
  LEFT JOIN vault.decrypted_secrets rs ON rs.id = gcc.refresh_token_secret_id
  WHERE gcc.user_id = p_user_id;
END;
$$;

-- Function to safely delete OAuth tokens
CREATE OR REPLACE FUNCTION public.delete_oauth_tokens(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_access_token_id UUID;
  v_refresh_token_id UUID;
BEGIN
  -- Get the secret IDs before deleting the connection
  SELECT access_token_secret_id, refresh_token_secret_id
  INTO v_access_token_id, v_refresh_token_id
  FROM public.google_classroom_connections
  WHERE user_id = p_user_id;
  
  -- Delete the connection record
  DELETE FROM public.google_classroom_connections WHERE user_id = p_user_id;
  
  -- Delete the secrets from vault
  IF v_access_token_id IS NOT NULL THEN
    DELETE FROM vault.secrets WHERE id = v_access_token_id;
  END IF;
  
  IF v_refresh_token_id IS NOT NULL THEN
    DELETE FROM vault.secrets WHERE id = v_refresh_token_id;
  END IF;
END;
$$;

-- Add RLS policies for the new columns
CREATE POLICY "Users can view their own token references" 
ON public.google_classroom_connections 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a trigger to clean up vault secrets when connections are deleted
CREATE OR REPLACE FUNCTION public.cleanup_oauth_secrets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete associated secrets from vault
  IF OLD.access_token_secret_id IS NOT NULL THEN
    DELETE FROM vault.secrets WHERE id = OLD.access_token_secret_id;
  END IF;
  
  IF OLD.refresh_token_secret_id IS NOT NULL THEN
    DELETE FROM vault.secrets WHERE id = OLD.refresh_token_secret_id;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create the cleanup trigger
CREATE TRIGGER cleanup_oauth_secrets_trigger
  BEFORE DELETE ON public.google_classroom_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_oauth_secrets();

-- Update existing records to use placeholder values (if any exist)
UPDATE public.google_classroom_connections 
SET 
  access_token = '[ENCRYPTED]',
  refresh_token = '[ENCRYPTED]'
WHERE access_token != '[ENCRYPTED]' OR refresh_token != '[ENCRYPTED]';

-- Add constraints to ensure tokens are always encrypted
ALTER TABLE public.google_classroom_connections 
ADD CONSTRAINT check_tokens_encrypted 
CHECK (access_token = '[ENCRYPTED]' AND refresh_token = '[ENCRYPTED]');

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.store_oauth_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_oauth_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_oauth_tokens TO authenticated;