# InsightFlow Design System & UI Specifications

## Design Philosophy

InsightFlow's design language combines the data density of **Stripe**, the command-oriented workflows of **Linear**, the geometric precision of **Vercel**, and the interactive fluidity of **Framer**. 

We employ a **dark-mode first** aesthetic centered on glassmorphic depth, crisp micro-borders, high contrast typography, and custom visual widgets designed to look like a premium enterprise-grade platform.

---

### 1. Design Tokens & Core Variables

Our core styling uses Tailwind CSS variables mapped to standard HSL values, allowing for real-time opacity changes (e.g. `bg-background/80`).

```css
:root {
  /* Color Palette (Dark Mode Base) */
  --background: 240 10% 3.9%;      /* #0A0A0C - Vercel Deep Black */
  --foreground: 0 0% 98%;          /* #FAFAFA - Crisp Off-White */
  
  --card: 240 10% 6%;              /* #0F0F12 - Subtle Card Black */
  --card-foreground: 0 0% 98%;
  
  --popover: 240 10% 4.9%;         /* #0C0C0E - Tooltips/Popovers */
  --popover-foreground: 240 5% 64.9%;
  
  /* Brand Accents */
  --primary: 263.4 70% 50.4%;      /* Indigo Violet (Stripe Accent) */
  --primary-foreground: 210 20% 98%;
  
  --secondary: 180 80% 45%;        /* Electric Mint Teal (Data & Positive Trends) */
  --secondary-foreground: 240 10% 3.9%;
  
  --muted: 240 3.7% 15.9%;         /* Slate Gray (Subtle Details) */
  --muted-foreground: 240 5% 64.9%;
  
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;

  /* Semantic Alerts */
  --destructive: 346.8 77.2% 49.8%; /* Neon Rose (Negative Anomaly) */
  --destructive-foreground: 0 85.7% 97.3%;
  
  --warning: 35.4 91.7% 32.9%;     /* Amber Gold (Warning / Human Needed) */
  --warning-foreground: 0 0% 98%;

  /* Structural Borders & Controls */
  --border: 240 5.9% 12%;          /* #1E1E24 - High-fidelity micro borders */
  --input: 240 5.9% 10%;           /* Input fields */
  --ring: 263.4 70% 50.4%;         /* Focus rings */
  
  --radius: 0.5rem;                /* 8px UI Radius */
}
```

---

### 2. Color Palette & Visual Hierarchy

InsightFlow avoids flat black and standard primary colors. We rely on dark-gray backgrounds with slight saturation offsets to convey visual layout levels.

```
[Layer 0: #0A0A0C] Canvas Background (App body)
  |
  +-- [Layer 1: #0F0F12] Main Panels & Workspace Cards (Border: 1px solid HSL(240, 5.9%, 12%))
        |
        +-- [Layer 2: #16161B] Interactive Items, Buttons, Inputs (Hover: scale(1.02) + border highlight)
```

#### Accent Palette Usage:
- **Primary Violet (`#6366F1`)**: Interactive states, active chat focus, navigation buttons, primary actions.
- **Teal Mint (`#14B8A6`)**: Trend directions (upwards), successful test outcomes, forecasting predictions.
- **Warning Amber (`#F59E0B`)**: Human-in-the-loop interrupts, data source sync warnings, prediction boundaries.
- **Rose Red (`#F43F5E`)**: Out-of-bounds anomaly warnings, SQL errors, system failure logs.

---

### 3. Typography System

We use a modern, geometric font configuration. The body text leverages **Inter** for readability, while headings use **Geist Sans** or **Outfit** to establish structure. Technical metrics, code snippets, and SQL display blocks use **Geist Mono** or **SF Mono**.

| Hierarchy | Font Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 Display** | Geist Sans | 36px | 600 (SemiBold) | 1.2 | -0.03em |
| **H2 Section** | Geist Sans | 24px | 500 (Medium) | 1.3 | -0.02em |
| **H3 Header** | Inter | 18px | 600 (SemiBold) | 1.4 | -0.01em |
| **Body (Main)** | Inter | 14px | 400 (Regular) | 1.5 | 0 |
| **Body (Muted)** | Inter | 12px | 400 (Regular) | 1.5 | +0.01em |
| **Monospace / Code**| SF Mono / Geist | 13px | 400 (Regular) | 1.6 | 0 |

---

### 4. Component Library (Visual Specifications)

#### 4.1 Chat Bubble Components
- **User Message**:
  - Background: Transparent with a 1px solid border at `var(--border)`.
  - Alignment: Right-aligned, max-width 70%.
  - Text Color: `var(--foreground)`.
- **AI Agent Response**:
  - Background: Glassmorphic background blur (`backdrop-blur-md bg-card/45`).
  - Border: Left border offset using Accent violet color gradient (`border-l-2 border-l-primary`).
  - Text Color: `var(--foreground)`.

