# Frontend Implementation Blueprint: InsightFlow

## Technical Stack
- **Framework**: React 18+ (TypeScript)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Shadcn UI (Radix UI)
- **Animations**: Framer Motion
- **State Management**: Zustand (Client State) + TanStack Query v5 (Server Cache)
- **API Communication**: Axios + WebSockets

---

### 1. Folder Structure

```
frontend/
├── src/
│   ├── components/           # Generic Design System Primitives
│   │   ├── ui/               # Radix/Shadcn Components (button, input, dialogue)
│   │   ├── layout/           # App Frame Components (Sidebar, TopNav, Shell)
│   │   └── data-viz/         # Recharts wrappers (DynamicChartContainer, ForecastRange)
│   ├── config/               # App configuration (routes, constants)
│   ├── context/              # Context Providers (WebSocketConnectionContext)
│   ├── features/             # Core Feature Modules
│   │   ├── chat/             # Chat bubbles, message inputs, prompt grids
│   │   ├── dashboard/        # Custom grid widgets, drag-and-resize metrics
│   │   ├── catalog/          # Semantic model table managers
│   │   └── anomalies/        # RCA slide sheets, deviation logs
│   ├── hooks/                # Global React hooks
│   ├── lib/                  # Library settings (axiosClient, tailwindMerge)
│   ├── routes/               # Routing declarations & guards
│   ├── store/                # Zustand global stores
│   ├── types/                # TypeScript interface declarations
│   └── utils/                # Formatting and mathematical tools
```

---

### 2. Routing Architecture

Routing is declared as a static object layout handled via React Router’s `createBrowserRouter` API.

#### Route Mappings:
```typescript
// src/routes/index.tsx (Structure)
import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/onboarding", element: <OnboardingPage /> }
    ]
  },
  {
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <MainDashboardPage /> },
      { path: "/chat", element: <ConversationalWorkspacePage /> },
      { path: "/catalog", element: <SemanticCatalogPage /> },
      { path: "/alerts", element: <AnomalyAlertsPage /> },
      { path: "/settings", element: <SystemSettingsPage /> }
    ]
  }
]);
```

---

### 3. Layout Architecture

The main application frame runs an asynchronous, responsive shell:

- **DashboardLayout Component**:
  - Left Sidebar (Fixed 240px wide, contains tenant selector, main navigation links, connection state status indicator).
  - Main Panel Content wrapper:
    - Header Bar (Contains search command input, contextual alert notifications indicator, profile menu).
    - Page Render Area (`<Outlet />` wrapped in Framer Motion `<AnimatePresence>` for page transitions).

```typescript
// Framer Motion Page Transition Settings
export const pageTransitionVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" } }
};
```

---

### 4. Theme System

InsightFlow operates dark-mode first. We use Tailwind CSS class-based configuration mapping variables to standard HSL classes:

```javascript
// tailwind.config.js (System Extensions)
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))"
      }
    }
  }
}
```

---

### 5. Design Tokens (CSS Variables)

Defined inside `@/styles/index.css` to govern platform UI values:
- Dark Mode base canvas background: `240 10% 3.9%` (`#0A0A0C`).
- Interactive element background: `240 10% 6%` (`#0F0F12`).
- Accents: Violet `263.4 70% 50.4%` (`#6366F1`) & Teal `180 80% 45%` (`#14B8A6`).

---

### 6. Shared UI Components Specification

1. **`DynamicChartContainer`**: Uses Recharts `ResponsiveContainer`. Injects loading layers, parses custom data schemas, and formats tooltips dynamically.
2. **`SQLConsole`**: Code-highlighting viewer. Offers single-click SQL copy, preview schema lookup, and manual SQL query modifications.
3. **`HILActionModal`**: Renders dynamic interactive forms based on JSON inputs to support Human-in-the-loop task operations (e.g. SQL syntax overrides, workflow approvals).

---

### 7. State Management Approach

#### 7.1 Client state (Zustand)
Zustand stores manage light, transient UI states, separating auth tokens, chat histories, and theme variables.

```typescript
// Example: useChatStore Structure
interface ChatStore {
  messages: Array<any>;
  isStreaming: boolean;
  activeConversationId: string | null;
  addMessage: (msg: any) => void;
  setStreaming: (val: boolean) => void;
}
```

#### 7.2 Server state (TanStack Query)
TanStack Query manages database data fetches, caching, and polling routines.
- Mutation parameters: `useMutation` triggers REST queries and automatically invalidates outdated queries.

---

### 8. API Client Architecture

#### 8.1 Axios REST Client (`src/lib/axiosClient.ts`)
Standardized wrapper managing header injections and automatic refresh processes:
```typescript
import axios from "axios";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" }
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Standardized token refresh operations logic
    return Promise.reject(error);
  }
);
```

#### 8.2 WebSocket Chat Stream Manager (`src/lib/socketClient.ts`)
Coordinates connection parameters, JSON parsing, token buffering, and heartbeat checks.

---

File Name: frontend/README.md
