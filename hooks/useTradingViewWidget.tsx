'use client';
import { useEffect, useRef, useMemo } from 'react'

const useTradingViewWidget = (scriptURL: string, config: Record<string, unknown>, height = 600) => {
    const container = useRef<HTMLDivElement>(null);
    
    // Memoize trimmed URL to ensure dependency array matches actual usage
    const trimmedScriptURL = useMemo(() => scriptURL.trim(), [scriptURL]);
    
    // Memoize config string to avoid complex expression in dependency array
    const configString = useMemo(() => JSON.stringify(config), [config]);

    useEffect(
        () => {
          const containerElement = container.current;
          if (!containerElement) {
            return;
          }
          // Clear any existing content and remove loaded flag to allow re-initialization
          containerElement.innerHTML = '';
          delete containerElement.dataset.loaded;

          // Parse config from memoized string to ensure we use the latest config
          const parsedConfig = JSON.parse(configString);
          // Merge height prop into config (TradingView uses config height, not container style)
          const configWithHeight = { ...parsedConfig, height };

          // Create script element - TradingView expects script as direct child of container
          const script = document.createElement("script");
          script.type = "text/javascript";
          script.src = trimmedScriptURL;
          script.async = true;
          script.innerHTML = JSON.stringify(configWithHeight);
          
          // Append script directly to container (TradingView requirement)
          containerElement.appendChild(script);
          containerElement.dataset.loaded = "true";

          return () => {
            if (containerElement) {
              containerElement.innerHTML = "";
              delete containerElement.dataset.loaded;
            }
          };
        },
        [trimmedScriptURL, configString, height]
      );

    return container;
}

export default useTradingViewWidget