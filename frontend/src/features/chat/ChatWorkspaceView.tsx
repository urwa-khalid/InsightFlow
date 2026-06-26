import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  Send, Database, Sparkles, Terminal, Copy, Check, Play,
  ChevronDown, ChevronUp, AlertCircle, Bot, User, RefreshCw
} from "lucide-react";

// Types
interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  sql?: string;
  chartData?: Array<any>;
  chartConfig?: { type: string; xKey: string; yKeys: string[] };
}

interface AgentLog {
  timestamp: string;
  level: "INFO" | "DEBUG" | "SUCCESS" | "WARNING";
  node: string;
  message: string;
}

// Suggested Prompts mock list
const suggestedPrompts = [
  { text: "Why did revenue decrease last month?", sub: "Trigger diagnostic RCA agent" },
  { text: "Forecast next quarter's active signups", sub: "Prophet forecasting pipeline" },
  { text: "List top 5 underperforming products", sub: "Run descriptive SQL agent" }
];

// Mock database metrics for chart rendering simulation
const mockWeeklySales = [
  { name: "W1", sales: 12000 },
  { name: "W2", sales: 19000 },
  { name: "W3", sales: 15000 },
  { name: "W4", sales: 24000 },
  { name: "W5", sales: 28000 },
  { name: "W6", sales: 31000 },
];

