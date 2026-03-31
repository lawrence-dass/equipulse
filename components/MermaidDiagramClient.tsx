'use client';

import dynamic from 'next/dynamic';

const MermaidDiagram = dynamic(() => import('@/components/MermaidDiagram'), { ssr: false });

export default MermaidDiagram;