#### 4.2 Interactive Query SQL Display
- Collapsed preview card showing: `SELECT week, SUM(revenue) FROM fact_sales...`
- Right-aligned "Copy" and "Edit SQL" actions.
- Expandable transition (Framer Motion) revealing the full database query schema mapping and index usage metadata.

#### 4.3 KPI Cards
- Standard size cards containing a 1px top border gradient (`bg-gradient-to-r from-primary/30 to-transparent`).
- Big bold indicator numbers (`text-3xl font-semibold track-tighter`).
- Subtle trend indicator at the bottom (e.g. `+14.2% since last week` inside a pill with a `text-secondary bg-secondary/10` style).

---

### 5. Layout Architectures

#### 5.1 Main Dashboard Layout
A 3-column modular design maximizing dashboard space and preventing clutter:

```
+------------------------------------------------------------------------------------+
|  [Logo] Search Data...                                               [Tenant Select] |
+------------------------------------------------------------------------------------+
|  [S] |  Metric Overview             [Period Select: Last 30 Days]  |  [Anomalies]   |
|  [i] |  +-----------------------+   +---------------------------+  |  - Rev Dip (CS)|
|  [d] |  | Total revenue         |   | Conversion Rate           |  |  - Signups (DE)|
|  [e] |  | $1.2M (+12%)          |   | 3.4% (-0.2%)              |  |                |
|  [b] |  +-----------------------+   +---------------------------+  |  [Forecasts]   |
|  [a] |                                                             |  - Q3 Target   |
|  [r] |  +-------------------------------------------------------+  |    $1.5M       |
|  [s] |  | Chart Canvas (Recharts Line chart)                    |  |                |
|      |  |                                                       |  |                |
|      |  +-------------------------------------------------------+  |                |
+------------------------------------------------------------------------------------+
```

#### 5.2 AI Workspace Layout
A split-pane screen optimized for real-time text-to-SQL exploration:
- **Left Pane (40% width)**: Scrollable chat thread history. Includes quick-prompt suggestions (e.g. *"Show me the anomaly root cause for June revenue drop"*). Bottom prompt input text area containing a single-row form with drag-and-drop metrics attachments.
- **Right Pane (60% width)**: Active visualization canvas. Shows corresponding charts, table data views, SQL editor pane, and confidence intervals logs.

#### 5.3 Analytics Workspace & RCA Slide-Over
- When a user clicks on an anomaly alert or clicks "Explain this metric," a slide-over panel drawers in from the right edge (50% screen width, with animated transition `spring(damping: 25, stiffness: 200)`).
- **RCA Drawer contents**:
  - Narrative card summarizing the anomaly explanation.
  - Dimension variance grid chart (bar chart showcasing contributing weights).
  - Webhook button: *"Generate n8n resolution path"* to schedule operational workflows.

#### 5.4 Reports & Grid Customization Canvas
- Drag-and-drop widget layout. Dashboards use a standard 12-column grid.
- Hover states reveal border handles to resize charts (`resize-both`).
- Top banner configuration containing: "Add Metric Widget," "Layout Autocomplete (AI-aligned)," and "Export to Slack / Email."

#### 5.5 Agent Execution Telemetry Panel
Provides engineering transparency to monitor the LangGraph workflow:
- Left pane displays the real-time graph nodes as an interactive SVG canvas (completed nodes highlighted in emerald, active nodes in pulsing violet, inactive in dark-slate).
- Right pane displays streaming console logs (`Geist Mono` font). Active human review interventions overlay as a full-page modal card.

---

### 6. Responsive Design Guidelines

InsightFlow keeps full desktop data density but handles small devices gracefully:

- **Breakpoints**:
  - `sm`: 640px (Mobile viewports, single column layouts, navigation changes to mobile bottom sheet bar).
  - `md`: 768px (Tablets, double-pane split workspaces convert to collapsible tab bars).
  - `lg`: 1024px (Standard desktops, 3-column layout unlocked).
- **Responsive Chart scaling**:
  - Wrap all Recharts canvas containers inside a component: `<ResponsiveContainer width="100%" height={350}>`.

---

### 7. Accessibility (a11y) Guidelines

To comply with enterprise requirements, we target **WCAG 2.1 Level AA** standards:

1. **Color Contrast**: All text must have a minimum contrast ratio of 4.5:1. Muted text styles must use `var(--muted-foreground)` to prevent eye strain.
2. **Keyboard Navigation**:
   - Focus ring styles: Use `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
   - Popovers and menus support Esc key closing.
3. **Screen Readers**:
   - Interactive widgets must carry unique aria identifiers (e.g. `<button aria-label="Toggle SQL Preview" aria-expanded="false">`).
   - SVG charts include raw data backups in tables for screen reader processing.

---

File Name: docs/DESIGN_SYSTEM.md
