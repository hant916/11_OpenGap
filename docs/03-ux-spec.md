# UX Specification

## Screen 1 — Home

Minimal composition:

```text
OpenGap
Find what's missing in research.

[ Research topic................................ ]
[ Find gaps ]

Try:
[ AI Agent Governance ] [ Climate Adaptation ] [ Quantum Computing ]
```

Optional, below the topic input only:

```text
Compare with [ optional baseline topic ]
```

### Home rules

- No dashboard.
- No navigation tree.
- No account UI.
- No advanced filters.
- Example topics are clickable and pre-tested.

## Screen 2 — Result

Order is fixed:

```text
TOPIC

POTENTIAL FINDING
one sentence

WHY?
2–3 bullet reasons

MEASURED SIGNALS
Publications / Projects / Software / Datasets / Trend

COMPARE (optional)
small direct comparison

EVIDENCE
representative records

NEXT
Refine topic / New analysis / Copy summary
```

## Finding card

Allowed labels:

- `Potential translation gap`
- `Potential project gap`
- `Sparse evidence — no reliable gap`
- `No strong gap detected`

Never use:

- `Opportunity detected`
- `Europe is ignoring X`
- `This topic should be funded`
- `Scientifically valuable`

## Loading state

Show one calm line:

```text
Checking publications, projects, software and datasets in OpenAIRE…
```

No fake progress percentage.

## Error state

```text
OpenAIRE could not be reached for this analysis.
No finding was generated.
[ Try again ]
```

Never generate a gap from partial/unknown values without explicitly marking the missing class.

## Evidence item

Each item should show only:

- type;
- title;
- year/date when available;
- stable identifier or OpenAIRE/source link;
- optional project acronym.

No modal complexity is required; an expandable list or simple details block is sufficient.

## Mobile

The result must remain readable at ~390 px width. Counts stack vertically. No horizontal table is required for the primary result.
