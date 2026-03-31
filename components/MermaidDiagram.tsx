'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    darkMode: true,
    themeVariables: {
        background: '#0f0f0f',
        primaryColor: '#1a1a2e',
        primaryTextColor: '#e5e7eb',
        primaryBorderColor: '#374151',
        lineColor: '#facc15',
        secondaryColor: '#1f2937',
        tertiaryColor: '#111827',
        edgeLabelBackground: '#1f2937',
        clusterBkg: '#111827',
        clusterBorder: '#374151',
        titleColor: '#facc15',
        nodeBorder: '#374151',
        nodeTextColor: '#e5e7eb',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    },
    flowchart: { curve: 'basis', padding: 20 },
    sequence: { actorMargin: 80 },
});

let idCounter = 0;

export default function MermaidDiagram({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const id = `mermaid-${++idCounter}`;
        mermaid.render(id, chart).then(({ svg }) => {
            if (ref.current) ref.current.innerHTML = svg;
        });
    }, [chart]);

    return <div ref={ref} className="mermaid-diagram overflow-x-auto" />;
}
