import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import {
  Users,
  Boxes,
  FileStack,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { dashboardMetrics, supplierTrend, aiInsights, procurementData } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const m = dashboardMetrics;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations Overview"
        title="Procurement Intelligence Dashboard"
        subtitle="Real-time visibility across your supplier network, BOM portfolio, and AI sourcing recommendations."
        actions={
          <>
            <Button variant="outline" size="sm" className="border-border/60">Export</Button>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground" asChild>
              <Link to="/app/search">
                New Sourcing Run <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </>
        }
      />

      {/* Metric grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="Active Suppliers" value={m.active_suppliers.toLocaleString()} delta="+4.2%" trend="up" icon={Users} accent="primary" />
        <MetricCard label="Raw Materials Tracked" value={m.raw_materials_tracked.toLocaleString()} delta="+128" trend="up" icon={Boxes} accent="accent" />
        <MetricCard label="BOMs Evaluated" value={m.boms_evaluated} delta="+12" trend="up" icon={FileStack} accent="primary" />
        <MetricCard label="AI Recommendations" value={m.ai_recommendations.toLocaleString()} delta="+18%" trend="up" icon={Sparkles} accent="accent" />
        <MetricCard label="Risk Alerts" value={m.risk_alerts} delta="-3" trend="up" icon={AlertTriangle} accent="warning" />
        <MetricCard label="Cost Opportunities" value={`$${m.cost_opportunities * 12}K`} delta="+$22K" trend="up" icon={TrendingDown} accent="success" />
      </div>

      {/* Trend + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-6 shadow-card">
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Sourcing Performance</div>
              <h3 className="font-display text-lg font-semibold mt-1">Average Cost & Risk · Last 8 months</h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="status-dot bg-primary" />Avg Unit Cost</span>
              <span className="inline-flex items-center gap-1.5"><span className="status-dot bg-accent" />Risk Index</span>
            </div>
          </div>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={supplierTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="risk" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">AI Engine</div>
              <h3 className="font-display text-lg font-semibold mt-1">Live Insights</h3>
            </div>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px]">
              v2.4
            </Badge>
          </div>
          <div className="space-y-3">
            {aiInsights.slice(0, 4).map((i) => {
              const dot =
                i.severity === "warning" ? "bg-warning" : i.severity === "success" ? "bg-success" : "bg-primary";
              return (
                <div key={i.id} className="flex gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <span className={`status-dot mt-1.5 ${dot}`} />
                  <p className="text-xs leading-relaxed text-foreground/90">{i.text}</p>
                </div>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-4 text-primary hover:text-primary" asChild>
            <Link to="/app/decisions">Open Decision Support <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-border/60 bg-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Recent Sourcing Activity</div>
            <h3 className="font-display text-lg font-semibold mt-1">Latest BOM Evaluations</h3>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/search">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary/30">
              <tr>
                <th className="text-left font-medium px-6 py-3">BOM</th>
                <th className="text-left font-medium px-4 py-3">Finished Product</th>
                <th className="text-left font-medium px-4 py-3">Material</th>
                <th className="text-left font-medium px-4 py-3">Supplier</th>
                <th className="text-left font-medium px-4 py-3">Region</th>
                <th className="text-right font-medium px-4 py-3">Cost</th>
                <th className="text-right font-medium px-6 py-3">Lead</th>
              </tr>
            </thead>
            <tbody>
              {procurementData.slice(0, 6).map((r, i) => (
                <tr key={i} className="data-row border-t border-border/40">
                  <td className="px-6 py-3 font-mono text-xs text-primary">{r.bom_id}</td>
                  <td className="px-4 py-3">{r.finished_product_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.raw_material_name}</td>
                  <td className="px-4 py-3 font-medium">{r.supplier_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.region}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">${r.estimated_cost.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{r.lead_time_days}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
