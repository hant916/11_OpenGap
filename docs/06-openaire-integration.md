# OpenAIRE Integration

## Why OpenAIRE is central

OpenGap needs a single source that can expose scholarly research products and funded projects with stable identifiers. OpenAIRE Graph provides research products (including publications, datasets and software) and projects through its public Graph API, while the hackathon also provides Graph access through OpenAIRE MCP via Alien's AI Gateway.

## Stable MVP API

Start with a **90-minute MCP/Alien integration spike** because it is the hackathon-provided access path. If the spike succeeds, keep MCP as primary. If it does not, stop immediately and use OpenAIRE Graph **V3** through the same provider contract as the deterministic delivery fallback.

Base:

```text
https://api.openaire.eu/graph/v3
```

Endpoints:

```text
GET /research-products
GET /projects
```

### Counts + evidence in one request

Research-products V3 responses include:

```json
{
  "header": {
    "numFound": 18828,
    "page": 1,
    "pageSize": 3
  },
  "results": []
}
```

Therefore one request can provide:

- total count through `header.numFound`;
- top evidence through `results`.

### Minimum requests per topic

```text
1 publication query
1 software query
1 dataset query
1 project query
+ small year-bucket queries for trend
```

Do not page through the full result set.

## Suggested request shapes

Illustrative:

```text
/v3/research-products?search=<topic>&type=publication&page=1&pageSize=3
/v3/research-products?search=<topic>&type=software&page=1&pageSize=3
/v3/research-products?search=<topic>&type=dataset&page=1&pageSize=3
/v3/projects?search=<topic>&page=1&pageSize=3
```

For trend, use publication-year filters documented by V3 and fetch counts only with `pageSize=1`.

## Query normalization

MVP normalization only:

- trim whitespace;
- reject blank topics;
- cap input length;
- do not auto-create large synonym sets.

Optional query expansion can return at most 3 alternate phrases, but the core analysis must remain deterministic and understandable.

## Timeouts

Every provider request has a finite timeout. On timeout/rate-limit/provider error:

- return an explicit analysis error;
- do not convert missing values to `0`;
- do not generate a gap.

## MCP integration boundary

If MCP is implemented:

```text
OpenAireProvider
  ├─ RestOpenAireProvider
  └─ McpOpenAireProvider
```

Do not leak MCP payloads into UI/domain types.

## Reference URLs

- OpenAIRE Hackathon: https://innovation.openaire.eu/component/content/article/openaire-ai-hackathon.html?catid=8
- Graph API overview: https://graph.openaire.eu/docs/apis/graph-api/overview/
- Research products: https://graph.openaire.eu/docs/apis/graph-api/research-products/
- Projects examples: https://graph.openaire.eu/docs/apis/graph-api/projects/examples/
