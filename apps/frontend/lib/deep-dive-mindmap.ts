export type DeepDiveAction = "expand" | "explain" | "compare" | "plan" | "sources"

export interface DeepDiveRequest {
  topic: string
  markdown: string
  nodeName: string
  nodePath: string[]
  action: DeepDiveAction
  compareWith?: string
}

export interface DeepDiveResponse {
  action: DeepDiveAction
  nodeName: string
  nodePath: string[]
  summary: string
  contentMarkdown: string
  model?: string
}

function getBackendUrl() {
  let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://mindmap-backend-five.vercel.app"
  if (!backendUrl.startsWith("http://") && !backendUrl.startsWith("https://")) {
    backendUrl = `https://${backendUrl}`
  }
  return backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl
}

export async function deepDiveNode(payload: DeepDiveRequest): Promise<DeepDiveResponse> {
  return deepDiveNodeAuthed(payload)
}

export async function deepDiveNodeAuthed(
  payload: DeepDiveRequest,
  accessToken?: string,
): Promise<DeepDiveResponse> {
  const apiUrl = `${getBackendUrl()}/deep-dive`
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Deep dive failed (${response.status})`)
  }

  const data = (await response.json()) as DeepDiveResponse
  if (!data.contentMarkdown) {
    throw new Error("Invalid deep dive response: missing contentMarkdown")
  }

  return data
}

interface ParsedHeadingLine {
  index: number
  level: number
  text: string
  path: string[]
}

function parseHeadingLine(rawLine: string): { level: number; text: string } | null {
  const line = rawLine.trim()
  if (!line) return null

  const headingMatch = line.match(/^(#{1,4})\s+(.+)$/)
  if (headingMatch) {
    return { level: headingMatch[1].length, text: headingMatch[2].trim() }
  }

  const bulletHeadingMatch = line.match(/^-\s*(#{1,4})\s+(.+)$/)
  if (bulletHeadingMatch) {
    return { level: bulletHeadingMatch[1].length, text: bulletHeadingMatch[2].trim() }
  }

  return null
}

function collectHeadings(lines: string[]): ParsedHeadingLine[] {
  const stack: string[] = []
  const headings: ParsedHeadingLine[] = []

  for (let i = 0; i < lines.length; i++) {
    const parsed = parseHeadingLine(lines[i])
    if (!parsed) continue

    while (stack.length >= parsed.level) {
      stack.pop()
    }
    stack.push(parsed.text)

    headings.push({
      index: i,
      level: parsed.level,
      text: parsed.text,
      path: [...stack],
    })
  }

  return headings
}

export function applyExpansionToMarkdown(
  markdown: string,
  nodePath: string[],
  contentMarkdown: string,
  fallbackNodeName: string,
): string {
  const lines = markdown.split("\n")
  const headings = collectHeadings(lines)
  const normalizedPath = nodePath.map((p) => p.trim()).filter(Boolean)

  const target = headings.find(
    (h) =>
      (normalizedPath.length > 0 && JSON.stringify(h.path) === JSON.stringify(normalizedPath)) ||
      h.text === fallbackNodeName,
  )

  if (!target) {
    const suffix = contentMarkdown.trim() ? `\n\n## Deep Dive: ${fallbackNodeName}\n${contentMarkdown.trim()}` : ""
    return `${markdown.trim()}${suffix}`
  }

  let insertAt = lines.length
  for (const heading of headings) {
    if (heading.index > target.index && heading.level <= target.level) {
      insertAt = heading.index
      break
    }
  }

  const insertionBlock = contentMarkdown.trim()
  if (!insertionBlock) {
    return markdown
  }

  const before = lines.slice(0, insertAt).join("\n").replace(/\s*$/, "")
  const after = lines.slice(insertAt).join("\n").replace(/^\s*/, "")
  return `${before}\n${insertionBlock}\n${after}`.trim()
}
