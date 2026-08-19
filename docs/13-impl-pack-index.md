# Impl Pack Index

| Seq | Pack | Outcome | Hard gate |
|---:|---|---|---|
| 0001 | freeze-product-docs | Product/method/deadline frozen | No ambiguous MVP |
| 0002 | scaffold-single-nextjs-app | One deployable app shell | Build/lint green |
| 0003 | openaire-provider | Real OpenAIRE snapshot | Unknown ≠ zero |
| 0004 | analysis-contract | Stable AnalysisResult route | Explicit errors |
| 0005 | deterministic-gap-rules | Product kernel | Rule tests green |
| 0006 | result-ui | Golden user path | Value understood fast |
| 0007 | evidence-drilldown | Inspectable evidence | No fake provenance |
| 0008 | compare-refine-trend-polish | P1 interpretation polish | P0 stays green |
| 0009 | fixtures-tests-resilience | Stable demo behavior | Failure honesty tested |
| 0010 | demo-seed-and-polish | Deployed golden demo | Incognito smoke |
| 0011 | submission-materials | Artifact + story package | No placeholders |
| 0012 | release-final-validation | Submitted release | Confirmation retained |

## Parallelism

Do **not** parallelize core packs 0002–0007 unless separate workers share a stable branch discipline. The critical path is short enough that merge/debug cost can exceed implementation cost.

Submission writing can proceed in parallel with UI polish once the methodology is frozen, using `submission/story-1-2-page.md` as the living draft.
