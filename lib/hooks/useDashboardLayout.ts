'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ResponsiveLayouts, Layout } from 'react-grid-layout';
import { DEFAULT_LAYOUTS } from '@/lib/constants';

const STORAGE_KEY = 'eq_dashboard_layout';

function loadLayout(): ResponsiveLayouts {
    if (typeof window === 'undefined') return DEFAULT_LAYOUTS;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved) as ResponsiveLayouts;
    } catch {
        // ignore
    }
    return DEFAULT_LAYOUTS;
}

export function useDashboardLayout() {
    const [layouts, setLayouts] = useState<ResponsiveLayouts>(DEFAULT_LAYOUTS);
    const [isLoaded, setIsLoaded] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setLayouts(loadLayout());
        setIsLoaded(true);
    }, []);

    const handleLayoutChange = useCallback(
        (_currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
            setLayouts(allLayouts);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
                } catch {
                    // ignore quota errors
                }
            }, 500);
        },
        []
    );

    return { layouts, isLoaded, handleLayoutChange };
}
