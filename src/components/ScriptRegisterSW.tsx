'use client';

import { useEffect } from 'react';

export default function ScriptRegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        // Use basePath from Next.js config (matches next.config.ts)
        const basePath = '/timeapp';
        const swPath = `${basePath}/sw.js`;
        
        navigator.serviceWorker.register(swPath).then(
          function(registration) {
            console.log('Service Worker registration successful with scope: ', registration.scope);
          },
          function(err) {
            console.log('Service Worker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return null;
}