export const ChatWorkspaceView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "assistant",
      text: "Welcome to InsightFlow AI Workspace. I am your collaborative analytics agent. Ask me any business intelligence questions, and I will write safe SQL queries, run diagnostics, or compile forecasts.",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<"canvas" | "telemetry">("canvas");
  const [expandedSqlId, setExpandedSqlId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<AgentLog[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat and telemetry views
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [telemetryLogs]);

  // Simulate copy to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simulate LangGraph Agent Team Execution
  const triggerAgentRun = async (queryText: string) => {
    setIsStreaming(true);
    setActiveTab("telemetry");
    setTelemetryLogs([]);
    
    const logs: AgentLog[] = [];
    const addLog = (level: "INFO" | "DEBUG" | "SUCCESS" | "WARNING", node: string, msg: string) => {
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level,
        node,
        message: msg
      });
      setTelemetryLogs([...logs]);
    };

    // Step 1: Supervisor Classification
    setActiveNode("supervisor");
    addLog("INFO", "supervisor_node", `Classifying query: "${queryText}"`);
    await new Promise((r) => setTimeout(r, 1200));

    // Step 2: Context Schema Retrieval
    setActiveNode("retrieber");
    addLog("INFO", "retrieve_schema_node", "Querying pgvector semantic metrics index...");
    await new Promise((r) => setTimeout(r, 800));
    addLog("DEBUG", "retrieve_schema_node", "Matched tables: [fact_sales, dim_products] (Cosine: 0.89)");
    await new Promise((r) => setTimeout(r, 600));

    // Step 3: SQL Generation
    setActiveNode("sql_agent");
    addLog("INFO", "sql_generation_node", "Prompting Qwen3 SQL Agent utilizing schema mappings...");
    await new Promise((r) => setTimeout(r, 1400));
    const generatedSQL = "SELECT DATE_TRUNC('week', sale_date) AS week, SUM(amount) AS sales FROM fact_sales GROUP BY 1 ORDER BY 1;";
    addLog("SUCCESS", "sql_generation_node", `Generated SQL Code:\n${generatedSQL}`);

    // Step 4: SQL Safety Validation
    setActiveNode("sql_validator");
    addLog("INFO", "sql_validator", "Running Abstract Syntax Tree (AST) validation check...");
    await new Promise((r) => setTimeout(r, 700));
    addLog("SUCCESS", "sql_validator", "Write validation check passed. Safe read-only SELECT confirmed.");

    // Step 5: DB Query Execution
    setActiveNode("exec");
    addLog("INFO", "db_executor", "Executing query against database Production_Redshift...");
    await new Promise((r) => setTimeout(r, 900));
    addLog("SUCCESS", "db_executor", "Retrieved 6 rows successfully. Row count matches query bounds.");

    // Step 6: Visualizations mapping
    setActiveNode("visualization");
    addLog("INFO", "visualization_agent", "Generating Shadcn / Recharts component layout wrapper...");
    await new Promise((r) => setTimeout(r, 800));

    // Finish Run & Output
    setActiveNode(null);
    setIsStreaming(false);
    setActiveTab("canvas");

    // Add assistant response message
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "assistant",
        text: `I have compiled the weekly sales statistics. The data showcases a robust growth trend over the 6-week window, peaking at $31,000 in week 6.`,
        sql: generatedSQL,
        chartData: mockWeeklySales,
        chartConfig: { type: "area", xKey: "name", yKeys: ["sales"] }
      }
    ]);
  };

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming) return;
    
    const userQuery = inputValue;
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), sender: "user", text: userQuery }
    ]);
    setInputValue("");
    triggerAgentRun(userQuery);
  };

  // Find the latest chart data to show on the Visualization Canvas tab
  const latestChartMessage = [...messages].reverse().find(m => m.chartData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* LEFT COLUMN: Chat Interface (ChatGPT / Claude Inspired) */}
      <div className="lg:col-span-6 bg-card border border-border rounded-lg flex flex-col justify-between overflow-hidden">
        
        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex space-x-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className="space-y-3 max-w-[85%]">
                  <div className={`p-4 rounded-lg text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-muted border border-border text-foreground"
                      : "backdrop-blur-md bg-card/45 border border-border border-l-2 border-l-primary"
                  }`}>
                    {msg.text}
                  </div>

                  {/* Inline Collapsible SQL Viewer */}
                  {msg.sql && (
                    <div className="bg-background border border-border rounded-md overflow-hidden">
                      <button 
                        onClick={() => setExpandedSqlId(expandedSqlId === msg.id ? null : msg.id)}
                        className="w-full px-4 py-2.5 flex justify-between items-center text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        <span className="flex items-center">
                          <Database className="h-3.5 w-3.5 mr-2 text-primary" /> SQL Generated Query
                        </span>
                        {expandedSqlId === msg.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      
                      {expandedSqlId === msg.id && (
                        <div className="border-t border-border p-4 space-y-3 bg-card/30">
                          <pre className="text-[11px] font-mono text-foreground overflow-x-auto p-3 bg-black/40 rounded border border-border/50">
                            {msg.sql}
                          </pre>
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleCopy(msg.id, msg.sql || "")}
                              className="px-3 py-1.5 bg-muted hover:bg-muted/70 rounded text-[10px] font-semibold text-foreground flex items-center transition-colors"
                            >
                              {copiedId === msg.id ? <Check className="h-3 w-3 mr-1.5 text-secondary" /> : <Copy className="h-3 w-3 mr-1.5" />}
                              Copy Query
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="h-8 w-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary" />
                  </div>
                )}
              </motion.div>
            ))}

            {isStreaming && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex space-x-3 justify-start"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 animate-spin">
                  <RefreshCw className="h-4 w-4 text-primary" />
                </div>
                <div className="p-4 rounded-lg bg-card/45 border border-border border-l-2 border-l-primary text-xs text-muted-foreground italic flex items-center space-x-2">
                  <span>LangGraph Agent team running diagnostics...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Suggested prompts grid & Input Panel */}
        <div className="p-6 border-t border-border bg-card/50 space-y-4">
          {messages.length === 1 && !isStreaming && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputValue(prompt.text);
                  }}
                  className="p-3 text-left bg-background border border-border hover:border-primary/50 rounded-md transition-all group"
                >
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{prompt.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{prompt.sub}</p>
                </button>
              ))}
            </div>
          )}

          {/* Chat Form Area */}
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me to forecast or diagnose metric deviations..."
              className="w-full bg-input border border-border rounded-md pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground transition-all duration-200"
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !inputValue.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary disabled:bg-muted text-primary-foreground disabled:text-muted-foreground rounded-md transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Workspaces (Canvas / Agent Telemetry) */}
      <div className="lg:col-span-6 flex flex-col space-y-6">
        
        {/* Tab Selection */}
        <div className="flex bg-card p-1.5 border border-border rounded-md self-start">
          <button 
            onClick={() => setActiveTab("canvas")}
            className={`px-4 py-2 rounded text-xs font-semibold tracking-tight transition-all ${
              activeTab === "canvas" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Visualization Canvas
          </button>
          <button 
            onClick={() => setActiveTab("telemetry")}
            className={`px-4 py-2 rounded text-xs font-semibold tracking-tight transition-all ${
              activeTab === "telemetry" ? "bg-background text-foreground shadow animate-pulse" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Agent Telemetry Graph
          </button>
        </div>

        {/* Tab Workspace Panels */}
        <div className="flex-1 bg-card border border-border rounded-lg p-6 overflow-hidden flex flex-col">
          
          {/* TAB 1: Visualization Canvas */}
          {activeTab === "canvas" && (
            <div className="flex-1 flex flex-col justify-between h-full">
              {latestChartMessage ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">Active Analytics Render</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Plotting values extracted from Redshift databases.</p>
                  </div>
                  <div className="h-[300px] w-full my-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={latestChartMessage.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="p-4 bg-background border border-border rounded-md text-xs text-muted-foreground italic flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" /> Visual layout recommended by Visualization Agent.
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-muted border border-border rounded-full">
                    <Database className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Canvas Ready</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Run queries or requests using the chat workspace to render charts and reports.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Agent Telemetry (LangGraph Visual Tracking + Log Stream) */}
          {activeTab === "telemetry" && (
            <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
              {/* Svg Graph representing LangGraph Nodes */}
              <div className="h-[200px] border border-border/50 bg-background/50 rounded-lg flex items-center justify-center p-4 relative">
                <div className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  LangGraph Active Workflow
                </div>
                
                <div className="flex items-center space-x-6">
                  {/* Supervisor Node */}
                  <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${
                    activeNode === "supervisor" 
                      ? "bg-primary/20 border-primary text-primary animate-pulse" 
                      : "bg-muted border-border text-muted-foreground"
                  }`}>
                    Supervisor
                  </div>
                  <span className="text-muted-foreground">→</span>
                  
                  {/* Retriever Node */}
                  <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${
                    activeNode === "retrieber" 
                      ? "bg-primary/20 border-primary text-primary animate-pulse" 
                      : "bg-muted border-border text-muted-foreground"
                  }`}>
                    Retriever
                  </div>
                  <span className="text-muted-foreground">→</span>

                  {/* SQL Generation Node */}
                  <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${
                    activeNode === "sql_agent" || activeNode === "sql_validator"
                      ? "bg-primary/20 border-primary text-primary animate-pulse" 
                      : "bg-muted border-border text-muted-foreground"
                  }`}>
                    SQL Agent
                  </div>
                  <span className="text-muted-foreground">→</span>

                  {/* Database execution node */}
                  <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${
                    activeNode === "exec" || activeNode === "visualization"
                      ? "bg-primary/20 border-primary text-primary animate-pulse" 
                      : "bg-muted border-border text-muted-foreground"
                  }`}>
                    Compiler
                  </div>
                </div>
              </div>

              {/* Streaming Terminal Log Console */}
              <div className="flex-1 mt-6 flex flex-col justify-between overflow-hidden bg-black/40 rounded-lg border border-border p-4 font-mono text-[11px] leading-relaxed">
                <div className="flex justify-between items-center border-b border-border pb-2 mb-3">
                  <span className="flex items-center text-xs font-semibold text-muted-foreground">
                    <Terminal className="h-3.5 w-3.5 mr-2 text-primary" /> Execution Shell logs
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {telemetryLogs.length === 0 ? (
                    <div className="text-muted-foreground italic">Awaiting agent execution run...</div>
                  ) : (
                    telemetryLogs.map((log, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <span className="text-muted-foreground">[{log.timestamp}]</span>
                        <span className={`font-bold ${
                          log.level === "SUCCESS" ? "text-secondary" : log.level === "WARNING" ? "text-warning" : "text-primary"
                        }`}>
                          {log.node}
                        </span>
                        <span className="text-foreground whitespace-pre-wrap">{log.message}</span>
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
