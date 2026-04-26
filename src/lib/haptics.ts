// Haptic feedback — uses Capacitor on native iOS/Android, Web Vibration API as fallback

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      Plugins?: {
        Haptics?: {
          impact?: (options: { style: string }) => Promise<void>;
          notification?: (options: { type: string }) => Promise<void>;
          selectionStart?: () => Promise<void>;
        };
      };
    };
  }
}

export async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  try {
    const Haptics = window.Capacitor?.Plugins?.Haptics;
    if (Haptics?.impact) {
      await Haptics.impact({ style: style.toUpperCase() });
      return;
    }
  } catch {}
  // Web fallback
  try {
    const ms = style === 'light' ? 20 : style === 'medium' ? 40 : 80;
    navigator.vibrate?.(ms);
  } catch {}
}

export async function hapticSuccess() {
  try {
    const Haptics = window.Capacitor?.Plugins?.Haptics;
    if (Haptics?.notification) {
      await Haptics.notification({ type: 'SUCCESS' });
      return;
    }
  } catch {}
  try { navigator.vibrate?.([30, 30, 60]); } catch {}
}

export async function hapticSelection() {
  try {
    const Haptics = window.Capacitor?.Plugins?.Haptics;
    if (Haptics?.selectionStart) {
      await Haptics.selectionStart();
      return;
    }
  } catch {}
  try { navigator.vibrate?.(10); } catch {}
}
