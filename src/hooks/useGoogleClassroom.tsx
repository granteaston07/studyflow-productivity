import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const SUPABASE_URL = 'https://kofbhggloaapndnuhmsc.supabase.co';
const EDGE_FN = `${SUPABASE_URL}/functions/v1/google-classroom-sync`;

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
].join(' ');

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...Array.from(array)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function useGoogleClassroom(onSyncComplete?: () => void) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);

  const callEdgeFn = useCallback(async (body: object) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const res = await fetch(EDGE_FN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Request failed');
    return data;
  }, []);

  const fetchStatus = useCallback(async () => {
    if (!user) { setStatusLoaded(true); return; }
    try {
      const data = await callEdgeFn({ action: 'status' });
      setConnected(data.connected);
      setGoogleEmail(data.google_email);
      setLastSynced(data.last_synced_at ? new Date(data.last_synced_at) : null);
    } catch {
      // silently ignore — user may not have connected yet
    } finally {
      setStatusLoaded(true);
    }
  }, [user, callEdgeFn]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await callEdgeFn({ action: 'sync' });
      const now = new Date();
      setLastSynced(now);
      const n = result.synced as number;
      toast.success(
        n > 0
          ? `Synced ${n} new assignment${n !== 1 ? 's' : ''} from Google Classroom`
          : 'Google Classroom is up to date'
      );
      onSyncComplete?.();
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      toast.error(msg);
    } finally {
      setIsSyncing(false);
    }
  }, [callEdgeFn, onSyncComplete]);

  const connect = useCallback(async () => {
    if (!user) { toast.error('Sign in to connect Google Classroom'); return; }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      toast.error('VITE_GOOGLE_CLIENT_ID not set. See setup instructions.');
      return;
    }

    setIsConnecting(true);
    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const redirectUri = `${window.location.origin}/google-classroom-callback`;
      const state = crypto.randomUUID();

      sessionStorage.setItem('gc_code_verifier', codeVerifier);
      sessionStorage.setItem('gc_oauth_state', state);

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',
        prompt: 'consent',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state,
      });

      const popup = window.open(
        `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
        'google-classroom-auth',
        'width=500,height=620,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        toast.error('Popup blocked — allow popups for this site and try again.');
        setIsConnecting(false);
        return;
      }

      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type !== 'google-classroom-auth') return;

        window.removeEventListener('message', handleMessage);
        clearInterval(closedPoll);

        const { code, state: returnedState, error } = event.data;

        if (error) {
          toast.error(`Google auth error: ${error}`);
          setIsConnecting(false);
          return;
        }

        const savedState = sessionStorage.getItem('gc_oauth_state');
        const savedVerifier = sessionStorage.getItem('gc_code_verifier');
        sessionStorage.removeItem('gc_oauth_state');
        sessionStorage.removeItem('gc_code_verifier');

        if (!code || returnedState !== savedState || !savedVerifier) {
          toast.error('Auth state mismatch — please try again.');
          setIsConnecting(false);
          return;
        }

        try {
          const result = await callEdgeFn({
            action: 'exchange',
            code,
            code_verifier: savedVerifier,
            redirect_uri: redirectUri,
          });

          setConnected(true);
          setGoogleEmail(result.google_email);
          toast.success(
            result.google_email
              ? `Connected as ${result.google_email}`
              : 'Connected to Google Classroom'
          );

          // Auto-sync on first connection
          await sync();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Connection failed';
          toast.error(msg);
        } finally {
          setIsConnecting(false);
        }
      };

      window.addEventListener('message', handleMessage);

      // If user closes popup without completing auth
      const closedPoll = setInterval(() => {
        if (popup.closed) {
          clearInterval(closedPoll);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
        }
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start Google auth';
      toast.error(msg);
      setIsConnecting(false);
    }
  }, [user, callEdgeFn, sync]);

  const disconnect = useCallback(async (deleteTasks = false) => {
    try {
      await callEdgeFn({ action: 'disconnect', delete_tasks: deleteTasks });
      setConnected(false);
      setGoogleEmail(null);
      setLastSynced(null);
      toast.success('Disconnected from Google Classroom');
      onSyncComplete?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to disconnect';
      toast.error(msg);
    }
  }, [callEdgeFn, onSyncComplete]);

  return {
    connected,
    googleEmail,
    lastSynced,
    isSyncing,
    isConnecting,
    statusLoaded,
    connect,
    sync,
    disconnect,
  };
}
