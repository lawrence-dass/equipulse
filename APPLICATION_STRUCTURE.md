# Equipulse - Application Structure Documentation

## Overview

**Equipulse** is a real-time stock market portfolio tracking and trading platform built with Next.js 16. It allows users to track their portfolios, view detailed stock information, manage watchlists, and receive personalized market news updates.

### Key Features

- **Public Dashboard**: Accessible to all visitors with TradingView widgets showing market data
- **User Authentication**: Sign up and sign in with email/password using Better Auth
- **Personalized Dashboard**: Customizable drag-and-drop dashboard layouts per user
- **Stock Details**: Comprehensive stock information pages with multiple TradingView widgets
- **Watchlist Management**: Save and track favorite stocks
- **Personalized Emails**: AI-generated welcome emails and daily news summaries
- **User Preferences**: Store investment goals, risk tolerance, preferred industries, and country

---

## Technology Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **React Grid Layout** (for drag-and-drop dashboard)

### Backend
- **Next.js Server Actions** (API layer)
- **Better Auth** (authentication)
- **MongoDB** with **Mongoose** (database)
- **Inngest** (background job processing)
- **Nodemailer** (email service)

### External Services
- **TradingView Widgets** (stock charts and market data)
- **Finnhub API** (market news)
- **Gemini AI** (email personalization and news summarization)

---

## Application Architecture

### High-Level Architecture

The application follows a modern Next.js App Router architecture with:

1. **Client Layer**: React components for UI
2. **Server Layer**: Server Actions for data operations
3. **Background Jobs**: Inngest functions for async tasks
4. **Database**: MongoDB for data persistence
5. **External APIs**: TradingView and Finnhub for market data

### Route Structure

The application uses Next.js route groups for organization:

```
app/
├── (root)/              # Public routes (no auth required)
│   ├── page.tsx        # Home page (Public Dashboard)
│   ├── layout.tsx      # Root layout
│   ├── dashboard/      # Protected dashboard routes
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── stocks/[symbol]/ # Stock details pages
│       └── page.tsx
│
├── (auth)/              # Authentication routes
│   ├── layout.tsx      # Auth layout
│   ├── sign-in/
│   │   └── page.tsx
│   └── sign-up/
│       └── page.tsx
│
└── api/
    └── inngest/
        └── route.ts    # Inngest webhook endpoint
```

---

## Database Schema

### Collections

#### 1. Users Collection (Better Auth)
Managed by Better Auth library. Contains:
- `id`: Unique user identifier
- `email`: User email (unique)
- `name`: User's full name
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

#### 2. UserPreferences Collection
Stores user preferences and dashboard layouts:
```typescript
{
  userId: string (unique, indexed)
  investmentGoals: string
  riskTolerance: string
  preferredIndustry: string
  country: string
  dashboardLayout: JSON (ResponsiveLayouts from react-grid-layout)
  createdAt: Date
  updatedAt: Date
}
```

#### 3. Watchlist Collection
Stores user's watchlist items:
```typescript
{
  _id: ObjectId
  userId: string (indexed)
  symbol: string (uppercase, unique per user)
  company: string
  addedAt: Date
}
```
- Compound unique index on `(userId, symbol)` prevents duplicates

---

## Component Architecture

### Main Components

#### Public Components
- **PublicDashboard**: Public-facing dashboard with TradingView widgets
  - Uses `useDashboardLayout(false)` for non-persistent layouts
  - Shows sign-in/sign-up CTAs

#### User Components
- **UserDashboard**: Authenticated user dashboard
  - Uses `useUserDashboardLayout(userId)` for persistent layouts
  - Loads and saves user's custom layout

#### Shared Components
- **DashboardWidget**: Wrapper for TradingView widgets with drag handles
- **TradingViewWidget**: Generic component for embedding TradingView widgets
- **WatchlistButton**: Add/remove stocks from watchlist
- **Header**: Navigation header with user dropdown and search
- **DashboardGrid**: Responsive grid layout container

### Component Hierarchy

```
App Layout
├── Root Layout (for public routes)
│   ├── Home Page → PublicDashboard
│   ├── Dashboard Page → UserDashboard
│   ├── Stock Details Page
│   └── Header
│
└── Auth Layout (for auth routes)
    ├── Sign Up Page
    └── Sign In Page
```

---

## Data Flow

### Authentication Flow

