import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardView } from "@/features/dashboard/DashboardView";
import { ChatWorkspaceView } from "@/features/chat/ChatWorkspaceView";


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
