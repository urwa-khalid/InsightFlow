import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";

// Simple premium mock views representing sections
const DashboardView = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
      <div className="text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-md border border-border">
        Last 30 Days
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {["Total Revenue", "Active Customers", "Conversion Rate"].map((title, i) => (
        <div key={i} className="p-6 bg-card border border-border rounded-lg relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tracking-tight mt-2">
            {i === 0 ? "$1,284,500" : i === 1 ? "12,450" : "3.42%"}
          </p>
          <p className="text-xs text-secondary mt-1 font-medium">
            {i === 2 ? "-0.12% vs last month" : "+12.4% vs last month"}
          </p>
        </div>
      ))}
    </div>
    <div className="h-[300px] bg-card/50 border border-border rounded-lg flex items-center justify-center text-muted-foreground">
      Interactive Recharts Visualization Placeholder
    </div>
  </div>
);

const ChatWorkspaceView = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
    <div className="lg:col-span-5 bg-card border border-border rounded-lg p-6 flex flex-col justify-between">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">AI Conversations</h2>
        <div className="text-sm text-muted-foreground italic">No message logs started. Type a question below to analyze your data...</div>
      </div>
      <div className="mt-4">
        <input 
          type="text" 
          placeholder="Ask a question about your business data..." 
          className="w-full bg-input border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
    <div className="lg:col-span-7 bg-card/45 border border-border rounded-lg flex items-center justify-center text-muted-foreground">
      Data Execution View Workspace Canvas
    </div>
  </div>
);

const CatalogView = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-semibold tracking-tight">Semantic Layer Catalog</h1>
    <div className="p-6 bg-card border border-border rounded-lg text-muted-foreground">
      Semantic tables metadata dictionary editor.
    </div>
  </div>
);

const AlertsView = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-semibold tracking-tight">Anomaly Alerts</h1>
    <div className="p-6 bg-card border border-border rounded-lg text-muted-foreground">
      Metric drift detections and root cause analysis reports.
    </div>
  </div>
);

const SettingsView = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-semibold tracking-tight">System Settings</h1>
    <div className="p-6 bg-card border border-border rounded-lg text-muted-foreground">
      Configure database connections and credentials.
    </div>
  </div>
);

const LoginView = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-4">
    <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-center">Login to InsightFlow</h2>
      <div className="space-y-4">
        <input type="email" placeholder="Email Address" className="w-full bg-input border border-border rounded-md px-4 py-2.5 text-sm" />
        <input type="password" placeholder="Password" className="w-full bg-input border border-border rounded-md px-4 py-2.5 text-sm" />
        <button 
          onClick={() => {
            localStorage.setItem("insightflow_auth_token", "dev_session_active");
            window.location.href = "/dashboard";
          }}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-md text-sm font-medium transition-colors"
        >
          Sign In (Simulated)
        </button>
      </div>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginView />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/dashboard",
        element: <DashboardView />,
      },
      {
        path: "/chat",
        element: <ChatWorkspaceView />,
      },
      {
        path: "/catalog",
        element: <CatalogView />,
      },
      {
        path: "/alerts",
        element: <AlertsView />,
      },
      {
        path: "/settings",
        element: <SettingsView />,
      },
    ],
  },
]);
