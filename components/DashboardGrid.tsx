'use client';

import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useEffect, useState } from 'react';
import DashboardWidget from '@/components/DashboardWidget';
import { DASHBOARD_WIDGETS } from '@/lib/constants';
import { useDashboardLayout } from '@/lib/hooks/useDashboardLayout';

export default function DashboardGrid() {
    const { layouts, isLoaded, handleLayoutChange } = useDashboardLayout();
    const { width, containerRef, mounted } = useContainerWidth();
    const [isClient, setIsClient] = useState(false);

    // Ensure client-side only rendering to avoid hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Show loading only on client-side before mount
    if (!isClient || !isLoaded || !mounted) {
        return (
            <div ref={containerRef} className="w-full">
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-gray-400">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full">
            <ResponsiveGridLayout
                className="layout"
                width={width}
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={30}
                margin={[16, 16]}
                containerPadding={[0, 0]}
                dragConfig={{
                    enabled: true,
                    handle: '.widget-drag-handle, h2',
                    cancel: 'iframe',
                }}
                resizeConfig={{
                    enabled: true,
                    handles: ['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n'],
                }}
                onLayoutChange={handleLayoutChange}
            >
                {DASHBOARD_WIDGETS.map((widget) => (
                    <div key={widget.id} className="dashboard-widget-container">
                        <DashboardWidget widget={widget} />
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
}

