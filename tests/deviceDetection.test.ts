import { describe, it, expect } from 'vitest';
import { isMobileOrTabletDevice, detectDevicePlatform } from '../src/shared/utils/deviceDetection';

describe('deviceDetection', () => {
  it('identifies Windows PC / Laptop as non-mobile (Web App)', () => {
    const ctx = {
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'Win32',
      maxTouchPoints: 0,
    };
    expect(isMobileOrTabletDevice(ctx)).toBe(false);
    expect(detectDevicePlatform(ctx)).toBe('pc');
  });

  it('identifies Windows touchscreen 2-in-1 laptops as PC / Laptop (Web App)', () => {
    const ctx = {
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'Win32',
      maxTouchPoints: 10, // 10 multi-touch points like Surface Pro
    };
    expect(isMobileOrTabletDevice(ctx)).toBe(false);
    expect(detectDevicePlatform(ctx)).toBe('pc');
  });

  it('identifies macOS MacBook / iMac as PC / Laptop (Web App)', () => {
    const ctx = {
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'MacIntel',
      maxTouchPoints: 0,
    };
    expect(isMobileOrTabletDevice(ctx)).toBe(false);
    expect(detectDevicePlatform(ctx)).toBe('pc');
  });

  it('identifies Linux desktop as PC / Laptop (Web App)', () => {
    const ctx = {
      ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'Linux x86_64',
      maxTouchPoints: 0,
    };
    expect(isMobileOrTabletDevice(ctx)).toBe(false);
    expect(detectDevicePlatform(ctx)).toBe('pc');
  });

  it('identifies Chromebook (CrOS) as PC / Laptop (Web App)', () => {
    const ctx = {
      ua: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'Linux x86_64',
      maxTouchPoints: 10,
    };
    expect(isMobileOrTabletDevice(ctx)).toBe(false);
    expect(detectDevicePlatform(ctx)).toBe('pc');
  });

  it('identifies iPhone as Mobile / Smartphone (Mobile App)', () => {
    const ctx = {
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    };
    expect(isMobileOrTabletDevice(ctx)).toBe(true);
    expect(detectDevicePlatform(ctx)).toBe('ios');
  });

  it('identifies Android smartphone as Mobile (Mobile App)', () => {
    const ctx = {
      ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
      platform: 'Linux armv81',
      maxTouchPoints: 5,
    };
    expect(isMobileOrTabletDevice(ctx)).toBe(true);
    expect(detectDevicePlatform(ctx)).toBe('android');
  });

  it('identifies iPad (iPadOS 13+ MacIntel) as Tablet (Mobile App)', () => {
    const ctx = {
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      platform: 'MacIntel',
      maxTouchPoints: 5, // iPadOS touch points
    };
    expect(isMobileOrTabletDevice(ctx)).toBe(true);
    expect(detectDevicePlatform(ctx)).toBe('ios');
  });

  it('identifies Android Tablet as Tablet (Mobile App)', () => {
    const ctx = {
      ua: 'Mozilla/5.0 (Linux; Android 13; SM-X800) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Safari/537.36',
      platform: 'Linux aarch64',
      maxTouchPoints: 10,
    };
    expect(isMobileOrTabletDevice(ctx)).toBe(true);
    expect(detectDevicePlatform(ctx)).toBe('android');
  });

  it('identifies Capacitor native app environment as Mobile App', () => {
    const ctx = {
      isNative: true,
    };
    expect(isMobileOrTabletDevice(ctx)).toBe(true);
  });
});
