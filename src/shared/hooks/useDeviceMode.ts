import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export type ViewMode = 'auto' | 'web' | 'mobile';

export function useDeviceMode() {
  const isNative = Capacitor.isNativePlatform();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  
  // Stored preference for manual override if user wants to force Web or Mobile view
  const [viewOverride, setViewOverride] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('swissnat_view_mode') as ViewMode | null;
      return saved === 'web' || saved === 'mobile' ? saved : 'auto';
    } catch {
      return 'auto';
    }
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const changeViewMode = (mode: ViewMode) => {
    setViewOverride(mode);
    try {
      localStorage.setItem('swissnat_view_mode', mode);
    } catch {
      // ignore
    }
  };

  const isMobileScreen = windowWidth < 768;
  const isMobile = viewOverride === 'auto' ? (isNative || isMobileScreen) : viewOverride === 'mobile';

  return {
    isMobile,
    isNative,
    windowWidth,
    viewOverride,
    setViewOverride: changeViewMode,
  };
}
