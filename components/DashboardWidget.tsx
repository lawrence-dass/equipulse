'use client';

import TradingViewWidget from '@/components/TradingViewWidget';
import { WidgetConfig } from '@/lib/constants';
import { memo } from 'react';

interface DashboardWidgetProps {
    widget: WidgetConfig;
}

function DashboardWidget({ widget }: DashboardWidgetProps) {
    return (
        <div className="h-full w-full relative">
            {/* Drag handle area - top 50px of widget */}
            <div className="widget-drag-handle" />
            <TradingViewWidget
                title={widget.title}
                scriptURL={widget.scriptURL}
                config={widget.config}
                height={widget.height}
                className={widget.className}
            />
        </div>
    );
}

export default memo(DashboardWidget);
