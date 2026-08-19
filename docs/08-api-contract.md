# Internal API Contract

## `POST /api/analyze`

Request:

```json
{
  "topic": "AI Agent Governance",
  "baselineTopic": "LLM Safety"
}
```

`baselineTopic` is optional.

## Success — 200

```json
{
  "topic": "AI Agent Governance",
  "metrics": {
    "publications": 0,
    "projects": 0,
    "software": 0,
    "datasets": 0
  },
  "trend": "insufficient_data",
  "finding": {
    "type": "sparse_evidence",
    "title": "Sparse evidence — no reliable gap",
    "summary": "The available evidence is too limited for the MVP heuristic.",
    "reasons": []
  },
  "evidence": [],
  "methodologyVersion": "mvp-1",
  "retrievedAt": "2026-08-19T00:00:00.000Z"
}
```

The example contains zeros for shape only; production values come from OpenAIRE.

## Invalid input — 400

```json
{
  "error": {
    "code": "INVALID_TOPIC",
    "message": "Enter a research topic."
  }
}
```

## Provider failure — 502/503

```json
{
  "error": {
    "code": "OPENAIRE_UNAVAILABLE",
    "message": "OpenAIRE could not be reached for this analysis."
  }
}
```

## Contract rules

- Never return partial missing metric classes as zero without marking them missing.
- Never return a finding when the provider snapshot is incomplete enough to invalidate the rule.
- Keep provider-specific payloads out of the response.
- Keep result JSON export identical to the stable `AnalysisResult` structure.
