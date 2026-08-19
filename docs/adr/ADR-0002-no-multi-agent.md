# ADR-0002 — No multi-agent or EVERRUN runtime in MVP

## Status
Accepted.

## Decision
Do not place EVERRUN continuation/recovery/mutation/evaluation/selection/rollback in the runtime critical path.

## Why
The MVP workflow is bounded and deterministic: input → OpenAIRE queries → aggregate → rules → result. A multi-agent runtime increases failure modes without strengthening the core user value.

## Future
EVERRUN is a plausible later foundation for continuous monitoring or autonomous investigation, but not for this submission build.
