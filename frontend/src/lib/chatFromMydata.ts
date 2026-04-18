/**
 * Chat answers grounded only in mydata.json (via realData.ts).
 * Same source as Procurement Search & BOM Explorer — no mockData / no invented suppliers.
 */
import { nameFromSku, realRows, type RealRow } from "@/data/realData";

const STOP = new Set(
  "the and for with from this that these those what when where which who how why are was were been being not you any all can ask get our out use using per unit one two may its its a an or as at be by if in of on to up we he she it their they them".split(
    " ",
  ),
);

function expandTokens(raw: string): string[] {
  const cleaned = raw.toLowerCase().replace(/["'?!.,;:()[\]]/g, " ");
  const pieces: string[] = [];
  for (const w of cleaned.split(/\s+/)) {
    if (w.length < 2) continue;
    pieces.push(w);
    if (w.includes("-")) {
      for (const part of w.split("-")) {
        if (part.length >= 3) pieces.push(part);
      }
    }
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of pieces) {
    if (STOP.has(t)) continue;
    if (t.length === 2 && !/^\d{2}$/.test(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function uniqueMaterialNames(): Map<number, string> {
  const m = new Map<number, string>();
  for (const r of realRows) {
    if (!m.has(r.raw_material_id)) {
      m.set(r.raw_material_id, nameFromSku(r.raw_material_sku));
    }
  }
  return m;
}

/** Find rows whose material is mentioned in the user message (quoted name, phrase in text, SKU, or tokens). */
export function findRealRowsForMessage(message: string): RealRow[] {
  const lower = message.toLowerCase().trim();

  const unicodeQuoted = message.match(/\u201c([^\u201d]{2,120})\u201d/);
  const asciiQuoted = message.match(/["']([^"']{2,120})["']/);
  const quoted = (unicodeQuoted?.[1] ?? asciiQuoted?.[1])?.trim() ?? "";
  if (quoted.length > 0) {
    const ph = quoted.toLowerCase();
    return realRows.filter((r) => {
      const dn = nameFromSku(r.raw_material_sku).toLowerCase();
      return (
        dn === ph ||
        dn.includes(ph) ||
        ph.split(/\s+/).every((w) => w.length < 2 || dn.includes(w))
      );
    });
  }

  const idMatch = message.match(/\braw[_\s]?material[_\s]?id\s*[:#]?\s*(\d+)\b/i);
  if (idMatch) {
    const id = parseInt(idMatch[1], 10);
    return realRows.filter((r) => r.raw_material_id === id);
  }

  const rmSku = message.match(/\bRM-C\d+-[a-z0-9-]+\b/i);
  if (rmSku) {
    const target = rmSku[0].toLowerCase();
    return realRows.filter((r) => r.raw_material_sku.toLowerCase() === target);
  }

  const mats = uniqueMaterialNames();
  const byLongestName = [...mats.entries()].sort((a, b) => b[1].length - a[1].length);
  const midHits = new Set<number>();
  for (const [mid, display] of byLongestName) {
    const d = display.toLowerCase();
    if (d.length >= 4 && lower.includes(d)) midHits.add(mid);
  }
  if (midHits.size > 0) {
    return realRows.filter((r) => midHits.has(r.raw_material_id));
  }

  const sig = expandTokens(message).filter((t) => t.length >= 3);
  if (sig.length === 0) return [];
  return realRows.filter((r) => {
    const dn = nameFromSku(r.raw_material_sku).toLowerCase();
    const sku = r.raw_material_sku.toLowerCase();
    return sig.every((t) => dn.includes(t) || sku.includes(t.replace(/\s+/g, "-")));
  });
}

function isLowestPriceOrCostQuestion(message: string): boolean {
  const t = message.toLowerCase();
  if (
    /\b(cheaper|cheapest|lowest\s+(price|cost)|least\s+expensive|lower\s+price|cost\s+less|best\s+deal|reduce\s+cost|affordab)/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/(price|cost|cheap|expensive|\$)/i.test(t) && /(lower|cheap|least|save|afford|best)/i.test(t)) {
    return true;
  }
  if (
    /(which|what|who).{0,40}(supplier|vendors?)/i.test(t) &&
    /(price|cost|cheap|lower|sell|selling)/i.test(t)
  ) {
    return true;
  }
  return false;
}

function rowsSingleSourceReal(): RealRow[] {
  const suppliersByRm = new Map<number, Set<number>>();
  for (const r of realRows) {
    if (!suppliersByRm.has(r.raw_material_id)) suppliersByRm.set(r.raw_material_id, new Set());
    suppliersByRm.get(r.raw_material_id)!.add(r.supplier_id);
  }
  const single = new Set<number>();
  for (const [rm, sups] of suppliersByRm) {
    if (sups.size === 1) single.add(rm);
  }
  return realRows.filter((r) => single.has(r.raw_material_id));
}

function formatUniqSuppliers(rows: RealRow[]): string {
  const map = new Map<number, { name: string; id: number; skus: Set<string> }>();
  for (const r of rows) {
    const ex = map.get(r.supplier_id) ?? { name: r.supplier_name, id: r.supplier_id, skus: new Set<string>() };
    ex.skus.add(r.raw_material_sku);
    map.set(r.supplier_id, ex);
  }
  const lines = [...map.values()].map((s) => {
    const skuList = [...s.skus].slice(0, 3).join(", ");
    const more = s.skus.size > 3 ? ` (+${s.skus.size - 3} more SKU variants)` : "";
    return `- ${s.name} (supplier_id ${s.id}) — SKUs: ${skuList}${more}`;
  });
  return lines.join("\n");
}

/** Main entry — mydata.json only. */
export function answerFromMydataJson(message: string): string {
  if (isLowestPriceOrCostQuestion(message)) {
    return (
      "mydata.json does not contain unit prices, lead times, or currency fields — only relationship rows " +
        "(company, BOM, raw material SKU, supplier id/name). " +
        "I can’t rank suppliers by price from this file alone. " +
        "Use Procurement Search / BOM Explorer to inspect the same rows, or load pricing from your ERP."
    );
  }

  const rows = findRealRowsForMessage(message);

  if (rows.length === 0) {
    return (
      "No rows in mydata.json matched that question (same source as Procurement Search). " +
        "Try a material phrase that appears in a raw_material_sku (e.g. “soy lecithin”), a numeric raw_material_id, " +
        "or an RM-C… SKU pattern."
    );
  }

  const matNames = new Map<number, string>();
  for (const r of rows) {
    if (!matNames.has(r.raw_material_id)) matNames.set(r.raw_material_id, nameFromSku(r.raw_material_sku));
  }
  const matSummary = [...matNames.entries()]
    .map(([id, n]) => `"${n}" (raw_material_id ${id})`)
    .join(", ");

  const lines: string[] = [];
  lines.push(`Source: mydata.json — ${rows.length} relationship row(s) for material(s): ${matSummary}.`);
  lines.push("Suppliers listed for those rows (same data as Search / BOM):");

  if (/\b(who|which|supplier|suppliers|selling|sell|source|provides?)\b/i.test(message)) {
    lines.push(formatUniqSuppliers(rows));
  } else if (
    /single[\s-]?source|sole supplier|only one supplier|supplier concentration|dependency/i.test(message)
  ) {
    const risky = rowsSingleSourceReal();
    const ids = [...new Set(risky.map((r) => r.raw_material_id))].slice(0, 12);
    lines.push(
      `Materials that appear with only one distinct supplier_id in mydata.json (single-source in this file): ${ids.join(", ")}.`,
    );
  } else if (/\bsubstitut|alternativ|replace\b/i.test(message)) {
    lines.push(
      "Substitute options are not recorded in mydata.json — only supplier–material–BOM links. Check your formulation tools or another dataset for alternates.",
    );
  } else {
    lines.push(formatUniqSuppliers(rows));
  }

  return lines.join("\n\n");
}

/** Legacy export name used by api.ts */
export function localProcurementChatFallback(message: string): string {
  return answerFromMydataJson(message);
}
