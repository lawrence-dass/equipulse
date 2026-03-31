import dynamic from 'next/dynamic';

const MermaidDiagram = dynamic(() => import('@/components/MermaidDiagram'), { ssr: false });

const SYSTEM_ARCHITECTURE = `
graph TB
    subgraph Client["🌐 Browser (Client)"]
        direction TB
        UI["Next.js 16 App Shell\n(React 19)"]
        LS["localStorage\neq_dashboard_layout\neq_watchlist"]
        TV["TradingView Widgets\n(iframe embeds)"]
        RGL["react-grid-layout\nDrag · Resize · Responsive"]
    end

    subgraph NextServer["⚙️ Next.js Server"]
        direction TB
        SA["Server Actions\n'use server'"]
        RC["React cache()\nRequest-level dedup"]
        NF["Next.js fetch cache\nrevalidate windows"]
    end

    subgraph External["☁️ External Services"]
        direction TB
        FH["Finnhub API\nStock Search · News · Profiles"]
        TVCDN["TradingView CDN\nWidget scripts"]
    end

    UI -->|"drag / resize events"| RGL
    RGL <-->|"persist layout"| LS
    UI <-->|"persist watchlist"| LS
    UI -->|"server action call"| SA
    SA --> RC
    RC --> NF
    NF -->|"FINNHUB_API_KEY\n(server-only)"| FH
    FH -->|"cached response"| NF
    NF --> SA
    SA -->|"typed result"| UI
    UI -->|"load on mount"| TV
    TV -->|"embed scripts"| TVCDN

    style Client fill:#111827,stroke:#374151,color:#e5e7eb
    style NextServer fill:#0f172a,stroke:#374151,color:#e5e7eb
    style External fill:#1c1917,stroke:#374151,color:#e5e7eb
`;

const DATA_FLOW = `
sequenceDiagram
    autonumber
    actor Visitor
    participant Browser
    participant NextServer as Next.js Server
    participant Cache as React Cache
    participant Finnhub as Finnhub API
    participant TV as TradingView CDN

    Visitor->>Browser: Navigate to /
    Browser->>NextServer: GET / (page request)
    NextServer->>Cache: searchStocks() — popular symbols
    alt cache HIT (revalidate: 3600s)
        Cache-->>NextServer: Cached stock profiles
    else cache MISS
        Cache->>Finnhub: GET /stock/profile2 × 10
        Finnhub-->>Cache: Company profiles
        Cache-->>NextServer: Fresh profiles
    end
    NextServer-->>Browser: HTML + hydration data

    Browser->>Browser: Read eq_dashboard_layout from localStorage
    Browser->>Browser: Read eq_watchlist from localStorage
    Browser->>TV: Load 4 widget scripts (async)
    TV-->>Browser: Market Overview · Heatmap · Quotes · News

    Visitor->>Browser: Type in search bar
    Browser->>NextServer: searchStocks(query) — debounced 300ms
    NextServer->>Cache: Check query cache (revalidate: 1800s)
    Cache->>Finnhub: GET /search?q=...
    Finnhub-->>Cache: Search results
    Cache-->>Browser: Matched stocks

    Visitor->>Browser: Drag / resize widget
    Browser->>Browser: Debounce 500ms → save to localStorage
`;

const COMPONENT_TREE = `
graph TD
    RootLayout["app/layout.tsx\nRootLayout"]
    AppLayout["app/(root)/layout.tsx\nLayout"]
    Header["components/Header.tsx\n⚡ async server component"]
    NavItems["components/NavItems.tsx"]
    SearchCmd["components/SearchCommand.tsx\n🔍 debounced search"]
    Page["app/(root)/page.tsx"]
    PubDash["components/PublicDashboard.tsx\n'use client'"]
    useLayout["lib/hooks/useDashboardLayout.ts\nuseSyncExternalStore → localStorage"]
    DashGrid["components/DashboardGrid.tsx\nreact-grid-layout wrapper"]
    Widget["components/DashboardWidget.tsx\nscript injection per widget"]
    WatchBtn["components/WatchlistButton.tsx\n'use client' · localStorage"]

    RootLayout --> AppLayout
    AppLayout --> Header
    AppLayout --> Page
    Header --> NavItems
    NavItems --> SearchCmd
    Page --> PubDash
    PubDash --> useLayout
    PubDash --> DashGrid
    DashGrid --> Widget
    Widget -->|"Market Overview"| W1["TradingView\nMarket Overview"]
    Widget -->|"Heatmap"| W2["TradingView\nStock Heatmap"]
    Widget -->|"Market Data"| W3["TradingView\nMarket Quotes"]
    Widget -->|"Top Stories"| W4["TradingView\nNews Timeline"]
    PubDash --> WatchBtn

    style RootLayout fill:#1f2937,stroke:#374151
    style AppLayout fill:#1f2937,stroke:#374151
    style Header fill:#0f172a,stroke:#facc15,color:#facc15
    style PubDash fill:#0f172a,stroke:#374151
    style useLayout fill:#14532d,stroke:#374151
    style WatchBtn fill:#14532d,stroke:#374151
`;

