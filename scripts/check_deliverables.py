#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
required = [
    "README.md",
    "LICENSE.md",
    "docs/00-product-brief.md",
    "docs/02-mvp-scope.md",
    "docs/07-gap-detection-rules.md",
    "docs/10-48h-delivery-plan.md",
    "docs/12-definition-of-done.md",
    "submission/story-1-2-page.md",
    "submission/form-answers.md",
    "submission/demo-script-3min.md",
    "submission/final-submission-checklist.md",
    "schemas/analysis-result.schema.json",
    "schemas/analysis-result.fixture.json",
]
missing = [p for p in required if not (ROOT/p).exists()]
if missing:
    print("Missing deliverables:")
    for p in missing: print("-", p)
    sys.exit(1)
print("OK: required impl-pack deliverables exist")
