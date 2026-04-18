import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ScoreBar } from "@/components/ScoreBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { procurementData } from "@/data/mockData";
import { Check, MapPin, Plus, X } from "lucide-react";

const SupplierIntelligence = () => {
  const materials = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    procurementData.forEach((r) => map.set(r.raw_material_id, { id: r.raw_material_id, name: r.raw_material_name }));
    return Array.from(map.values());
  }, []);

  const [materialId, setMaterialId] = useState<string>(materials[0].id);
  const suppliers = useMemo(
    () => procurementData.filter((r) => r.raw_material_id === materialId),
    [materialId],
  );
  const [selected, setSelected] = useState<string[]>(suppliers.slice(0, 2).map((s) => s.supplier_id));

  const toggle = (id: string) => {
    setSelected((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < 4 ? [...cur, id] : cur);
  };

  const compareSet = suppliers.filter((s) => selected.includes(s.supplier_id));
  const bestCost = Math.min(...compareSet.map((s) => s.estimated_cost));
  const bestLead = Math.min(...compareSet.map((s) => s.lead_time_days));
  const bestRisk = Math.min(...compareSet.map((s) => s.risk_score));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supplier Intelligence"
        title="Supplier Network Visibility"
        subtitle="Compare suppliers across cost, lead time, risk, reliability, and geographic exposure."
        actions={
          <Select value={materialId} onValueChange={(v) => { setMaterialId(v); setSelected([]); }}>
            <SelectTrigger className="w-72 bg-secondary/40 border-border/60">
              <SelectValue placeholder="Select raw material" />
            </SelectTrigger>
            <SelectContent>
              {materials.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {/* Supplier list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {suppliers.map((s) => {
          const active = selected.includes(s.supplier_id);
          return (
            <div
              key={s.supplier_id}
              className={`rounded-xl border p-5 transition-all cursor-pointer ${
                active ? "border-primary/50 bg-primary/5 shadow-elegant" : "border-border/60 bg-card hover:border-primary/30"
              }`}
              onClick={() => toggle(s.supplier_id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{s.supplier_name}</h3>
                    {active && <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Comparing</Badge>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />{s.region} · <span className="font-mono">{s.supplier_id}</span>
                  </div>
                </div>
                <div className={`h-7 w-7 rounded-md border flex items-center justify-center transition-colors ${
                  active ? "bg-primary border-primary text-primary-foreground" : "border-border bg-secondary/40 text-muted-foreground"
                }`}>
                  {active ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Cost</div>
                  <div className="font-display text-lg font-semibold mt-0.5">${s.estimated_cost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Lead Time</div>
                  <div className="font-display text-lg font-semibold mt-0.5">{s.lead_time_days}d</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk</div>
                  <div className="font-display text-lg font-semibold mt-0.5">{(s.risk_score * 100).toFixed(0)}</div>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex items-center gap-3"><span className="text-[11px] text-muted-foreground w-24">Reliability</span><ScoreBar value={s.reliability_score} variant="positive" className="flex-1" /></div>
                <div className="flex items-center gap-3"><span className="text-[11px] text-muted-foreground w-24">Availability</span><ScoreBar value={s.availability_score} variant="positive" className="flex-1" /></div>
                <div className="flex items-center gap-3"><span className="text-[11px] text-muted-foreground w-24">Sustainability</span><ScoreBar value={s.sustainability_score} variant="positive" className="flex-1" /></div>
              </div>

              <div className="flex flex-wrap gap-1 mt-4">
                {s.certifications.map((c) => (
                  <Badge key={c} variant="outline" className="border-border/60 bg-secondary/40 text-[10px]">{c}</Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison panel */}
      {compareSet.length >= 2 && (
        <div className="rounded-xl border border-primary/30 bg-card shadow-elegant overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-primary">Side-by-Side Analysis</div>
              <h3 className="font-display text-lg font-semibold mt-1">Comparing {compareSet.length} suppliers</h3>
            </div>
            <Button variant="outline" size="sm" className="border-border/60" onClick={() => setSelected([])}>
              <X className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary/30">
                <tr>
                  <th className="text-left font-medium px-6 py-3">Metric</th>
                  {compareSet.map((s) => (
                    <th key={s.supplier_id} className="text-left font-medium px-4 py-3">{s.supplier_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Region", key: (s: any) => s.region },
                  { label: "Cost / unit", key: (s: any) => `$${s.estimated_cost.toFixed(2)}`, best: (s: any) => s.estimated_cost === bestCost },
                  { label: "Lead time", key: (s: any) => `${s.lead_time_days}d`, best: (s: any) => s.lead_time_days === bestLead },
                  { label: "Risk score", key: (s: any) => (s.risk_score * 100).toFixed(0), best: (s: any) => s.risk_score === bestRisk },
                  { label: "Reliability", key: (s: any) => `${(s.reliability_score * 100).toFixed(0)}%` },
                  { label: "Availability", key: (s: any) => `${(s.availability_score * 100).toFixed(0)}%` },
                  { label: "Sustainability", key: (s: any) => `${(s.sustainability_score * 100).toFixed(0)}%` },
                  { label: "Certifications", key: (s: any) => s.certifications.join(", ") || "—" },
                ].map((row) => (
                  <tr key={row.label} className="border-t border-border/40">
                    <td className="px-6 py-3 text-muted-foreground text-xs uppercase tracking-wider">{row.label}</td>
                    {compareSet.map((s) => {
                      const isBest = row.best?.(s);
                      return (
                        <td key={s.supplier_id} className="px-4 py-3">
                          <span className={isBest ? "inline-flex items-center gap-1.5 text-success font-semibold" : ""}>
                            {row.key(s)}
                            {isBest && <Badge className="bg-success/15 text-success border-success/30 text-[9px] px-1.5 py-0">Best</Badge>}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent border-t border-border/60">
            <div className="text-[11px] uppercase tracking-[0.18em] text-primary mb-1">AI Recommendation</div>
            <p className="text-sm text-foreground/90">
              Based on a balanced cost/risk profile, <b>{compareSet.find((s) => s.risk_score === bestRisk)?.supplier_name}</b> is the recommended primary supplier; consider <b>{compareSet.find((s) => s.estimated_cost === bestCost)?.supplier_name}</b> as a cost-optimized secondary source for diversification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierIntelligence;
