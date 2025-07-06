import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.65a708b937384e74a02ff9c91693a202',
  appName: 'docpilot-health-nexus',
  webDir: 'dist',
  server: {
    url: 'https://65a708b9-3738-4e74-a02f-f9c91693a202.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999'
    }
  }
};

export default config;