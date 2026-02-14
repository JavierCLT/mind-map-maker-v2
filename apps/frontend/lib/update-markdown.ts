import { buildNodeMap } from "./markdown-parser"

export function updateNodeInMarkdown(markdown: string, nodeId: string, newName: string): string {
  // Keep indexing consistent with markdown-parser/buildNodeMap (which ignores blank lines).
  const lines = markdown.split("\n").filter((line) => line.trim())

  // Build node map
  const nodeMap = buildNodeMap(markdown)

  // Find the node with the given ID
  const nodeInfo = nodeMap.get(nodeId)

  if (!nodeInfo) {
    console.error(`Node with ID ${nodeId} not found in node map`)
    console.log("Available node IDs:", Array.from(nodeMap.keys()))
    throw new Error(`Node with ID ${nodeId} not found`)
  }

  // Get the line index
  const { lineIndex } = nodeInfo

  // Get the original line
  const originalLine = lines[lineIndex]

  // Preserve the original formatting (bullet points, indentation, etc.)
  let prefix = ""

  // Check if the line starts with a bullet point
  if (originalLine.trim().startsWith("-")) {
    // Preserve the bullet point and any indentation
    const match = originalLine.match(/^(\s*-\s*)/)
    if (match) {
      prefix = match[1]
    }
  }
  // Check if the line starts with a heading
  else if (originalLine.trim().startsWith("#")) {
    // Preserve the heading markers
    const match = originalLine.match(/^(\s*#{1,6}\s*)/)
    if (match) {
      prefix = match[1]
    }
  }
  // For bullet points with headings (- ## Heading)
  else if (originalLine.trim().match(/^-\s+#{1,6}/)) {
    const match = originalLine.match(/^(\s*-\s+#{1,6}\s*)/)
    if (match) {
      prefix = match[1]
    }
  }

  // Update the line with the new name, preserving the original formatting
  lines[lineIndex] = `${prefix}${newName}`

  // Join the lines back together
  return lines.join("\n")
}
