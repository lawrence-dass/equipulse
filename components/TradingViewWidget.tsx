'use client'
import useTradingViewWidget from '@/hooks/useTradingViewWidget';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface TradingViewWidgetProps {
  title?: string;
  scriptURL: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
}

function TradingViewWidget({ title, scriptURL, config, height = 600, className }: TradingViewWidgetProps) {
  const container = useTradingViewWidget(scriptURL, config, height);

  return (
    <div className='w-full h-full'>
        { title && <h2 className="font-semibold text-2xl text-gray-100 mb-5">{title}</h2> }
        <div className={cn("tradingview-widget-container", className)} ref={container} style={{ height: `${height}px`, width: "100%" }} />
    </div>
  );
}

export default memo(TradingViewWidget);
