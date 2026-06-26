import React from "react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Sparkles, AlertTriangle, 
  ArrowUpRight, Users, DollarSign, Percent, Calendar 
} from "lucide-react";

// Mock data representing Sales/Revenue trend
const revenueData = [
  { name: "Jan", revenue: 65000, margin: 42000 },
  { name: "Feb", revenue: 78000, margin: 51000 },
  { name: "Mar", revenue: 72000, margin: 48000 },
  { name: "Apr", revenue: 89000, margin: 61000 },
  { name: "May", revenue: 95000, margin: 67000 },
  { name: "Jun", revenue: 120000, margin: 85000 },
];

// Mock data representing Customer metrics
const customerData = [
  { name: "W1", active: 8200, churned: 120 },
  { name: "W2", active: 8900, churned: 95 },
  { name: "W3", active: 9400, churned: 110 },
  { name: "W4", active: 10200, churned: 80 },
  { name: "W5", active: 11100, churned: 130 },
  { name: "W6", active: 12450, churned: 90 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export const DashboardView: React.FC = () => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
            Executive Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time business performance metrics powered by InsightFlow AI agents.
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-card border border-border px-4 py-2 rounded-md">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Jan 1, 2026 - Jun 26, 2026</span>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <motion.div 
          variants={itemVariants} 
          className="p-6 bg-card border border-border rounded-lg relative overflow-hidden group hover:border-primary/50 transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total ARR</p>
              <p className="text-3xl font-semibold tracking-tight mt-2 text-foreground">$1,284,500</p>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-md border border-primary/20">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 text-xs font-medium">
            <span className="flex items-center text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full border border-secondary/20">
              <TrendingUp className="h-3 w-3 mr-1" /> +14.2%
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </motion.div>

        {/* Customer Growth Card */}
        <motion.div 
          variants={itemVariants} 
          className="p-6 bg-card border border-border rounded-lg relative overflow-hidden group hover:border-secondary/50 transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-secondary to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
              <p className="text-3xl font-semibold tracking-tight mt-2 text-foreground">12,450</p>
            </div>
            <div className="p-2.5 bg-secondary/10 rounded-md border border-secondary/20">
              <Users className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 text-xs font-medium">
            <span className="flex items-center text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full border border-secondary/20">
              <TrendingUp className="h-3 w-3 mr-1" /> +8.6%
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </motion.div>

        {/* Conversion Rate Card */}
        <motion.div 
          variants={itemVariants} 
          className="p-6 bg-card border border-border rounded-lg relative overflow-hidden group hover:border-destructive/50 transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-destructive to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Checkout Conversion</p>
              <p className="text-3xl font-semibold tracking-tight mt-2 text-foreground">3.42%</p>
            </div>
            <div className="p-2.5 bg-destructive/10 rounded-md border border-destructive/20">
              <Percent className="h-5 w-5 text-destructive" />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 text-xs font-medium">
            <span className="flex items-center text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full border border-destructive/20">
              <TrendingDown className="h-3 w-3 mr-1" /> -0.12%
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </motion.div>
      </div>

      {/* Main Charts & Analytics panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Performance Area Chart */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-8 bg-card border border-border rounded-lg p-6 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Revenue Trends</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Historical revenue and margins breakdown.</p>
            </div>
            <span className="text-xs text-secondary bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full font-medium flex items-center">
              <Sparkles className="h-3 w-3 mr-1" /> AI Synced
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Forecast / Predictions side panel */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 bg-card border border-border rounded-lg p-6 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-primary" /> Q3 Projections
            </h3>
            <p className="text-xs text-muted-foreground">
              Prophet-based univariate forecast running over 180 days of historical data.
            </p>
            <div className="bg-background border border-border p-4 rounded-md space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Target Prediction</span>
                <span className="text-sm font-semibold text-foreground">$145,000</span>
              </div>
              <div className="flex justify-between items-center border-t border-border/50 pt-2">
                <span className="text-xs text-muted-foreground">Confidence bounds</span>
                <span className="text-xs text-muted-foreground font-medium">$138K - $152K</span>
              </div>
              <div className="flex justify-between items-center border-t border-border/50 pt-2">
                <span className="text-xs text-muted-foreground">Model Accuracy</span>
                <span className="text-xs text-secondary font-medium">94.8% MAPE</span>
              </div>
            </div>
          </div>
          <button className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-2.5 rounded-md text-xs font-semibold mt-4 transition-colors flex items-center justify-center">
            Run What-If Scenario <ArrowUpRight className="h-3 w-3 ml-1.5" />
          </button>
        </motion.div>
      </div>

      {/* Customer Growth & Recent Insights section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer Growth Chart */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-6 bg-card border border-border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold tracking-tight mb-4">Customer Acquisition vs Churn</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                />
                <Bar dataKey="active" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Insights & Anomalies panel */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-6 bg-card border border-border rounded-lg p-6 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-destructive" /> Active Anomaly Alerts
            </h3>
            <div className="space-y-3">
              {[
                {
                  metric: "Revenue dip in EU mobile",
                  change: "-32% vs expected",
                  details: "Caused by Android mobile checkout error in Germany.",
                  level: "severe",
                },
                {
                  metric: "Signups surge in US",
                  change: "+45% vs expected",
                  details: "Correlated with ProductLaunch marketing campaign.",
                  level: "positive",
                }
              ].map((insight, i) => (
                <div key={i} className="p-4 bg-background border border-border rounded-md flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">{insight.metric}</p>
                    <p className="text-[11px] text-muted-foreground">{insight.details}</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                    insight.level === "severe" 
                      ? "text-destructive bg-destructive/10 border-destructive/20" 
                      : "text-secondary bg-secondary/10 border-secondary/20"
                  }`}>
                    {insight.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full border border-border hover:bg-muted py-2.5 rounded-md text-xs font-semibold mt-4 transition-colors">
            View All Diagnostics Logs
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
