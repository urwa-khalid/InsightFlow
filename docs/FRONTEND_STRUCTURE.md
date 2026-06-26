# Frontend Application Architecture: InsightFlow

## Document Metadata
- **Product Name**: InsightFlow
- **Document Version**: 1.0.0
- **Status**: Draft
- **Author**: Senior Frontend Architect
- **Target Release Date**: Q4 2026

---

### 1. Folder Structure

InsightFlow is structured using a **Feature-Based Architecture** (also known as Domain-Driven Design) to isolate features, promote component reusability, and simplify scaling.

```
frontend/
├── .github/                  # CI/CD workflows, issue templates
├── public/                   # Static assets, favicon, manifest
├── src/
│   ├── assets/               # Global static assets (logos, illustrations)
│   ├── components/           # Global design system components (Atomic/Shadcn)
│   │   ├── ui/               # Raw Radix/Shadcn primitives (buttons, dialogs, dropdowns)
│   │   ├── layout/           # Shared Layout wrappers (Sidebar, TopNav, PageWrapper)
│   │   └── data-viz/         # Core chart wrappers (LineChart, MetricDriftBar, ForecastRange)
│   ├── config/               # App-wide settings, client configurations, env constants
│   ├── context/              # Context Providers (AuthContext, ThemeContext)
│   ├── features/             # Domain-specific modules
│   │   ├── chat/             # Chat UI, streaming chat hooks, query prompts
│   │   ├── dashboard/        # Custom dashboard layouts, metric cards grid
│   │   ├── catalog/          # Semantic layer model mapping table editor
│   │   ├── anomalies/        # RCA side-drawers, anomaly alerts config
│   │   └── settings/         # Data source connectors setup, profile management
│   ├── hooks/                # Global generic utility hooks (useInterval, useDebounce)
│   ├── lib/                  # Library initializations (axiosClient, socketClient, tailwindMerge)
│   ├── routes/               # Routing mappings and route guards
│   ├── store/                # Zustand global state managers
│   ├── types/                # System-wide TypeScript interface definitions
│   ├── utils/                # Functional utilities (currency formatters, date builders)
│   ├── App.tsx               # Root app initializer
│   └── main.tsx              # Bundler entrypoint
├── tailwind.config.js        # Tailwind design system configuration
├── tsconfig.json             # TypeScript rules configuration
└── vite.config.ts            # Vite compiler configuration
```

---

### 2. Routing Structure

We utilize **React Router v6** with nested layouts, path-based lazy loading, and middleware-like routing guards to manage page transitions.

```
[Root: /]
  │
  ├── [Public Gateway Route] (Layout: AuthLayout)
  │     ├── /login           --> Lazy-loaded LoginPage
  │     └── /onboarding      --> Lazy-loaded OnboardingSetupPage
  │
  └── [Private Session Route] (Layout: AppDashboardLayout)
        ├── /dashboard       --> Lazy-loaded MainDashboardPage
        ├── /chat            --> Lazy-loaded ConversationalWorkspacePage
        ├── /catalog         --> Lazy-loaded SemanticCatalogPage
        ├── /alerts          --> Lazy-loaded AnomalyAlertsPage
        └── /settings        --> Lazy-loaded SystemSettingsPage
```

#### Route Guarding Strategy:
- **`ProtectedRoute`**: Verifies JWT existence inside Zustand Auth state. Unauthenticated requests trigger redirection to `/login` carrying the original redirect URL inside state query parameters.
- **`RoleGuard`**: Protects routing branches based on user type context. For example, restricting `/catalog` and `/settings` connections exclusively to users carrying `Admin` or `Analyst` credentials.

---

### 3. State Management Architecture

State is split into three layers to optimize memory boundaries and prevent unnecessary React re-renders.

```
+---------------------------------------------------------------------------------+
|                                 STATE MANAGER                                   |
+---------------------------------------------------------------------------------+
| 1. Client UI State (Zustand Stores)                                             |
|    - useChatStore (Active conversation streams, input values, collapsible boxes)|
|    - useUIStore (Sidebar navigation states, layout templates, theme modes)       |
|    - useAuthStore (Access tokens, current tenant details, permissions profile)  |
+---------------------------------------------------------------------------------+
| 2. Server Cache State (TanStack Query)                                         |
|    - Query key structures: ['datasets', conversationId]                         |
|    - Handled via Axios clients. Manages loading, caching, polling of RCA tasks. |
+---------------------------------------------------------------------------------+
| 3. Shared Context Providers (React Context)                                     |
|    - WebSocketConnectionContext (Active subscription stream event-emitter loop)  |
+---------------------------------------------------------------------------------+
```