const TECH_STACK = `
graph LR
    subgraph Frontend["Frontend"]
        N["Next.js 16\nApp Router"]
        R["React 19"]
        TS["TypeScript 5"]
        TW["Tailwind CSS 4"]
        SH["shadcn/ui\nRadix primitives"]
        RGL["react-grid-layout\nDrag & drop grid"]
    end

    subgraph DataLayer["Data & State"]
        LS["localStorage\nClient persistence"]
        SA["Server Actions\n'use server'"]
        RC["React cache()\nRequest dedup"]
        FC["fetch + revalidate\nHTTP caching"]
    end

    subgraph ExternalAPIs["External APIs"]
        FH["Finnhub\nMarket data"]
        TV["TradingView\nWidget embeds"]
    end

    subgraph Infra["Infrastructure"]
        VE["Vercel\nServerless deploy"]
        GH["GitHub\nCI/CD"]
    end

    Frontend --> DataLayer
    DataLayer --> ExternalAPIs
    Frontend --> Infra
`;

type Section = { title: string; diagram: string; description: string };

const SECTIONS: Section[] = [
    {
        title: 'System Architecture',
        diagram: SYSTEM_ARCHITECTURE,
        description:
            'Equipulse is a fully public Next.js 16 application with no authentication. The server handles all paid API access using a server-only Finnhub key. Personalization (watchlist, layout) is stored entirely in the browser via localStorage — no account or database required. TradingView widgets load independently from their CDN, keeping server load minimal.',
    },
    {
        title: 'Request & Data Flow',
        diagram: DATA_FLOW,
        description:
            'On first paint, the server pre-fetches popular stock profiles (1-hour cache) and returns HTML. The browser reads saved layout and watchlist from localStorage, then loads four TradingView widgets asynchronously. Live stock search is debounced 300ms and served through Next.js server actions with a 30-minute response cache.',
    },
    {
        title: 'Component Architecture',
        diagram: COMPONENT_TREE,
        description:
            'The Header is a server component that pre-fetches initial stocks before render. PublicDashboard is a client component that owns the grid state via useSyncExternalStore — this keeps layout reactive across tabs. Each DashboardWidget injects a TradingView script tag into an isolated container.',
    },
    {
        title: 'Technology Stack',
        diagram: TECH_STACK,
        description:
            'Built on Next.js 16 App Router with React 19 and TypeScript. Styling uses Tailwind CSS 4 with shadcn/ui component primitives. Drag-and-drop grid layout is powered by react-grid-layout. All client state is browser-local; server state is read-only cached market data from Finnhub.',
    },
];

const STACK_ITEMS = [
    { label: 'Framework', value: 'Next.js 16 (App Router)', note: 'Server components, server actions, fetch caching' },
    { label: 'UI Library', value: 'React 19', note: 'Client + server components, useSyncExternalStore' },
    { label: 'Language', value: 'TypeScript 5', note: 'Strict mode, typed API responses' },
    { label: 'Styling', value: 'Tailwind CSS 4 + shadcn/ui', note: 'Utility-first, Radix UI primitives' },
    { label: 'Grid Layout', value: 'react-grid-layout', note: 'Drag, resize, responsive breakpoints' },
    { label: 'Market Data', value: 'Finnhub API', note: 'Search, news, company profiles — server-only key' },
    { label: 'Charts & Widgets', value: 'TradingView Embeds', note: 'Zero API cost — iframe widget scripts' },
    { label: 'Client State', value: 'localStorage', note: 'Watchlist (eq_watchlist), layout (eq_dashboard_layout)' },
    { label: 'Deployment', value: 'Vercel', note: 'Serverless, edge-ready, auto CDN' },
];

export default function ArchitecturePage() {
    return (
        <div className="space-y-16 pb-16">
            {/* Header */}
            <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Application Architecture</h1>
                <p className="text-gray-400 max-w-2xl leading-relaxed">
                    A fully public, auth-free market dashboard. No login required — personalization is
                    browser-local, market data is server-cached, and charts are TradingView embeds.
                </p>
            </div>

            {/* Tech Stack Quick Reference */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-200">Stack at a Glance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {STACK_ITEMS.map(({ label, value, note }) => (
                        <div
                            key={label}
                            className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-1"
                        >
                            <div className="text-xs font-medium text-yellow-500 uppercase tracking-wider">{label}</div>
                            <div className="text-sm font-semibold text-gray-100">{value}</div>
                            <div className="text-xs text-gray-500">{note}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Diagrams */}
            {SECTIONS.map(({ title, diagram, description }) => (
                <section key={title} className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold text-gray-200">{title}</h2>
                        <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">{description}</p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
                        <MermaidDiagram chart={diagram} />
                    </div>
                </section>
            ))}
        </div>
    );
}
