import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { isMobileOrTabletDevice } from '../utils/deviceDetection';

export type ViewMode = 'auto' | 'web' | 'mobile';

export function useDeviceMode() {
  const isNative = Capacitor.isNativePlatform();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [isMobileDevice, setIsMobileDevice] = useState(() => isMobileOrTabletDevice());

  useEffect(() => {
    // Clear any obsolete localStorage override that may force desktop into mobile view
    try {
      const saved = localStorage.getItem('swissnat_view_mode');
      if (saved && !isMobileOrTabletDevice()) {
        localStorage.removeItem('swissnat_view_mode');
      }
    } catch {
      // ignore
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobileDevice(isMobileOrTabletDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Strict separation:
  // - Mobile app view is ONLY for smart phones, tabs, and native apps
  // - Web app view is for PC, laptop, etc. (never shows mobile app view on PC/laptop)
  const isMobile = isNative || isMobileDevice;

  return {
    isMobile,
    isNative,
    windowWidth,
    isMobileDevice,
  };
}