---

### 4. Component Hierarchy

The page workspace structure detailing component rendering hierarchies:

```
App.tsx (Theme & Auth Providers)
  └── RouterProvider
        └── AppDashboardLayout
              ├── Sidebar (NavLinks, TenantSwitcher)
              ├── TopNav (SearchBar, ProfileMenu, ConnectionStatus)
              └── PageContentWrapper (Framer Motion page transition anim)
                    └── ConversationalWorkspacePage (AI Chat Grid)
                          ├── ChatWorkspace (Left Column)
                          │     ├── MessageHistoryList
                          │     │     ├── UserMessageBubble
                          │     │     └── AIMessageBubble
                          │     │           └── SQLPreviewCollapsible
                          │     └── MessageInputForm
                          │           ├── MetricsBadgeAttachment
                          │           └── PromptTextArea
                          └── VisualizationWorkspace (Right Column)
                                ├── VisualizationHeaderTabs (Chart, Grid, Log)
                                ├── DynamicChartRenderer (Recharts)
                                └── TelemetryGraphViewer (LangGraph state node map)
```

---

### 5. Shared Components Specification

Generic UI primitives configured strictly to import from `@/components/ui`:

1. **`DynamicChartContainer`**: Wrapper enforcing layout constraints. Automatically detects screen dimension adjustments, handles rendering skeletons during pending query runs, and exports layouts directly to images.
2. **`SQLConsole`**: Code-highlighting container (integrates `prismjs` or `monaco-editor`). Contains action toggles: "Copy SQL," "Run SELECT Query," and "Edit Mode."
3. **`MetricTrendCard`**: Key metric displays. Formats values based on type (Currency, Percent, Int) and changes colors dynamically (Secondary Green vs Alert Rose).
4. **`HILActionModal`**: The global Human-In-The-Loop dialog component. Halts workspace overlays, alerts users to manual actions needed, and returns approved payloads.

---

### 6. Feature Modules

#### 6.1 Chat Feature Domain (`@/features/chat`)
- **`useChatStream` Hook**: Manages real-time data streaming over WebSockets. Buffers inbound text tokens, builds layout states dynamically, and processes JSON payloads containing SQL queries or Recharts configurations.
- **`SuggestionPillGrid`**: Renders contextual prompts based on historical user interactions.

#### 6.2 Anomalies & RCA Domain (`@/features/anomalies`)
- **`RCADrawer`**: Animated side sheet displaying dimensional deviation weights.
- **`AnomalyTimeline`**: Grouped timeline list highlighting metric variance checks.

#### 6.3 Schema Catalog Domain (`@/features/catalog`)
- **`SemanticCatalogTable`**: Data grid enabling analysts to assign descriptions and synonyms to columns, triggering backend pgvector indexing updates.

---

### 7. API Integration Strategy

We utilize **TanStack Query (React Query) v5** coupled with **Axios** for REST API operations, and custom WebSocket managers for chat streaming:

- **HTTP Request Gateway**: A pre-configured Axios instance injecting auth tokens dynamically:
  ```typescript
  // Axios interceptor injection definition
  axiosClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  ```
- **WebSocket Gateway**: Initiated via `/api/v1/query/chat/ws`. Manages heartbeat ticks to detect connections dropping and queues messages during network breaks.

---

### 8. Error Handling Strategy

1. **Global React Error Boundary**: Root-level error boundary capturing render exceptions, logging issues to telemetry systems, and showing users a "Clean Refresh" screen.
2. **REST API Error Interceptors**: Catching error status codes uniformly:
   - `401 Unauthorized`: Triggers automatic refresh token request flow. If it fails, resets auth state and routes to `/login`.
   - `403 Forbidden`: Displays standard "Access Denied" toast warnings.
   - `422 Unprocessable Entity`: Parses validations payload lists and routes field messages to active form views.
3. **Agent Pipeline Error States**: Captured directly in the execution state payload. Enables visual error messages detailing query failures (e.g. invalid SQL queries) and prompts users to trigger self-correction steps.

---

File Name: docs/FRONTEND_STRUCTURE.md
