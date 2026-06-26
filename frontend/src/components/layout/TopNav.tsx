import React from "react";
import { Search, Bell, Database } from "lucide-react";

export const TopNav: React.FC = () => {
  return (
    <header className="h-16 bg-background/50 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      {/* Search Input Bar */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search dashboards, metrics, databases... (Cmd + K)"
          className="w-full bg-input border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder-muted-foreground transition-all duration-200"
        />
      </div>

      {/* Quick Status / Notifications */}
      <div className="flex items-center space-x-6">
        {/* Connection status card */}
        <div className="flex items-center space-x-2 bg-card border border-border px-3 py-1.5 rounded-full text-xs font-medium">
          <Database className="h-3 w.5 text-secondary animate-pulse" />
          <span className="text-muted-foreground">Warehouse:</span>
          <span className="text-foreground">Prod_Redshift</span>
        </div>

        {/* Alerts count */}
        <button className="relative p-1.5 hover:bg-card border border-transparent hover:border-border rounded-full transition-all">
          <Bell className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-destructive rounded-full" />
        </button>

        {/* Profile Pill */}
        <div className="flex items-center space-x-2 border-l border-border pl-6">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground shadow-sm shadow-primary/20">
            SC
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-medium text-foreground">Sarah Chen</p>
            <p className="text-[10px] text-muted-foreground">Admin @ Acme</p>
          </div>
        </div>
      </div>
    </header>
  );
};
