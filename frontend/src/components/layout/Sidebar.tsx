import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquareCode, Database, AlertCircle, Settings, LogOut } from "lucide-react";

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "AI Analyst", path: "/chat", icon: MessageSquareCode },
    { name: "Catalog", path: "/catalog", icon: Database },
    { name: "Anomaly Alerts", path: "/alerts", icon: AlertCircle },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("insightflow_auth_token");
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col justify-between h-screen fixed left-0 top-0 z-20">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            InsightFlow
          </span>
          <span className="ml-2 text-[10px] uppercase font-semibold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded border border-secondary/20">
            AI-BI
          </span>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-4 w-4 transition-colors ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / User controls */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors group"
        >
          <LogOut className="h-4 w-4 text-destructive" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