1. **Sign Up**:
   - User fills form with preferences
   - `signUpWithEmail` server action creates account
   - User preferences saved to database
   - Inngest event `app/user.created` triggered
   - Background job generates personalized welcome email
   - User redirected to dashboard

2. **Sign In**:
   - User enters credentials
   - `signInWithEmail` validates and creates session
   - User redirected to dashboard

### Dashboard Loading Flow

1. User visits dashboard
2. `useUserDashboardLayout` hook called
3. Hook fetches saved layout from database
4. If no layout exists, uses default layout
5. Layout applied to `ResponsiveGridLayout`
6. Widgets rendered with TradingView components

### Layout Persistence Flow

1. User drags/resizes widget
2. `handleLayoutChange` called with new layout
3. Layout saved to database via `saveUserDashboardLayout`
4. State updated locally for immediate UI feedback

### Stock Details Flow

1. User navigates to `/stocks/[symbol]`
2. Page renders multiple TradingView widgets:
   - Symbol Info
   - Candle Chart
   - Baseline Chart
   - Technical Analysis
   - Company Profile
   - Company Financials
3. Watchlist button allows adding stock to watchlist

---

## Request/Response Flow

The application follows Next.js App Router patterns for handling requests. Here's how different types of requests flow through the system:

### Page Load Request Flow

1. **User Request**: User navigates to a URL (e.g., `/dashboard`)
2. **Next.js Server**: Receives HTTP GET request
3. **App Router**: Routes request to appropriate page component
4. **Authentication Check**: Server checks session using Better Auth
   - If not authenticated → Redirect to `/sign-in`
   - If authenticated → Continue rendering
5. **Component Rendering**: Server Component renders and may call hooks
6. **Data Fetching**: Hooks call Server Actions to fetch data
7. **Database Query**: Server Actions query MongoDB
8. **External APIs**: If needed, fetch data from TradingView or Finnhub
9. **Response**: HTML + JavaScript sent to client
10. **Hydration**: React hydrates on client side

### User Interaction Flow (Form Submission)

1. **User Action**: User submits form (e.g., sign up)
2. **Client Component**: Form handler calls Server Action
3. **Server Action**: Executes server-side logic
   - Validates input
   - Calls Better Auth API
   - Saves to database
   - Triggers background jobs
4. **Response**: Returns success/error status
5. **Client Update**: Component updates UI based on response
6. **Navigation**: Redirects to appropriate page

### API Request Flow (External Data)

1. **Component Needs Data**: Component requires external data
2. **Server Action**: Called from component or hook
3. **External API Call**: Fetches from Finnhub API or TradingView
4. **Data Processing**: Validates and formats response
5. **Return Data**: Sends formatted data back to component
6. **Render**: Component renders with new data

### Background Job Flow (Async Processing)

1. **Event Trigger**: Server Action sends event to Inngest
2. **Event Queued**: Inngest queues the event
3. **Function Execution**: Inngest function processes event
4. **External Services**: May call AI APIs, email services
5. **Database Updates**: May update database records
6. **Completion**: Job completes asynchronously (no user waiting)

### Request Types

- **Server Components**: Rendered on server, no client JavaScript needed
- **Client Components**: Rendered on client, can use hooks and interactivity
- **Server Actions**: Server-side functions called from client components
- **API Routes**: Traditional REST endpoints (used for Inngest webhooks)

See the **Request/Response Flow** diagram in `application-structure.mermaid` for detailed sequence diagrams showing these flows.

---

## Background Jobs (Inngest)

### 1. Welcome Email Function

**Trigger**: `app/user.created` event

**Process**:
1. Receives user data (email, name, preferences)
2. Builds personalized prompt with user profile
3. Calls Gemini AI to generate personalized intro
4. Sends welcome email via Nodemailer

**File**: `lib/inngest/functions.ts` → `sendSignUpEmail`

### 2. Daily News Summary Function

**Trigger**: Daily cron at 12:00 PM (`0 12 * * *`)

**Process**:
1. Fetches all users for news delivery
2. For each user:
   - Gets their watchlist symbols
   - Fetches news from Finnhub API
   - If no watchlist news, fetches general market news
   - Limits to 6 articles
3. Summarizes news using Gemini AI
4. Sends personalized news email

**File**: `lib/inngest/functions.ts` → `sendDailyNewsSummary`

---

## Server Actions

### Authentication Actions
- `signUpWithEmail`: Create new user account
- `signInWithEmail`: Authenticate user
- `signOut`: End user session

**File**: `lib/actions/auth.actions.ts`

