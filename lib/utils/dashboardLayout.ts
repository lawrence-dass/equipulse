import { ResponsiveLayouts } from 'react-grid-layout';

const STORAGE_KEY = 'dashboard-layout';

export type StoredLayouts = ResponsiveLayouts;

/**
 * Load layouts from localStorage
 */
export function loadLayoutsFromStorage(): StoredLayouts | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as StoredLayouts;
    } catch (error) {
        console.error('Error loading layouts from localStorage:', error);
        return null;
    }
}

/**
 * Save layouts to localStorage
 */
export function saveLayoutsToStorage(layouts: StoredLayouts): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    } catch (error) {
        console.error('Error saving layouts to localStorage:', error);
    }
}

/**
 * Debounce function for saving layouts
 */
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

