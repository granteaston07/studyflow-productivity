import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const isNative = !!(window as any).Capacitor?.isNativePlatform?.();

export async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!isNative) return;
  try {
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
    await Haptics.impact({ style: map[style] });
  } catch {}
}

export async function hapticSuccess() {
  if (!isNative) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}

export async function hapticSelection() {
  if (!isNative) return;
  try {
    await Haptics.selectionStart();
  } catch {}
}
