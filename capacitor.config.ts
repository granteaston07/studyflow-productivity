import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'us.studyflow.app',
  appName: 'StudyFlow',
  webDir: 'dist',
  server: {
    allowNavigation: ['*.supabase.co'],
  },
  ios: {
    contentInset: 'never',
  },
};

export default config;
