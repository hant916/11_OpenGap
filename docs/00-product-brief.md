# Product Brief — OpenGap

## Product statement

**OpenGap helps one researcher inspect whether a research idea shows a potential evidence-backed gap for further investigation.**

It converts a vague topic into a compact, inspectable potential-gap hypothesis using OpenAIRE Graph records. It does not rank opportunities or recommend investment, funding, or scientific value.

## Primary user

One MVP persona only:

> A researcher considering a research direction, proposal angle, or project topic.

## Job to be done

> When I am considering a research direction, help me inspect whether available OpenAIRE records show a potential gap, so I can refine the question or decide whether further investigation is warranted.

## Problem

Today a researcher often moves manually across scholarly search, project databases, software/data repositories and spreadsheets before forming a rough view of a topic. A search engine returns records; it does not directly turn the distribution of those records into an inspectable hypothesis.

## Product promise

OpenGap does four things:

1. **Measure** — fetch simple OpenAIRE counts and recent trend.
2. **Detect** — apply transparent rules to identify a *potential* gap.
3. **Explain** — state why the rule fired using the measured numbers.
4. **Prove** — expose representative OpenAIRE evidence records.

## Example

Input:

```text
AI Agent Governance
```

Output shape:

```text
Potential translation gap

Research output is materially stronger than reusable technical output.

Publications   142
Projects        18
Software         6
Datasets          3
Trend          Growing

Why?
- Publications materially outnumber software + datasets.
- Reusable outputs remain sparse relative to the publication base.
- Recent publication activity is growing.

Evidence
- 3 publications
- 2 projects
- 2 software/dataset records
```

All values above are illustrative only. Production UI must show live OpenAIRE-derived values.

## Success criterion

The demo succeeds if a non-expert viewer can answer within 30 seconds:

- What did the tool find?
- Why did it say that?
- What evidence supports it?
- What should I investigate next?

## Hackathon positioning

Primary category: **Theme B — Build**.

Story angle: the tool makes OpenAIRE more useful by turning open scholarly records into a transparent research-decision shortcut. The gap methodology also aligns naturally with Theme C's evidence/gap/reproducibility framing, but submission should keep one primary theme.
