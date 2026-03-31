'use client';

import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import DashboardWidget from '@/components/DashboardWidget';
import { DASHBOARD_WIDGETS } from '@/lib/constants';
import { useDashboardLayout } from '@/lib/hooks/useDashboardLayout';
export default function PublicDashboard() {
    const { layouts, isLoaded, handleLayoutChange } = useDashboardLayout();
    const { width, containerRef, mounted } = useContainerWidth({
        initialWidth: 1280,
        measureBeforeMount: true,
    });
    const isReady = isLoaded && mounted;

    return (
        <div ref={containerRef} className="w-full">
                {isReady ? (
                    <ResponsiveGridLayout
                        className="layout"
                        width={width}
                        layouts={layouts}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={18}
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
                ) : (
                    <div className="flex min-h-screen items-center justify-center">
                        <div className="text-gray-400">Loading dashboard...</div>
                    </div>
                )}
        </div>
    );
}
