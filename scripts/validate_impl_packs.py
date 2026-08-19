#!/usr/bin/env python3
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TASK_DIR = ROOT / "sdd" / "task-dir"
errors = []
seen_seq = set()

required_top = ["schema_version","identity","scheduling","human_pressure","machine_core","judge","execution_policy"]
required_mc = ["goal","red_lines","invariants","contracts","failure_semantics","complexity_budget","files","steps","acceptance","validate"]

for path in sorted(TASK_DIR.glob("*.todo.json")):
    try:
        obj = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{path.name}: invalid JSON: {exc}")
        continue
    for key in required_top:
        if key not in obj:
            errors.append(f"{path.name}: missing top-level {key}")
    if obj.get("schema_version") != "impl-pack.v3.convergence":
        errors.append(f"{path.name}: wrong schema_version")
    ident = obj.get("identity", {})
    seq = ident.get("sequence")
    slug = ident.get("slug")
    if seq in seen_seq:
        errors.append(f"{path.name}: duplicate sequence {seq}")
    seen_seq.add(seq)
    if not isinstance(seq, int) or not isinstance(slug, str):
        errors.append(f"{path.name}: invalid identity sequence/slug")
    elif ident.get("id") != f"{seq:04d}.{slug}":
        errors.append(f"{path.name}: identity.id mismatch")
    mc = obj.get("machine_core", {})
    for key in required_mc:
        if key not in mc:
            errors.append(f"{path.name}: missing machine_core.{key}")
    if not isinstance(mc.get("goal"), str) or not mc.get("goal", "").strip():
        errors.append(f"{path.name}: empty machine_core.goal")
    hp = obj.get("human_pressure", {})
    if not isinstance(hp.get("one_screen_brief"), str) or not hp.get("one_screen_brief", "").strip():
        errors.append(f"{path.name}: empty human_pressure.one_screen_brief")
    judge = obj.get("judge", {})
    if not isinstance(judge.get("must_check"), list) or not isinstance(judge.get("reject_if"), list):
        errors.append(f"{path.name}: judge arrays missing")

if len(list(TASK_DIR.glob("*.todo.json"))) != 12:
    errors.append("expected exactly 12 todo packs")

if errors:
    print("FAIL")
    for e in errors:
        print("-", e)
    sys.exit(1)
print(f"OK: {len(list(TASK_DIR.glob('*.todo.json')))} impl packs validated")
