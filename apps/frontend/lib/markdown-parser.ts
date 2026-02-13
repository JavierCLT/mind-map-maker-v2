export interface MindmapNode {
  id: string
  name: string
  children?: MindmapNode[]
  depth: number
  lineIndex?: number // Store the line index for easier updates
}

export interface NodeContext {
  id: string
  name: string
  depth: number
  path: string[]
}

export function parseMarkdown(markdown: string): MindmapNode {
  const lines = markdown.split("\n").filter((line) => line.trim())

  // Create root node
  const root: MindmapNode = {
    id: "root",
    name: "",
    children: [],
    depth: -1,
  }

  // Track the hierarchy
  const stack: MindmapNode[] = [root]

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()

    // Skip empty lines
    if (!line) continue

    // Determine depth and extract content
    let depth = 0
    let content = line

    // Check for bullet points with headings (- ## Heading)
    if (line.startsWith("- #")) {
      // Remove the bullet point
      line = line.substring(1).trim()

      // Count heading level
      let headingLevel = 0
      while (line.charAt(headingLevel) === "#") {
        headingLevel++
      }

      // Extract content after heading markers
      content = line.substring(headingLevel).trim()
      depth = headingLevel - 1
    }
    // Check for regular bullet points (- Content)
    else if (line.startsWith("-")) {
      content = line.substring(1).trim()

      // Calculate depth based on indentation
      const leadingSpaces = lines[i].match(/^\s*/)[0].length
      depth = Math.floor(leadingSpaces / 2) + 1
    }
    // Check for headings (# Heading)
    else if (line.startsWith("#")) {
      let headingLevel = 0
      while (line.charAt(headingLevel) === "#") {
        headingLevel++
      }

      content = line.substring(headingLevel).trim()
      depth = headingLevel - 1
    }

    // Create a more reliable ID based on the line index
    const id = `node-${i}`

    // Create new node
    const node: MindmapNode = {
      id,
      name: content,
      children: [],
      depth: depth,
      lineIndex: i, // Store the line index for easier updates
    }

    // Find the appropriate parent for this node
    while (stack.length > 1 && stack[stack.length - 1].depth >= node.depth) {
      stack.pop()
    }

    // Add to parent's children
    const parent = stack[stack.length - 1]
    if (parent.children) {
      parent.children.push(node)
    }

    // Add to stack for potential children
    stack.push(node)
  }

  // Return the first real node (skip the dummy root)
  if (root.children && root.children.length > 0) {
    return root.children[0]
  }

  // Fallback if no valid content
  return {
    id: "empty",
    name: "Empty Mindmap",
    depth: 0,
  }
}

// Export the node map for use in updates
export function buildNodeMap(markdown: string): Map<string, { lineIndex: number; depth: number; name: string }> {
  const lines = markdown.split("\n").filter((line) => line.trim())
  const nodeMap = new Map<string, { lineIndex: number; depth: number; name: string }>()

  // Parse the markdown and build a node map
  const data = parseMarkdown(markdown)

  // Traverse the tree and collect all nodes with their line indices
  function traverseTree(node: MindmapNode) {
    if (node.lineIndex !== undefined) {
      nodeMap.set(node.id, {
        lineIndex: node.lineIndex,
        depth: node.depth,
        name: node.name,
      })
    }

    if (node.children) {
      for (const child of node.children) {
        traverseTree(child)
      }
    }
  }

  if (data) {
    traverseTree(data)
  }

  return nodeMap
}

export function getNodeContextById(markdown: string, nodeId: string): NodeContext | null {
  const root = parseMarkdown(markdown)
  if (!root || root.id === "empty") {
    return null
  }

  function dfs(node: MindmapNode, path: string[]): NodeContext | null {
    const nextPath = [...path, node.name]
    if (node.id === nodeId) {
      return {
        id: node.id,
        name: node.name,
        depth: node.depth,
        path: nextPath,
      }
    }

    if (!node.children) {
      return null
    }

    for (const child of node.children) {
      const found = dfs(child, nextPath)
      if (found) {
        return found
      }
    }
    return null
  }

  return dfs(root, [])
}
