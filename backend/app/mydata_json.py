"""
Load frontend/src/data/mydata.json (same source as Procurement Search / BOM Explorer).
Used to ground /api/chat when SQLite drifts or ids differ.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MYDATA_PATH = _REPO_ROOT / "frontend" / "src" / "data" / "mydata.json"

_rows_cache: Optional[List[Dict[str, Any]]] = None


def _load_rows() -> List[Dict[str, Any]]:
    global _rows_cache
    if _rows_cache is not None:
        return _rows_cache
    if not MYDATA_PATH.is_file():
        _rows_cache = []
        return _rows_cache
    with open(MYDATA_PATH, encoding="utf-8") as f:
        _rows_cache = json.load(f)
    return _rows_cache


def name_from_sku(sku: str) -> str:
    if not sku:
        return "Unknown Material"
    parts = sku.split("-")
    middle = parts[2:-1] if len(parts) >= 4 else []
    if not middle:
        return sku
    return " ".join(p.capitalize() for p in middle)


def find_mydata_rows_for_message(user_message: str) -> List[Dict[str, Any]]:
    rows = _load_rows()
    if not rows:
        return []

    lower = user_message.lower()

    q_asc = re.search(r'["\']([^"\']{2,120})["\']', user_message)
    q_uni = re.search("\u201c([^\u201d]{2,120})\u201d", user_message)
    quoted = (q_uni or q_asc)
    if quoted:
        ph = quoted.group(1).strip().lower()
        out = []
        for r in rows:
            dn = name_from_sku(str(r.get("raw_material_sku", ""))).lower()
            if dn == ph or ph in dn or all(len(w) < 2 or w in dn for w in ph.split()):
                out.append(r)
        if out:
            return out

    by_mid: Dict[int, str] = {}
    for r in rows:
        mid = int(r["raw_material_id"])
        if mid not in by_mid:
            by_mid[mid] = name_from_sku(str(r.get("raw_material_sku", "")))

    hit_ids: List[int] = []
    for mid, disp in sorted(by_mid.items(), key=lambda x: -len(x[1])):
        d = disp.lower()
        if len(d) >= 4 and d in lower:
            hit_ids.append(mid)
    if hit_ids:
        hit_set = set(hit_ids)
        return [r for r in rows if int(r["raw_material_id"]) in hit_set]

    m = re.search(r"raw[_\s]?material[_\s]?id\s*[:#]?\s*(\d+)", user_message, re.I)
    if m:
        rid = int(m.group(1))
        return [r for r in rows if int(r["raw_material_id"]) == rid]

    m2 = re.search(r"\bRM-C\d+-[a-z0-9-]+\b", user_message, re.I)
    if m2:
        target = m2.group(0).lower()
        return [r for r in rows if str(r.get("raw_material_sku", "")).lower() == target]

    return []


def format_mydata_context_block(user_message: str) -> str:
    rows = find_mydata_rows_for_message(user_message)
    if not rows:
        return ""

    seen: Dict[tuple, None] = {}
    uniq: List[Dict[str, Any]] = []
    for r in rows:
        k = (int(r["supplier_id"]), int(r["raw_material_id"]), str(r.get("raw_material_sku")))
        if k in seen:
            continue
        seen[k] = None
        uniq.append(r)

    lines: List[str] = [
        f"Matched {len(rows)} row(s) in mydata.json ({len(uniq)} distinct supplier–SKU pairs).",
    ]
    for r in uniq[:20]:
        sku = r.get("raw_material_sku", "")
        dn = name_from_sku(str(sku))
        lines.append(
            f"- supplier_name={r.get('supplier_name')!r}, supplier_id={r.get('supplier_id')}, "
            f"raw_material_id={r.get('raw_material_id')}, raw_material_sku={sku!r}, display_name={dn!r}, "
            f"bom_id={r.get('bom_id')}, company={r.get('company_name')!r}"
        )
    if len(uniq) > 20:
        lines.append(f"(+ {len(uniq) - 20} more pairs omitted)")
    lines.append(
        "Do not invent suppliers or materials; only use names and ids listed above. "
        "This file has no unit price fields."
    )
    return "\n".join(lines)


def fallback_answer_from_mydata(user_message: str) -> Optional[str]:
    """Short deterministic answer when SQLite has no match but mydata.json does."""
    rows = find_mydata_rows_for_message(user_message)
    if not rows:
        return None

    sups: Dict[int, str] = {}
    skus: set[str] = set()
    for r in rows:
        sid = int(r["supplier_id"])
        sups[sid] = str(r.get("supplier_name", ""))
        skus.add(str(r.get("raw_material_sku", "")))

    sku_list = sorted(skus)
    dn = name_from_sku(sku_list[0]) if sku_list else "material"
    lines = [
        f"From mydata.json (same source as Procurement Search): for «{dn}», "
        f"these supplier_name values appear on relationship rows: "
        + ", ".join(f"{n} (supplier_id {i})" for i, n in sorted(sups.items()))
        + ".",
        "This file does not include currency pricing; it only lists relationships.",
    ]
    return " ".join(lines)
