# Hackathon Form Answer Drafts

Adapt field names to the official submission form/template.

## Project title

**OpenGap**

## Tagline

**Find what's missing in research — and show the evidence.**

## Primary theme

**Theme B — Build**

## Problem / question

Researchers can search for publications, but deciding whether a topic contains a research gap often requires manually comparing publications, projects, software and datasets. OpenGap asks whether OpenAIRE can turn those records into a transparent, evidence-backed hypothesis that helps a researcher decide what to investigate next.

## Solution

OpenGap is a minimal web app. The user enters a topic; OpenGap queries OpenAIRE for publications, projects, software and datasets, computes a recent publication trend, applies transparent deterministic heuristics, and returns at most one potential gap. Every finding includes the measured numbers, a short “why”, and representative OpenAIRE evidence records.

## What is novel/useful

OpenGap does not add another scholarly chatbot or search interface. It converts a topic into an inspectable decision signal while keeping the evidence visible. It deliberately avoids opaque AI scoring and does not let an LLM decide the gap.

## Intended audience

Researchers, PIs, lab leads and research engineers considering a new research direction or proposal angle.

## OpenAIRE usage

OpenGap uses OpenAIRE Graph research-product and project data to obtain publication, software, dataset and project counts plus representative evidence records. The provider boundary can also host the hackathon OpenAIRE MCP/Alien integration where available.

## Reuse

Others can reuse the OpenAIRE adapter, the small AnalysisResult schema, the documented gap heuristics, evidence-first UX pattern, and tests/fixtures.

## Limitations

The tool identifies potential signals, not scientific truth. Search counts depend on topic wording and metadata coverage. A detected gap does not prove novelty, societal value, fundability or commercial opportunity. Missing provider data is never treated as zero.

## License

Submission materials: CC BY 4.0.

## Links

- Live app: `<ADD DEPLOYED URL>`
- Source repository: `<ADD REPOSITORY URL>`
- Demo/video if applicable: `<ADD URL>`
