"use client";

import { useEffect } from 'react';

export default function ServiceWorkerCleanser() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        let unregisteredAny = false;
        for (const registration of registrations) {
          registration.unregister();
          unregisteredAny = true;
        }
        if (unregisteredAny) {
          console.log('Stale Service Worker(s) detected and unregistered. Reloading to clear interceptors.');
          window.location.reload();
        }
      });
    }
  }, []);

  return null;
}
