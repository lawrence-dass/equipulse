'use client';

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { ResponsiveLayouts, Layout } from 'react-grid-layout';
import { DEFAULT_LAYOUTS } from '@/lib/constants';

const STORAGE_KEY = 'eq_dashboard_layout';
const STORAGE_EVENT = 'eq-dashboard-layout-change';
const DEFAULT_LAYOUTS_SNAPSHOT = JSON.stringify(DEFAULT_LAYOUTS);

function parseLayouts(snapshot: string): ResponsiveLayouts {
    try {
        return JSON.parse(snapshot) as ResponsiveLayouts;
    } catch {
        return DEFAULT_LAYOUTS;
    }
}

function getLayoutSnapshot(): string {
    if (typeof window === 'undefined') return DEFAULT_LAYOUTS_SNAPSHOT;
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LAYOUTS_SNAPSHOT;
}

function subscribeToLayoutChanges(callback: () => void) {
    if (typeof window === 'undefined') return () => {};

    const handleChange = () => callback();
    window.addEventListener('storage', handleChange);
    window.addEventListener(STORAGE_EVENT, handleChange);

    return () => {
        window.removeEventListener('storage', handleChange);
        window.removeEventListener(STORAGE_EVENT, handleChange);
    };
}

export function useDashboardLayout() {
    const layoutSnapshot = useSyncExternalStore(
        subscribeToLayoutChanges,
        getLayoutSnapshot,
        () => DEFAULT_LAYOUTS_SNAPSHOT
    );
    const layouts = useMemo(() => parseLayouts(layoutSnapshot), [layoutSnapshot]);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const handleLayoutChange = useCallback(
        (_currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
                    window.dispatchEvent(new Event(STORAGE_EVENT));
                } catch {
                    // ignore quota errors
                }
            }, 500);
        },
        []
    );

    return { layouts, isLoaded: true, handleLayoutChange };
}
