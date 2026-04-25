import { useState } from 'react';
import { GraduationCap, RefreshCw, Unlink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoogleClassroom } from '@/hooks/useGoogleClassroom';
import { format } from 'date-fns';

interface GoogleClassroomSyncProps {
  onSyncComplete?: () => void;
}

export function GoogleClassroomSync({ onSyncComplete }: GoogleClassroomSyncProps) {
  const {
    connected, googleEmail, lastSynced,
    isSyncing, isConnecting, statusLoaded,
    connect, sync, disconnect,
  } = useGoogleClassroom(onSyncComplete);

  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  if (!statusLoaded) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-muted/30 border border-border/40">
        <GraduationCap className="h-4 w-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Checking connection…</span>
      </div>
    );
  }

  if (confirmDisconnect) {
    return (
      <div className="p-3.5 rounded-xl bg-error/6 border border-error/20 space-y-3">
        <p className="text-sm font-medium text-foreground">Disconnect Google Classroom?</p>
        <p className="text-xs text-muted-foreground">What should happen to your synced assignments?</p>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => disconnect(false).then(() => setConfirmDisconnect(false))}
            className="w-full text-left px-3 py-2 rounded-lg bg-muted/40 border border-border/40 hover:bg-muted/60 text-xs text-foreground transition-colors"
          >
            Keep assignments as regular tasks
          </button>
          <button
            onClick={() => disconnect(true).then(() => setConfirmDisconnect(false))}
            className="w-full text-left px-3 py-2 rounded-lg bg-error/8 border border-error/20 hover:bg-error/15 text-xs text-error transition-colors"
          >
            Delete all synced assignments
          </button>
          <button
            onClick={() => setConfirmDisconnect(false)}
            className="w-full text-center px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-success/15 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-4 w-4 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Google Classroom</p>
              {googleEmail && (
                <p className="text-xs text-muted-foreground truncate">{googleEmail}</p>
              )}
            </div>
          </div>
          <span className="text-xs text-success font-semibold flex-shrink-0">Connected</span>
        </div>

        {lastSynced && (
          <p className="text-xs text-muted-foreground pl-0.5">
            Synced {format(lastSynced, 'MMM d, h:mm a')}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-xs gap-1.5"
            onClick={() => sync()}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing…' : 'Sync now'}
          </Button>
          <button
            onClick={() => setConfirmDisconnect(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-colors flex-shrink-0"
            title="Disconnect"
          >
            <Unlink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 active:bg-muted/70 transition-colors duration-150 disabled:opacity-60"
    >
      <div className="flex items-center gap-2.5">
        <GraduationCap className="h-4 w-4 text-muted-foreground" />
        <div className="text-left">
          <span className="text-sm text-foreground font-medium block">Google Classroom</span>
          <span className="text-xs text-muted-foreground">Import assignments automatically</span>
        </div>
      </div>
      {isConnecting
        ? <span className="text-xs text-muted-foreground">Connecting…</span>
        : <ChevronRight className="h-4 w-4 text-muted-foreground" />
      }
    </button>
  );
}
