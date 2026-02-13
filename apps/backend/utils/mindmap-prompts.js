export const DEEP_DIVE_ACTIONS = new Set([
  "expand",
  "explain",
  "compare",
  "plan",
  "sources",
]);

export function buildGeneratePrompt(topic) {
  return `You are creating a learning-first mind map in markdown.

Topic: "${topic}"

Rules:
1) Return ONLY markdown. No preface or commentary.
2) Use exactly these heading levels:
   - # main topic
   - ## major pillars
   - ### key sub-pillars
   - #### specific examples, mechanisms, steps, metrics, or edge cases
3) Do not use ##### or deeper.
4) Coverage must be comprehensive and practical:
   - fundamentals
   - how it works
   - key components
   - tradeoffs/risks
   - implementation/applications
   - common mistakes
   - advanced insights
5) Keep each heading concise and concrete (not vague labels).
6) Prefer specific details over generic statements.
7) Ensure each ## branch has meaningful ### nodes, and each ### has relevant #### detail nodes where useful.

Output clean markdown compatible with hierarchical rendering.`;
}

export function buildDeepDivePrompt({
  topic,
  markdown,
  nodeName,
  nodePath,
  action,
  compareWith,
}) {
  const pathText = nodePath.join(" > ");
  const compareText = compareWith
    ? `\nUser provided comparison target: "${compareWith}".`
    : "\nIf comparison is needed, infer the most relevant alternatives.";

  return `You are helping a user deeply learn a topic from a mind map.

Global topic: "${topic}"
Selected node: "${nodeName}"
Selected path: "${pathText}"
Action: "${action}"${action === "compare" ? compareText : ""}

Current mind map markdown:
"""
${markdown}
"""

Output requirements by action:

1) action=expand
- Return JSON with keys:
  - summary: short sentence of what was expanded
  - contentMarkdown: markdown section for the selected node only (start at ### or #### as needed)
- The expansion must add missing depth, concrete examples, and practical nuances.
- Do not rewrite the whole map.

2) action=explain
- Return JSON with keys:
  - summary
  - contentMarkdown
- contentMarkdown must include:
  - "### Core idea"
  - "### How it works"
  - "### Real-world examples"
  - "### Common misconceptions"

3) action=compare
- Return JSON with keys:
  - summary
  - contentMarkdown
- contentMarkdown should compare selected node vs alternatives with criteria, tradeoffs, and use-cases.

4) action=plan
- Return JSON with keys:
  - summary
  - contentMarkdown
- contentMarkdown should be action-oriented and include:
  - "### 30-minute quick start"
  - "### 7-day plan"
  - "### 30-day plan"
  - "### Success metrics"

5) action=sources
- Return JSON with keys:
  - summary
  - contentMarkdown
- contentMarkdown should include curated source categories and concrete references.
- If you are uncertain about an exact source, label it "Needs verification".

Global output constraints:
- Return STRICT JSON only.
- Do not include markdown fences.
- Use valid escaped JSON.
- Keep content concise but high-signal.`;
}

