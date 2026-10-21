/**
 * Utility to accurately distinguish:
 * 1. Mobile & Tablet devices (smartphones, iPads, Android tablets, native apps) -> Mobile app view
 * 2. PC & Laptop devices (Windows, macOS, Linux, ChromeOS desktops & laptops) -> Web app view
 *
 * Windows touch laptops (Surface, Yoga, etc.) and touchscreen Mac/Linux PCs
 * are explicitly treated as PC/Laptop so they always get the full Web App view.
 */

export interface DeviceContext {
  ua?: string;
  platform?: string;
  maxTouchPoints?: number;
  isNative?: boolean;
  isCoarsePointer?: boolean;
  windowWidth?: number;
}

export function isMobileOrTabletDevice(context?: DeviceContext): boolean {
  // If test or explicit context provided, use it
  if (context) {
    if (context.isNative) return true;
    const ua = context.ua || '';
    const platform = context.platform || '';
    const touchPoints = context.maxTouchPoints || 0;

    // Windows PCs/Laptops (including touch screens and 2-in-1 laptops)
    if (/Windows NT/i.test(ua)) return false;

    // ChromeOS (Chromebooks)
    if (/CrOS/i.test(ua)) return false;

    // Linux desktops (not Android)
    if (/Linux/i.test(ua) && !/Android/i.test(ua)) return false;

    // Apple iPads (iPadOS 13+ reports platform MacIntel with multi-touch)
    const isIPadOS = /iPad/i.test(ua) || (platform === 'MacIntel' && touchPoints > 1 && !/iPhone/i.test(ua));
    if (isIPadOS) return true;

    // macOS Desktops & MacBooks
    if (/Macintosh/i.test(ua)) return false;

    // Android smartphones & tablets
    if (/Android/i.test(ua)) return true;

    // iPhones and iPods
    if (/iPhone|iPod/i.test(ua)) return true;

    // Tablets and handhelds
    if (/Tablet|Silk|Kindle|PlayBook|BB10|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true;

    if (context.isCoarsePointer && (context.windowWidth ?? 1200) <= 1024) return true;

    return false;
  }

  // Runtime Browser Environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // 1. Capacitor native app environment (Android or iOS container)
  const anyWindow = window as any;
  if (anyWindow.Capacitor?.isNativePlatform?.()) {
    return true;
  }

  const ua = navigator.userAgent || navigator.vendor || anyWindow.opera || '';
  const platform = navigator.platform || '';
  const touchPoints = navigator.maxTouchPoints || 0;

  // 2. Windows PC / Laptop (Desktops, laptops, 2-in-1s with touchscreens)
  if (/Windows NT/i.test(ua)) {
    return false;
  }

  // 3. ChromeOS (Chromebooks) are laptops
  if (/CrOS/i.test(ua)) {
    return false;
  }

  // 4. Linux desktops (Ubuntu, Fedora, Arch, etc. - excluding Android)
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) {
    return false;
  }

  // 5. Apple iPads:
  const isIPadOS = /iPad/i.test(ua) || (platform === 'MacIntel' && touchPoints > 1 && !/iPhone/i.test(ua));
  if (isIPadOS) {
    return true;
  }

  // 6. macOS Desktops & MacBooks (Macintosh without iPad touch characteristics)
  if (/Macintosh/i.test(ua)) {
    return false;
  }

  // 7. Android devices (smartphones and tablets)
  if (/Android/i.test(ua)) {
    return true;
  }

  // 8. iPhones and iPods
  if (/iPhone|iPod/i.test(ua)) {
    return true;
  }

  // 9. Tablets and handhelds
  if (/Tablet|Silk|Kindle|PlayBook|BB10|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true;
  }

  // 10. Secondary touch check for other mobile browsers:
  const isCoarsePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  const isNoHover = typeof window.matchMedia === 'function' && window.matchMedia('(hover: none)').matches;
  if (isCoarsePointer && isNoHover && window.innerWidth <= 1024) {
    return true;
  }

  return false;
}

export function detectDevicePlatform(context?: DeviceContext): 'pc' | 'android' | 'ios' | 'other' {
  const ua = context?.ua ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const platform = context?.platform ?? (typeof navigator !== 'undefined' ? navigator.platform : '');
  const touchPoints = context?.maxTouchPoints ?? (typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0);

  if (/iPad|iPhone|iPod/i.test(ua) || (platform === 'MacIntel' && touchPoints > 1)) {
    return 'ios';
  }

  if (/Android/i.test(ua)) {
    return 'android';
  }

  if (/Windows NT|Macintosh|Linux|CrOS/i.test(ua)) {
    return 'pc';
  }

  return isMobileOrTabletDevice(context) ? 'other' : 'pc';
}
