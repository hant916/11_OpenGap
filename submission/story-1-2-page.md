# OpenGap — Turning a Research Idea into an Evidence-Backed Hypothesis

## The question

Researchers often begin with an intuition: *this topic feels important, but is there actually a gap worth investigating?* Answering that question usually means moving between scholarly search, project databases, software/data repositories and manual comparison. Search tools are good at returning records; they are less useful at turning the distribution of those records into a compact, inspectable research hypothesis.

OpenGap asks a narrower question:

> **Can OpenAIRE help a researcher quickly detect a potential gap in a topic — and show exactly why the tool thinks the gap may exist?**

## What we built

OpenGap is a small evidence-first web application. A user enters a research topic. The application queries OpenAIRE for four simple signals:

- publications;
- funded projects;
- software;
- datasets.

It also checks a recent publication trend. A deterministic rule engine then produces at most one primary finding, such as a **potential translation gap** when research publication activity is materially larger than reusable software/data output.

The tool deliberately avoids an opaque “AI opportunity score”. Instead, every finding includes:

1. the measured counts;
2. up to three human-readable reasons derived from those counts;
3. representative OpenAIRE records that can be inspected directly.

An optional baseline topic helps users understand whether a ratio is unusual rather than treating an isolated number as meaningful.

## The journey

The product flow is intentionally short:

```text
IDEA → ANALYZE → POTENTIAL GAP → WHY → EVIDENCE → REFINE
```

For example, a researcher exploring **AI Agent Governance** can ask OpenGap to inspect the topic. Rather than returning a long paper list, OpenGap summarizes the balance between research output, projects and reusable technical artifacts. If the heuristic fires, the user sees a potential gap, the exact numbers behind it, and representative OpenAIRE evidence. The user can then refine the topic or compare it with an adjacent field.

The core decision is not delegated to a language model. Gap detection is deterministic and documented. This keeps the methodology inspectable and reproducible. AI can optionally help with minor wording or topic suggestions, but it cannot create the underlying finding.

## The insight

The useful shift is from **search result** to **research hypothesis**.

A count such as “3 datasets” means little by itself. It becomes more useful when placed next to publication volume, project activity, trend and a comparison field — and when the underlying records remain visible.

OpenGap does not claim that a low software/dataset ratio proves scientific novelty or that a field deserves funding. It identifies a **signal worth investigating**. That limitation is part of the product: the output remains a transparent shortcut for human judgment rather than pretending to replace it.

## What others can reuse

The project is intentionally small and reusable:

- a compact OpenAIRE data adapter;
- a stable `AnalysisResult` contract;
- transparent gap-detection heuristics;
- an evidence-first UX pattern;
- fixture-based tests showing how to validate the logic without fabricating live data.

The same pattern could later support other research questions — for example, comparing translation from publications to datasets/software, monitoring a research field over time, or helping teams narrow a proposal topic — without requiring a new graph database or large AI stack.

## Why OpenAIRE

OpenAIRE is what makes the artifact practical: one open scholarly graph exposes research products and projects with stable metadata and identifiers. The Graph API can return both total matches and representative records, which lets OpenGap keep the experience fast while retaining evidence traceability.

**OpenGap: Find what's missing in research — and show the evidence.**
