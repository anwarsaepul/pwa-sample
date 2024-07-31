// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
  
  // Notification
  document.getElementById('notifyButton').addEventListener('click', () => {
    if ('Notification' in window && navigator.serviceWorker) {
      Notification.requestPermission(status => {
        console.log('Notification permission status:', status);
        if (status === 'granted') {
          navigator.serviceWorker.getRegistration().then(reg => {
            reg.showNotification('Hello from PWA!');
          });
        }
      });
    }
  });
  
  // Install PWA
  let deferredPrompt;
  const installButton = document.getElementById('installButton');
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.hidden = false;
  });
  
  installButton.addEventListener('click', () => {
    installButton.hidden = true;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
  