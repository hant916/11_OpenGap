# Risk Register

| Risk | Impact | Response | Kill trigger |
|---|---|---|---|
| OpenAIRE MCP setup consumes time | Critical | Keep provider boundary; ship V3 API path first | >90 min without successful real query |
| OpenAIRE rate limit/latency | High | Small page sizes, finite timeout, cache, no full paging | Repeated demo instability |
| Search counts are methodologically noisy | High | “Potential gap” wording, transparent rules, baseline optional | Never claim definitive science/funding conclusions |
| Front-end polish expands | High | Fixed two-screen UX | Any new screen not in golden path |
| LLM integration expands | High | LLM optional only for copy/query suggestions | Core finding must remain deterministic |
| Deployment failure late | Critical | Deploy an ugly vertical slice early | No local-only development past Hour 26 |
| Submission story left late | Critical | Draft included in pack now | Finalize before last 4-hour buffer |
| Demo live API failure | Medium | Pre-tested golden topic; optional labelled demo fixture | Fixture must never masquerade as live |
| Arbitrary heuristic challenged | Medium | Put methodology + limitations in UI/README | Explain it is signal discovery, not proof |
| Repository scope explosion | Critical | Follow impl packs sequentially | Reject unrelated framework/refactor work |
