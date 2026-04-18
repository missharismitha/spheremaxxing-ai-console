import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ScoreBar";
import { procurementData, type ProcurementRecord } from "@/data/mockData";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const filterChips = ["All", "Low Risk", "EU Only", "Lead < 14d", "High Reliability"];

const ProcurementSearch = () => {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("All");
  const [sortKey, setSortKey] = useState<string>("relevance");
  const [selected, setSelected] = useState<ProcurementRecord | null>(null);

  const results = useMemo(() => {
    let data = procurementData;
    if (query) {
      const q = query.toLowerCase();
      data = data.filter((r) =>
        [
          r.finished_product_name,
          r.finished_product_sku,
          r.bom_id,
          r.raw_material_name,
          r.raw_material_sku,
          r.supplier_name,
          r.supplier_id,
          r.region,
        ].join(" ").toLowerCase().includes(q),
      );
    }
    if (chip === "Low Risk") data = data.filter((r) => r.risk_score < 0.3);
    if (chip === "EU Only") data = data.filter((r) => ["Germany", "Netherlands", "Spain"].includes(r.region));
    if (chip === "Lead < 14d") data = data.filter((r) => r.lead_time_days < 14);
    if (chip === "High Reliability") data = data.filter((r) => r.reliability_score >= 0.9);

    if (sortKey === "cost") data = [...data].sort((a, b) => a.estimated_cost - b.estimated_cost);
    if (sortKey === "lead") data = [...data].sort((a, b) => a.lead_time_days - b.lead_time_days);
    if (sortKey === "risk") data = [...data].sort((a, b) => a.risk_score - b.risk_score);
    if (sortKey === "reliability") data = [...data].sort((a, b) => b.reliability_score - a.reliability_score);

    return data;
  }, [query, chip, sortKey]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Procurement Search"
        title="Sourcing Intelligence Search"
        subtitle="Search across finished products, BOMs, raw materials, suppliers, and SKUs with AI-ranked sourcing options."
      />

      {/* Search bar */}
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-card">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product, BOM, material, supplier, SKU…"
              className="pl-10 h-12 text-base bg-secondary/40 border-border/60 focus-visible:ring-primary/40"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md hover:bg-secondary flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          <Select value={sortKey} onValueChange={setSortKey}>
            <SelectTrigger className="lg:w-52 h-12 bg-secondary/40 border-border/60">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Sort: Relevance</SelectItem>
              <SelectItem value="cost">Sort: Cost (low→high)</SelectItem>
              <SelectItem value="lead">Sort: Lead time</SelectItem>
              <SelectItem value="risk">Sort: Risk (low→high)</SelectItem>
              <SelectItem value="reliability">Sort: Reliability</SelectItem>
            </SelectContent>
          </Select>

          <Button className="h-12 px-6 bg-gradient-primary text-primary-foreground">
            Run AI Search
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {filterChips.map((c) => (
            <button
              key={c}
              onClick={() => setChip(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                chip === c
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground self-center">
            {results.length} results
          </span>
        </div>
      </div>

      {/* Results table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary/30">
              <tr>
                <th className="text-left font-medium px-5 py-3">Finished Product / BOM</th>
                <th className="text-left font-medium px-3 py-3">Raw Material</th>
                <th className="text-left font-medium px-3 py-3">Supplier</th>
                <th className="text-left font-medium px-3 py-3">Region</th>
                <th className="text-right font-medium px-3 py-3">Cost</th>
                <th className="text-right font-medium px-3 py-3">Lead</th>
                <th className="text-left font-medium px-3 py-3">Availability</th>
                <th className="text-left font-medium px-3 py-3">Risk</th>
                <th className="text-left font-medium px-5 py-3">Reliability</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr
                  key={i}
                  onClick={() => setSelected(r)}
                  className="data-row border-t border-border/40 cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium">{r.finished_product_name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {r.bom_id} · {r.finished_product_sku}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-foreground/90">{r.raw_material_name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{r.raw_material_sku}</div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="font-medium">{r.supplier_name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{r.supplier_id}</div>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">{r.region}</td>
                  <td className="px-3 py-4 text-right font-mono tabular-nums">${r.estimated_cost.toFixed(2)}</td>
                  <td className="px-3 py-4 text-right tabular-nums text-muted-foreground">{r.lead_time_days}d</td>
                  <td className="px-3 py-4"><ScoreBar value={r.availability_score} variant="positive" /></td>
                  <td className="px-3 py-4"><ScoreBar value={r.risk_score} variant="risk" /></td>
                  <td className="px-5 py-4"><ScoreBar value={r.reliability_score} variant="positive" /></td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr><td colSpan={9} className="text-center text-muted-foreground py-12 text-sm">No results match your query.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card border-border/60">
          {selected && (
            <>
              <SheetHeader>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Sourcing Path</div>
                <SheetTitle className="font-display text-2xl">{selected.finished_product_name}</SheetTitle>
                <div className="text-xs text-muted-foreground font-mono">{selected.bom_id} · {selected.finished_product_sku}</div>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {[
                  ["Estimated Cost", `$${selected.estimated_cost.toFixed(2)}`],
                  ["Lead Time", `${selected.lead_time_days} days`],
                  ["Region", selected.region],
                  ["Supplier ID", selected.supplier_id],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-secondary/40 border border-border/60 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                    <div className="text-sm font-medium mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-semibold">Score Profile</h4>
                {[
                  ["Availability", selected.availability_score, "positive"],
                  ["Reliability", selected.reliability_score, "positive"],
                  ["Sustainability", selected.sustainability_score, "positive"],
                  ["Risk Exposure", selected.risk_score, "risk"],
                ].map(([label, v, variant]) => (
                  <div key={label as string} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground w-32">{label as string}</span>
                    <ScoreBar value={v as number} variant={variant as "positive" | "risk"} className="flex-1" />
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selected.certifications.map((c) => (
                    <Badge key={c} variant="outline" className="border-border/60 bg-secondary/40 text-[10px]">{c}</Badge>
                  ))}
                </div>
              </div>

              {selected.substitute_options.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-2">AI Substitute Options</h4>
                  <div className="space-y-2">
                    {selected.substitute_options.map((s) => (
                      <div key={s.name} className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{s.name}</div>
                          <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
                            {(s.compatibility_score * 100).toFixed(0)}% match
                          </Badge>
                        </div>
                        <div className="flex gap-3 mt-2 text-[11px] text-muted-foreground">
                          <span>Cost: <b className="text-foreground">{s.cost_impact}</b></span>
                          <span>Risk: <b className="text-foreground">{s.risk_impact}</b></span>
                          <span>Lead: <b className="text-foreground">{s.lead_time_impact}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <Button className="flex-1 bg-gradient-primary text-primary-foreground">Add to Sourcing Plan</Button>
                <Button variant="outline" className="border-border/60">Compare</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProcurementSearch;
