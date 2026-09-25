/**
 * Demo Mode utility — manages demo mode state via sessionStorage.
 * Works with Next.js SSR by checking for `window`.
 */

const DEMO_KEY = 'chatapp-demo-mode';

export function isDemoMode(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(DEMO_KEY) === 'true';
}

export function enterDemoMode(): void {
    sessionStorage.setItem(DEMO_KEY, 'true');
}

export function exitDemoMode(): void {
    sessionStorage.removeItem(DEMO_KEY);
}
