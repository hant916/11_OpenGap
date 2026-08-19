# Two-Minute Demo Narrative (locked)

This script locks the demo narrative for the judged walkthrough. Live OpenAIRE
results remain authoritative; if a live number differs from the recorded
reference values below, present the live number and keep the same narrative.

## 0:00–0:20 — Problem

"Researchers can already search papers. The harder question is: *is there actually
a gap worth investigating?* That normally means jumping between papers, funded
projects, software and datasets."

## 0:20–0:40 — Product

"OpenGap turns one research topic into a potential, evidence-backed gap signal:
it scans OpenAIRE, normalizes the entity signals, runs a deterministic heuristic,
and shows you why — with the OpenAIRE records behind it."

Open https://11-open-gap.vercel.app/.

## 0:40–1:20 — AI Agent Governance (cautious funding signal)

Click the **AI Agent Governance** example.

Say: "This scan shows a cautious funding signal: publications strongly outnumber
directly matching project records. The finding is deliberately phrased as a
signal worth checking — not as proof that funding is missing. If OpenAIRE failed,
OpenGap would refuse to invent a finding."

Point to:

- the finding title;
- publications vs projects;
- the "why" bullets.

## 1:20–1:50 — Climate Adaptation (reuse-signal reading)

Click the **Climate Adaptation** example.

Say: "This topic shows the reuse-signal reading: publications vastly outweigh
reusable software and data outputs. OpenGap highlights that imbalance from the
measured signals and keeps the software/dataset evidence visible."

Point to:

- software and datasets counts vs publications;
- the evidence list (open one record to show it links to a real source).

## 1:50–2:00 — Quantum Computing (normal control) and close

Click the **Quantum Computing** example.

Say: "Quantum Computing runs through the same classifier as the normal control —
we read whatever it finds. The point is not that any of these results prove a gap;
OpenGap flags a measurable signal and shows you why, and you decide whether to
investigate."

Close: "OpenGap: find what's missing in research — and show the evidence."

## Demo safety

- Use only the three golden topics in the judged walkthrough.
- Open each result once before presenting to warm caches if allowed.
- Keep a screenshot backup of each topic.
- If live API fails, state it explicitly; do not silently switch to fixture data.
- Never present the demo fixtures as live OpenAIRE data.
