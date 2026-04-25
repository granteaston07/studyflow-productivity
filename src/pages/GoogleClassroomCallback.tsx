import { useEffect } from 'react';

export default function GoogleClassroomCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (window.opener) {
      window.opener.postMessage(
        { type: 'google-classroom-auth', code, state, error },
        window.location.origin
      );
    }

    window.close();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-muted-foreground text-sm">Connecting to Google Classroom…</p>
    </div>
  );
}
