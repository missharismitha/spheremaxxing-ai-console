// API placeholder layer — swap mock returns with real fetch calls when backend is ready.
import { procurementData, allSuppliers, allRawMaterials, dashboardMetrics } from "@/data/mockData";

export async function fetchProcurementRecords(query?: string) {
  // TODO: replace with `await fetch('/api/procurement?q=...')`
  await new Promise((r) => setTimeout(r, 120));
  if (!query) return procurementData;
  const q = query.toLowerCase();
  return procurementData.filter((r) =>
    [
      r.finished_product_name,
      r.finished_product_sku,
      r.bom_id,
      r.raw_material_name,
      r.raw_material_sku,
      r.supplier_name,
      r.supplier_id,
      r.region,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export async function fetchSuppliers() {
  await new Promise((r) => setTimeout(r, 80));
  return allSuppliers;
}

export async function fetchRawMaterials() {
  await new Promise((r) => setTimeout(r, 80));
  return allRawMaterials;
}

export async function fetchDashboardMetrics() {
  await new Promise((r) => setTimeout(r, 60));
  return dashboardMetrics;
}
