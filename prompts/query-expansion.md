# Optional Query Expansion Prompt

This prompt is P1 only. Core product must work without it.

## Instruction

Given one research topic, return at most three concise adjacent search phrases that preserve the user's intent. Do not broaden into unrelated fields. Do not make claims about novelty or importance.

Output JSON only:

```json
{"queries":["...","...","..."]}
```
