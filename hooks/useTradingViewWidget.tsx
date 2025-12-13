import { useEffect, useRef } from 'react'

const useTradingViewWidget = (scriptURL: string, config: Record<string, unknown>, height = 600) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
          if (!container.current) {
            return;
          }
          // Clear any existing content and remove loaded flag to allow re-initialization
          container.current.innerHTML = '';
          delete container.current.dataset.loaded;

          // Merge height prop into config (TradingView uses config height, not container style)
          const configWithHeight = { ...config, height };

          // Create script element - TradingView expects script as direct child of container
          const script = document.createElement("script");
          script.type = "text/javascript";
          script.src = scriptURL.trim();
          script.async = true;
          script.innerHTML = JSON.stringify(configWithHeight);
          
          // Append script directly to container (TradingView requirement)
          container.current.appendChild(script);
          container.current.dataset.loaded = "true";

          return () => {
            if (container.current) {
              container.current.innerHTML = "";
              delete container.current.dataset.loaded;
            }
          };
        },
        [scriptURL, JSON.stringify(config), height]
      );

    return container;
}

export default useTradingViewWidget