### User Preferences Actions
- `getUserPreferences`: Fetch user preferences
- `saveUserPreferences`: Save user preferences
- `getUserDashboardLayout`: Fetch saved dashboard layout
- `saveUserDashboardLayout`: Save dashboard layout

**File**: `lib/actions/userPreferences.actions.ts`

### Watchlist Actions
- `getWatchlistSymbolsByEmail`: Get user's watchlist symbols
- Additional watchlist CRUD operations

**File**: `lib/actions/watchlist.actions.ts`

### External API Actions
- `getNews`: Fetch market news from Finnhub API
- Other Finnhub-related actions

**File**: `lib/actions/finnhub.actions.ts`

---

## Custom Hooks

### `useDashboardLayout`
- Manages layout state for public dashboard
- Non-persistent (no database saves)
- **File**: `lib/hooks/useDashboardLayout.ts`

### `useUserDashboardLayout`
- Manages layout state for user dashboard
- Loads from and saves to database
- **File**: `lib/hooks/useUserDashboardLayout.ts`

### `useDebounce`
- Debounces input values
- Used for search functionality
- **File**: `hooks/useDebounce.ts`

---

## External Integrations

### TradingView Widgets

The application embeds TradingView widgets for:
- Market overview charts
- Symbol information
- Advanced candlestick charts
- Technical analysis
- Company profiles
- Financial data
- Heatmaps

Widgets are configured in `lib/constants.ts` with dark theme styling.

### Finnhub API

Used for:
- Fetching market news
- Stock data (if needed)

API key stored in environment variable: `NEXT_PUBLIC_FINNHUB_API_KEY`

### Gemini AI

Used for:
- Generating personalized welcome email content
- Summarizing market news for daily emails

Model: `gemini-2.5-flash-lite`

---

## Environment Variables

Required environment variables:

```env
# Database
MONGODB_URI=<mongodb_connection_string>

# Authentication
BETTER_AUTH_SECRET=<secret_key>
BETTER_AUTH_URL=<app_url>

# External APIs
NEXT_PUBLIC_FINNHUB_API_KEY=<finnhub_api_key>

# Inngest
INNGEST_EVENT_KEY=<inngest_event_key>
INNGEST_SIGNING_KEY=<inngest_signing_key>

# Email (for Nodemailer)
EMAIL_HOST=<smtp_host>
EMAIL_PORT=<smtp_port>
EMAIL_USER=<smtp_user>
EMAIL_PASS=<smtp_password>
```

---

## Key Files and Directories

### Configuration Files
- `package.json`: Dependencies and scripts
- `next.config.ts`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS configuration

### Core Application Files
- `app/layout.tsx`: Root application layout
- `app/globals.css`: Global styles
- `lib/constants.ts`: Application constants and widget configurations

### Database Files
- `database/mongoose.ts`: MongoDB connection setup
- `database/models/`: Mongoose models

### Utility Files
- `lib/utils.ts`: General utility functions
- `lib/utils/dashboardLayout.ts`: Dashboard layout utilities
- `lib/utils/dashboardPersonalization.ts`: Personalization logic

---

## Development Workflow

### Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Testing

```bash
npm run test:db
```

---

## Future Enhancements

Based on the codebase structure, potential future features:

1. **Portfolio Tracking**: Actual portfolio management (currently focused on watchlist)
2. **Trading Functionality**: Execute trades (currently viewing only)
3. **Alerts System**: Price alerts and notifications
4. **Advanced Analytics**: Portfolio performance metrics
5. **Social Features**: Share portfolios or insights
6. **Mobile App**: React Native or mobile web optimization

---

## Notes

- The application uses Next.js Server Components by default
- Client components are marked with `'use client'`
- Server actions are marked with `'use server'`
- Authentication is handled server-side with Better Auth
- Dashboard layouts are stored as JSON in MongoDB
- TradingView widgets are embedded via iframes
- Background jobs run asynchronously via Inngest

---

## Diagram Reference

See `application-structure.mermaid` for visual diagrams of:
1. Application architecture overview
2. User authentication flow
3. Database schema relationships
4. Component hierarchy
5. Data flow sequences
6. Background jobs flow
7. Stock details page flow
8. File structure tree
9. **Request/Response Flow** - Complete cycle showing how requests flow from user browser through Next.js server, server actions, database, external APIs, and background jobs, with detailed sequence diagrams for different request types (page loads, user interactions, API calls, and background processing)
