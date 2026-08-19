# User Value and Journey

## Value before features

The user is not looking for a “knowledge graph experience”. The user is trying to make a decision about a research direction.

OpenGap's value is the transition:

```text
intuition → evidence-backed hypothesis
```

Before OpenGap:

```text
"I think this topic might be interesting."
```

After OpenGap:

```text
"This topic shows a potential translation gap: publication activity is much larger than reusable software/data output, and here are the OpenAIRE records behind that observation."
```

## Golden path

### 1. Idea

User enters a topic.

```text
[ AI Agent Governance ]  [ Find gaps ]
```

### 2. Analyze

System fetches only the data needed by the MVP:

- publications;
- projects;
- software;
- datasets;
- recent publication counts for trend.

### 3. Potential gap

System returns at most one primary finding:

- Potential translation gap;
- Potential project gap;
- Sparse evidence / no reliable gap.

### 4. Why

Show no more than 3 reasons, each directly tied to measured values.

### 5. Evidence

Show a small representative list of real records with type, title, year and source/open link when available.

### 6. Refine

Offer 3–5 narrower/adjacent topic suggestions and optional one-topic comparison.

## User map

```text
I HAVE AN IDEA
     ↓
IS IT WORTH INVESTIGATING?
     ↓
WHAT LOOKS MISSING?
     ↓
WHY DO YOU SAY THAT?
     ↓
CAN I INSPECT THE EVIDENCE?
     ↓
HOW SHOULD I REFINE THE IDEA?
```

## UX priority

Every result page follows this strict order:

1. **WHAT DID YOU FIND?**
2. **WHY?**
3. **SHOW ME THE EVIDENCE.**
4. **WHAT CAN I DO NEXT?**

Metrics never lead the page. Methodology never leads the page. OpenAIRE implementation details never lead the page.
