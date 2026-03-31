'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveLayouts, Layout } from 'react-grid-layout';
import { DEFAULT_LAYOUTS } from '@/lib/constants';
import { loadLayoutsFromStorage, saveLayoutsToStorage, debounce } from '@/lib/utils/dashboardLayout';

export function useDashboardLayout() {
    // Lazy initialization to avoid synchronous setState in effect
    const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => {
        if (typeof window === 'undefined') {
            return { lg: [], md: [], sm: [], xs: [] };
        }
        const stored = loadLayoutsFromStorage();
        return stored || DEFAULT_LAYOUTS;
    });

    const [isLoaded, setIsLoaded] = useState(() => typeof window !== 'undefined');

    // Debounced save function
    const debouncedSave = useMemo(
        () =>
            debounce((layoutsToSave: ResponsiveLayouts) => {
                saveLayoutsToStorage(layoutsToSave);
            }, 300),
        []
    );

    // Sync with localStorage on mount (client-side only)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const stored = loadLayoutsFromStorage();
        if (stored) {
            setLayouts(stored);
        }
        setIsLoaded(true);
    }, []);

    // Handle layout change - ResponsiveGridLayout calls this with (currentLayout, allLayouts)
    const handleLayoutChange = useCallback(
        (currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
            setLayouts(allLayouts);
            debouncedSave(allLayouts);
        },
        [debouncedSave]
    );

    return {
        layouts,
        isLoaded,
        handleLayoutChange,
    };
}

