// PWA Debug utilities
export const debugPWA = () => {
  console.log('=== PWA Debug Info ===');
  
  // Check if already installed
  const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  console.log('Is Standalone:', isStandalone);
  
  // Check if SW is registered
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('Service Workers:', registrations.length);
    });
  }
  
  // Check PWA install status
  console.log('Local Storage pwa-install-dismissed:', localStorage.getItem('pwa-install-dismissed'));
  
  // Check manifest
  const manifest = document.querySelector('link[rel="manifest"]');
  console.log('Manifest link:', manifest?.getAttribute('href'));
  
  // Check for beforeinstallprompt event
  let promptAvailable = false;
  window.addEventListener('beforeinstallprompt', (e) => {
    promptAvailable = true;
    console.log('beforeinstallprompt event fired!');
  });
  
  setTimeout(() => {
    if (!promptAvailable) {
      console.log('beforeinstallprompt event did not fire after 2 seconds');
      console.log('Possible reasons:');
      console.log('- App is already installed');
      console.log('- Not served over HTTPS');
      console.log('- Missing required manifest properties');
      console.log('- Browser doesn\'t support PWA install');
    }
  }, 2000);
  
  return {
    isStandalone,
    manifestPresent: !!manifest,
    serviceWorkerSupported: 'serviceWorker' in navigator,
    https: location.protocol === 'https:' || location.hostname === 'localhost'
  };
};
