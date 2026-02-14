import * as d3 from "d3"

interface MindmapNode {
  id: string
  name: string
  children?: MindmapNode[]
  depth: number
  x?: number
  y?: number
  parent?: MindmapNode
  _children?: MindmapNode[] // Collapsed children (no longer used but kept for compatibility)
  lineIndex?: number // Line index in the markdown
}

interface RenderOptions {
  layout: "right" | "bi" // Only right and bidirectional layouts
  colorScheme: "default" | "vibrant" | "summer" | "monochrome"
  preserveTransform?: d3.ZoomTransform // To preserve zoom/pan state
  theme?: "dark" | "light" // Current theme
  forExport?: boolean // Special flag for export mode
  isMobile?: boolean // Flag for mobile view
  onNodeClick?: (node: MindmapNode) => void
  selectedNodeId?: string | null
  onTransformChange?: (transform: d3.ZoomTransform) => void
}

// Update the COLOR_SCHEMES object with the new color palettes
const COLOR_SCHEMES = {
  default: [
    "#2A9D8F", // Teal
    "#E9C46A", // Yellow
    "#F4A261", // Orange
    "#E76F51", // Coral
    "#2A9D8F", // Repeat the sequence
    "#E9C46A",
    "#F4A261",
    "#E76F51",
    "#2A9D8F",
    "#E9C46A",
    "#F4A261",
    "#E76F51",
  ],
  vibrant: [
    "#EF476F", // Pink
    "#FFD166", // Yellow
    "#118AB2", // Blue
    "#06D6A0", // Green
    "#EF476F", // Repeat the sequence
    "#FFD166",
    "#118AB2",
    "#06D6A0",
    "#EF476F",
    "#FFD166",
    "#118AB2",
    "#06D6A0",
  ],
  summer: [
    "#70D6FF", // Light Blue
    "#FF70A6", // Pink
    "#FFD670", // Yellow
    "#E9FF70", // Light Green
    "#70D6FF", // Repeat the sequence
    "#FF70A6",
    "#FFD670",
    "#E9FF70",
    "#70D6FF",
    "#FF70A6",
    "#FFD670",
    "#E9FF70",
  ],
  monochrome: [
    "#00A6FB", // Light Blue
    "#0582CA", // Medium Blue
    "#006494", // Blue
    "#003554", // Dark Blue
    "#051923", // Very Dark Blue
    "#00A6FB", // Repeat the sequence
    "#0582CA",
    "#006494",
    "#003554",
    "#051923",
    "#00A6FB",
    "#0582CA",
  ],
}

// Cache for node dimensions to prevent fluttering
const nodeDimensionsCache = new Map<string, { width: number; height: number }>()

export function renderMindmap(container: HTMLElement, data: MindmapNode, options: RenderOptions) {
  // Clear container
  container.innerHTML = ""

  // Set dimensions
  const width = container.clientWidth
  const height = container.clientHeight

  // Create SVG
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", [0, 0, width, height])
    .attr("class", "mindmap-svg")

  // Create a zoom behavior
  const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
    g.attr("transform", event.transform)
    options.onTransformChange?.(event.transform)
  })

  // Only add zoom behavior if not in export mode
  if (!options.forExport) {
    svg.call(zoom as any)
  }

  // Set background color based on theme
  const bgColor = options.theme === "dark" ? "#1a1a1a" : "#ffffff"
  svg.style("background-color", bgColor)

  // Determine text color based on theme
  const textColor = options.theme === "dark" ? "#ffffff" : "#000000"

  // Create a group for the entire mindmap
  const g = svg.append("g")

  // Create hierarchical layout
  const rootNode = d3.hierarchy(data)

  // Determine the maximum depth in the tree
  let maxDepth = 0
  rootNode.each((node) => {
    if (node.depth > maxDepth) maxDepth = node.depth
  })

  // Function to check if a node has depth 4 descendants
  function hasDepth4Descendants(node: d3.HierarchyNode<MindmapNode>): boolean {
    if (!node.children) return false

    // Check if any direct children are at depth 4
    if (node.children.some((child) => child.depth === 4)) return true

    // Recursively check children (but only if they're not already at depth 4)
    return node.children.some((child) => child.depth < 4 && hasDepth4Descendants(child))
  }

  // Determine the cutoff depth for rectangles vs circles
  // If max depth is 3 or less, depth 0-2 get rectangles, depth 3+ get circles
  const baseRectangleCutoffDepth = maxDepth >= 4 ? 2 : 2

  // Split data for bidirectional layout
  let leftNodes: d3.HierarchyPointNode<MindmapNode>[] = []
  let rightNodes: d3.HierarchyPointNode<MindmapNode>[] = []
  let rootNodeProcessed: d3.HierarchyPointNode<MindmapNode> | null = null

  // Increase horizontal spacing between levels
  // Use larger spacing on mobile for better visibility
  const horizontalSpacing = options.isMobile ? 240 : 260 // Increased spacing for better separation

  if (options.layout === "bi" && rootNode.children && rootNode.children.length > 0) {
    // Create a copy of the root node for processing
    const rootCopy = { ...rootNode }

    // Split children into left and right groups
    const midPoint = Math.ceil(rootNode.children.length / 2)

    // Create left side hierarchy
    const leftRoot = d3.hierarchy({ ...data, children: data.children?.slice(0, midPoint) })

    // Create right side hierarchy
    const rightRoot = d3.hierarchy({ ...data, children: data.children?.slice(midPoint) })

    // Configure tree layouts with increased horizontal spacing and adaptive node separation
    const treeLayout = d3
      .tree<MindmapNode>()
      .nodeSize([options.isMobile ? 50 : 35, horizontalSpacing]) // Increased vertical spacing on mobile
      .separation((a, b) => {
        // Check if either node has children at depth beyond the cutoff
        const aHasDeepChildren = a.children?.some((child) => child.depth > baseRectangleCutoffDepth) || false
        const bHasDeepChildren = b.children?.some((child) => child.depth > baseRectangleCutoffDepth) || false

        // Adjust separation based on depth and whether nodes have children
        if (a.depth === 2 || b.depth === 2) {
          // Increase spacing for depth 2 nodes that have children
          if (aHasDeepChildren || bHasDeepChildren) {
            return a.parent === b.parent ? (options.isMobile ? 3.2 : 2.6) : options.isMobile ? 3.4 : 2.9
          }
          // Use standard spacing for depth 2 nodes without children
          return a.parent === b.parent ? (options.isMobile ? 2.4 : 1.9) : options.isMobile ? 2.7 : 2.2
        }
        if (a.depth === 3 || b.depth === 3) {
          // Similar spacing for depth 3 nodes as we use for depth 2
          if (aHasDeepChildren || bHasDeepChildren) {
            return a.parent === b.parent ? (options.isMobile ? 2.9 : 2.4) : options.isMobile ? 3.2 : 2.7
          }
          return a.parent === b.parent ? (options.isMobile ? 2.2 : 1.7) : options.isMobile ? 2.4 : 2.0
        }
        if (a.depth > baseRectangleCutoffDepth || b.depth > baseRectangleCutoffDepth) {
          return a.parent === b.parent ? (options.isMobile ? 1.9 : 1.4) : options.isMobile ? 2.1 : 1.6
        }
        // Default separation for other nodes
        return a.parent === b.parent ? (options.isMobile ? 2.2 : 1.6) : options.isMobile ? 2.4 : 1.9
      })

    // Apply layouts
    if (leftRoot.children && leftRoot.children.length > 0) {
      const leftTree = treeLayout(leftRoot)
      // Flip coordinates for left side
      leftTree.each((node) => {
        if (node.depth > 0) {
          node.y = -node.y
        }
      })
      leftNodes = leftTree.descendants()
    }

    if (rightRoot.children && rightRoot.children.length > 0) {
      const rightTree = treeLayout(rightRoot)
      rightNodes = rightTree.descendants()
    }

    // Process the root node separately
    rootNodeProcessed = {
      ...rootNode,
      x: 0,
      y: 0,
      depth: 0,
      height: rootNode.height,
      data: rootNode.data,
      parent: null,
      children: [...(leftRoot.children || []), ...(rightRoot.children || [])],
    }

    // Filter out duplicate root nodes from left and right trees
    leftNodes = leftNodes.filter((node) => node.depth > 0)
    rightNodes = rightNodes.filter((node) => node.depth > 0)
  } else {
    // For right layout, use standard tree with increased horizontal spacing
    const treeLayout = d3
      .tree<MindmapNode>()
      .nodeSize([options.isMobile ? 50 : 35, horizontalSpacing]) // Increased vertical spacing on mobile
      .separation((a, b) => {
        // Check if either node has children at depth beyond the cutoff
        const aHasDeepChildren = a.children?.some((child) => child.depth > baseRectangleCutoffDepth) || false
        const bHasDeepChildren = b.children?.some((child) => child.depth > baseRectangleCutoffDepth) || false

        // Adjust separation based on depth and whether nodes have children
        if (a.depth === 2 || b.depth === 2) {
          // Increase spacing for depth 2 nodes that have children
          if (aHasDeepChildren || bHasDeepChildren) {
            return a.parent === b.parent ? (options.isMobile ? 3.2 : 2.6) : options.isMobile ? 3.4 : 2.9
          }
          // Use standard spacing for depth 2 nodes without children
          return a.parent === b.parent ? (options.isMobile ? 2.4 : 1.9) : options.isMobile ? 2.7 : 2.2
        }
        if (a.depth === 3 || b.depth === 3) {
          // Similar spacing for depth 3 nodes as we use for depth 2
          if (aHasDeepChildren || bHasDeepChildren) {
            return a.parent === b.parent ? (options.isMobile ? 2.9 : 2.4) : options.isMobile ? 3.2 : 2.7
          }
          return a.parent === b.parent ? (options.isMobile ? 2.2 : 1.7) : options.isMobile ? 2.4 : 2.0
        }
        if (a.depth > baseRectangleCutoffDepth || b.depth > baseRectangleCutoffDepth) {
          return a.parent === b.parent ? (options.isMobile ? 1.9 : 1.4) : options.isMobile ? 2.1 : 1.6
        }
        // Default separation for other nodes
        return a.parent === b.parent ? (options.isMobile ? 2.2 : 1.6) : options.isMobile ? 2.4 : 1.9
      })

    rootNodeProcessed = treeLayout(rootNode)
    rightNodes = rootNodeProcessed.descendants()
  }

  // Combine all nodes
  const allNodes = [...(rootNodeProcessed ? [rootNodeProcessed] : []), ...leftNodes, ...rightNodes]

  // Create links group - put it BEFORE nodes group for proper layering
  const linksGroup = g.append("g").attr("class", "links-group")

  // Create nodes group - this will be on top of links
  const nodesGroup = g.append("g").attr("class", "nodes-group")

  // Get color function based on color scheme
  const getNodeColor = (d: d3.HierarchyPointNode<MindmapNode>) => {
    // Get the color palette based on the selected scheme
    const colorPalette = COLOR_SCHEMES[options.colorScheme] || COLOR_SCHEMES.default

    // For monochrome, use the same blue shades in both light and dark mode
    if (options.colorScheme === "monochrome") {
      return colorPalette[d.depth % colorPalette.length]
    }

    return colorPalette[d.depth % colorPalette.length]
  }

  const isSelected = (d: d3.HierarchyPointNode<MindmapNode>) => d.data.id === options.selectedNodeId
  const selectedStroke = options.theme === "dark" ? "#ffffff" : "#0f172a"

  // Create links
  const links: d3.HierarchyPointLink<MindmapNode>[] = []

  // Process each node to create links
  allNodes.forEach((node) => {
    if (node.parent) {
      links.push({
        source: node.parent,
        target: node,
      } as d3.HierarchyPointLink<MindmapNode>)
    }
  })

  // Add nodes
  const nodes = nodesGroup
    .selectAll(".node")
    .data(allNodes)
    .enter()
    .append("g")
    .attr("class", "mindmap-node")
    .attr("data-depth", (d) => d.depth)
    .attr("data-id", (d) => d.data.id)
    .attr("transform", (d) => `translate(${d.y},${d.x})`)
    .on("click", (event, d) => {
      event.stopPropagation()
      options.onNodeClick?.(d.data)
    })

  // Helper function to get text width
  function textWidth(text: string): number {
    const tempText = svg.append("text").style("opacity", 0).text(text)
    const width = (tempText.node() as SVGTextElement).getComputedTextLength()
    tempText.remove()
    return width
  }

  // Function to wrap text to multiple lines if it's too long
  function wrapText(text: d3.Selection<SVGTextElement, any, any, any>, maxWidth: number) {
    text.each(function () {
      const text = d3.select(this)
      const words = text.text().split(/\s+/).reverse()
      const lineHeight = 1.2 // ems
      const y = text.attr("y") || "0"
      const dy = Number.parseFloat(text.attr("dy") || "0")

      // Use a more accurate character width approximation
      const avgCharWidth = 6.2 // Average character width in pixels (approximation)

      let line: string[] = []
      let lineNumber = 0
      let word: string | undefined
      const lines: string[] = []

      // First pass: determine how many lines we'll have
      let tempLine: string[] = []
      const tempWords = [...words] // Create a copy of words array

      while ((word = tempWords.pop())) {
        tempLine.push(word)
        const lineText = tempLine.join(" ")
        // Use character count * avgCharWidth for more stable width calculation
        const estimatedWidth = lineText.length * avgCharWidth

        if (estimatedWidth > maxWidth && tempLine.length > 1) {
          tempLine.pop()
          lines.push(tempLine.join(" "))
          tempLine = [word]
        }
      }

      // Add the last line
      if (tempLine.length > 0) {
        lines.push(tempLine.join(" "))
      }

      // Calculate vertical offset to center all lines
      const totalLines = lines.length
      const totalHeight = totalLines * lineHeight
      const startDy = dy - totalHeight / 2 + lineHeight / 2

      // Clear existing content
      text.text(null)

      // Reset for actual rendering
      lineNumber = 0

      // Create first tspan with adjusted vertical position
      let tspan = text
        .append("tspan")
        .attr("x", text.attr("x"))
        .attr("y", y)
        .attr("dy", startDy + "em")
        .attr("text-anchor", text.attr("text-anchor"))

      // Second pass: actually create the tspans
      line = []
      while ((word = words.pop())) {
        line.push(word)
        const lineText = line.join(" ")
        const estimatedWidth = lineText.length * avgCharWidth

        if (estimatedWidth > maxWidth && line.length > 1) {
          line.pop()
          tspan.text(line.join(" "))
          line = [word]

          tspan = text
            .append("tspan")
            .attr("x", text.attr("x"))
            .attr("y", y)
            .attr("dy", lineHeight + "em")
            .attr("text-anchor", text.attr("text-anchor"))
            .text(word)
        } else {
          tspan.text(lineText)
        }
      }
    })
  }

  // Define max widths for different node types with adaptive sizing
  // Use larger text boxes on mobile
  const maxWidths = {
    title: options.isMobile ? 240 : 200, // Root node (depth 0)
    mainBranch: options.isMobile ? 220 : 180, // First level (depth 1) - Increased for mobile
    subBranch: (d: d3.HierarchyPointNode<MindmapNode>) => {
      // Allow longer text for depth 2 nodes that don't have children
      if (d.depth === 2 && (!d.children || d.children.length === 0)) {
        return options.isMobile ? 220 : 180 // Wider boxes for childless depth 2 nodes
      }
      return options.isMobile ? 180 : 140 // Standard width for depth 2 nodes with children
    },
    depth3Branch: (d: d3.HierarchyPointNode<MindmapNode>) => {
      // Allow longer text for depth 3 nodes that don't have children
      if (d.depth === 3 && (!d.children || d.children.length === 0)) {
        return options.isMobile ? 200 : 160 // Wider boxes for childless depth 3 nodes
      }
      return options.isMobile ? 160 : 120 // Standard width for depth 3 nodes with children
    },
  }

  // Function to determine if a node should have a rectangle
  function shouldHaveRectangle(d: d3.HierarchyPointNode<MindmapNode>): boolean {
    // Depth 0-2 always get rectangles
    if (d.depth <= 2) return true

    // Depth 3 nodes get rectangles only if they have depth 4 descendants
    if (d.depth === 3) {
      // Check if this node has any depth 4 children
      return d.children?.some((child) => child.depth === 4) || false
    }

    // Depth 4+ never get rectangles
    return false
  }

  // Add background rectangles for nodes that should have them
  const nodeRects = nodes
    .filter((d) => shouldHaveRectangle(d))
    .append("rect")
    .attr("class", "mindmap-node-bg")
    .attr("rx", 5) // Rounded corners
    .attr("ry", 5)
    .attr("fill", (d) => getNodeColor(d))
    .attr("stroke", (d) => (isSelected(d) ? selectedStroke : "none"))
    .attr("stroke-width", (d) => (isSelected(d) ? 2.5 : 0))
    .attr("opacity", 1.0) // Solid color

  // Add connection circles at node joints for nodes that shouldn't have rectangles
  nodes
    .filter((d) => !shouldHaveRectangle(d))
    .append("circle")
    .attr("class", "mindmap-node-circle")
    .attr("r", options.isMobile ? 5 : 4) // Slightly larger circles on mobile
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("fill", getNodeColor)
    .attr("stroke", (d) => (isSelected(d) ? selectedStroke : "none"))
    .attr("stroke-width", (d) => (isSelected(d) ? 2.5 : 0))

  // Add text labels with level-specific positioning
  const nodeTexts = nodes
    .append("text")
    .attr("class", (d) => `mindmap-node-text depth-${d.depth}`)
    .attr("dy", "0.3em")
    .attr("x", (d) => {
      // Level-specific horizontal positioning
      if (shouldHaveRectangle(d)) return 0 // Center text for all boxed nodes
      return d.y < 0 ? -10 : 10 // For circle nodes: to the right/left of the dot
    })
    .attr("text-anchor", (d) => {
      // Level-specific text alignment
      if (shouldHaveRectangle(d)) return "middle" // Center text for all boxed nodes
      return d.y < 0 ? "end" : "start" // Left side: right-aligned, Right side: left-aligned
    })
    .text((d) => d.data.name)
    // Update the text color logic to ensure good contrast with the new color palettes
    .attr("fill", (d) => {
      // For boxed nodes, determine text color based on background color
      if (shouldHaveRectangle(d)) {
        const nodeColor = getNodeColor(d)

        // For summer colors, use dark grey text for yellow to improve contrast
        if (options.colorScheme === "summer") {
          if (nodeColor === "#FFD670" || nodeColor === "#E9FF70") {
            return "#333333"
          }
          return "#000000"
        }

        // For monochrome dark blues, always use white text
        if (options.colorScheme === "monochrome") {
          return "#ffffff"
        }

        // For default scheme, use black text for yellow (#E9C46A) and white for others
        if (options.colorScheme === "default") {
          return nodeColor === "#E9C46A" || nodeColor === "#F4A261" ? "#000000" : "#ffffff"
        }

        // For vibrant scheme, use black text for yellow (#FFD166) and white for others
        if (options.colorScheme === "vibrant") {
          return nodeColor === "#FFD166" ? "#000000" : "#ffffff"
        }

        // Default to white text
        return "#ffffff"
      }

      return textColor // Use theme text color for non-boxed nodes
    })
    .attr("font-size", (d) => {
      // Larger font sizes on mobile
      if (options.isMobile) {
        return d.depth === 0 ? "20px" : d.depth === 1 ? "16px" : "14px"
      }
      return d.depth === 0 ? "18px" : "14px"
    })
    .attr("font-weight", (d) => (d.depth <= 1 ? "bold" : "normal")) // Bold text for root and first level

  // Apply text wrapping based on depth
  nodeTexts
    .filter((d) => shouldHaveRectangle(d))
    .each(function (d) {
      const textElement = d3.select(this)
      let maxWidth

      // Adjust max width based on depth
      if (d.depth === 0) maxWidth = maxWidths.title
      else if (d.depth === 1) maxWidth = maxWidths.mainBranch
      else if (d.depth === 2)
        maxWidth = typeof maxWidths.subBranch === "function" ? maxWidths.subBranch(d) : maxWidths.subBranch
      else maxWidth = typeof maxWidths.depth3Branch === "function" ? maxWidths.depth3Branch(d) : maxWidths.depth3Branch

      // Apply text wrapping
      wrapText(textElement, maxWidth)

      // After wrapping, ensure all tspans are properly centered
      textElement.selectAll("tspan").attr("x", 0).attr("text-anchor", "middle")
    })

  // Store rectangle dimensions for link connections
  const nodeDimensions = new Map<string, { width: number; height: number }>()

  // Now adjust rectangle sizes based on wrapped text
  nodeRects.each(function (d) {
    const rect = d3.select(this)
    const textNode = d3.select(this.parentNode).select("text").node()
    const nodeId = d.data.id

    if (!textNode) return

    // Check if we have cached dimensions for this node and text content
    const cacheKey = `${nodeId}-${d.data.name}-${options.isMobile ? "mobile" : "desktop"}`
    let dimensions = nodeDimensionsCache.get(cacheKey)

    if (!dimensions) {
      // Get bounding box of the text (which may now be multi-line)
      const textBBox = (textNode as SVGTextElement).getBBox()

      // Set padding based on depth and mobile status
      const padding = {
        horizontal:
          d.depth === 0
            ? options.isMobile
              ? 28
              : 24
            : d.depth === 1
              ? options.isMobile
                ? 24
                : 20
              : d.depth === 2
                ? options.isMobile
                  ? 18
                  : 14
                : options.isMobile
                  ? 16
                  : 12,
        vertical:
          d.depth === 0
            ? options.isMobile
              ? 16
              : 14
            : d.depth === 1
              ? options.isMobile
                ? 14
                : 12
              : d.depth === 2
                ? options.isMobile
                  ? 12
                  : 10
                : options.isMobile
                  ? 10
                  : 8,
      }

      // Calculate dimensions
      const rectHeight = textBBox.height + padding.vertical * 2
      const rectWidth = textBBox.width + padding.horizontal * 2

      // Cache the dimensions
      dimensions = { width: rectWidth, height: rectHeight }
      nodeDimensionsCache.set(cacheKey, dimensions)
    }

    // Apply the dimensions
    rect.attr("height", dimensions.height)
    rect.attr("y", -dimensions.height / 2)
    rect.attr("width", dimensions.width)
    rect.attr("x", -dimensions.width / 2)

    // Store dimensions for link connections
    nodeDimensions.set(d.data.id, dimensions)
  })

  // Create curved links with longer horizontal sections and better spacing
  const linkGenerator = (d: d3.HierarchyPointLink<any>) => {
    const source = { x: d.source.x, y: d.source.y }
    const target = { x: d.target.x, y: d.target.y }

    // Adjust target coordinates for boxed nodes
    if (shouldHaveRectangle(d.target)) {
      const dimensions = nodeDimensions.get(d.target.data.id)

      if (dimensions) {
        const halfWidth = dimensions.width / 2

        // Determine which side of the rectangle to connect to
        const isLeftSide = target.y < source.y

        // Adjust target y-coordinate to connect to the side of the rectangle
        target.y = isLeftSide ? target.y + halfWidth : target.y - halfWidth
      }
    }

    // Calculate control points for a smooth curve with longer horizontal sections
    const bendPoint = shouldHaveRectangle(d.target) ? 0.75 : 0.8
    const midY = source.y + (target.y - source.y) * bendPoint

    return `M${source.y},${source.x}
          C${midY},${source.x}
           ${midY},${target.x}
           ${target.y},${target.x}`
  }

  // Add links with curved paths
  linksGroup
    .selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "mindmap-link")
    .attr("d", linkGenerator)
    .attr("fill", "none")
    .attr("stroke", (d) => getNodeColor(d.source)) // Color links based on source node depth
    .attr("stroke-width", options.isMobile ? 2.5 : 2) // Slightly thicker lines on mobile
    .attr("stroke-opacity", 0.8)

  // Calculate the initial transform to center the mindmap
  const initialTransform = getInitialTransform(allNodes, width, height, options.isMobile, options.layout)

  // Apply transform based on options
  if (options.preserveTransform && !options.forExport) {
    // Use the zoom behavior to apply the preserved transform
    svg.call((zoom as any).transform, options.preserveTransform)
  } else if (!options.forExport) {
    // Use the zoom behavior to apply the initial transform
    svg.call((zoom as any).transform, initialTransform)
  }

  // Return the zoom behavior for external use
  return { zoom, svg }
}

// Improved function to get initial transform that properly centers the mindmap
function getInitialTransform(
  nodes: d3.HierarchyPointNode<any>[],
  width: number,
  height: number,
  isMobile = false,
  layout: "right" | "bi" = "bi",
) {
  if (nodes.length === 0) return d3.zoomIdentity

  // Function to determine if a node should have a rectangle
  function shouldHaveRectangle(d: d3.HierarchyPointNode<any>): boolean {
    // Depth 0-2 always get rectangles
    if (d.depth <= 2) return true

    // Depth 3 nodes get rectangles only if they have depth 4 descendants
    if (d.depth === 3) {
      // Check if this node has any depth 4 children
      return d.children?.some((child) => child.depth === 4) || false
    }

    // Depth 4+ never get rectangles
    return false
  }

  // Calculate bounds
  let left = Number.POSITIVE_INFINITY
  let right = Number.NEGATIVE_INFINITY
  let top = Number.POSITIVE_INFINITY
  let bottom = Number.NEGATIVE_INFINITY

  nodes.forEach((d) => {
    // For each node, consider both its position and any potential text/rectangle
    // Add a larger buffer to account for node size and ensure proper centering
    // Use even larger buffer on mobile for better visibility
    const buffer = shouldHaveRectangle(d) ? (isMobile ? 180 : 150) : isMobile ? 70 : 50

    // Note: In d3.tree, x is vertical and y is horizontal
    const x = d.x // Vertical position
    const y = d.y // Horizontal position

    if (y - buffer < left) left = y - buffer
    if (y + buffer > right) right = y + buffer
    if (x - buffer < top) top = x - buffer
    if (x + buffer > bottom) bottom = x + buffer
  })

  // Calculate the center of the mindmap
  const centerX = (left + right) / 2
  const centerY = (top + bottom) / 2

  // Calculate the dimensions of the mindmap
  const mindmapWidth = right - left
  const mindmapHeight = bottom - top

  // Calculate scale to fit the entire mindmap with some padding
  // Use a different scale factor for mobile based on layout
  let scaleFactor = 0.8

  if (isMobile) {
    // For mobile, use a smaller scale factor to ensure the entire mindmap is visible
    // and adjust based on layout
    if (layout === "right") {
      scaleFactor = 0.55 // Smaller scale for right layout on mobile to show more content
    } else {
      scaleFactor = 0.5 // Even smaller scale for bidirectional layout on mobile
    }
  }

  const scale = Math.min(
    (scaleFactor * width) / mindmapWidth,
    (scaleFactor * height) / mindmapHeight,
    isMobile ? 0.7 : 1.0, // Cap the maximum scale on mobile
  )

  // Calculate translation to center the mindmap in the viewport
  // For mobile with right layout, we need to adjust the centering differently
  let translateX = width / 2 - centerX * scale
  const translateY = height / 2 - centerY * scale

  // For right layout on mobile, we need to shift the mindmap left
  // to account for the root node being at the left edge
  if (isMobile && layout === "right") {
    // Find the root node
    const rootNode = nodes.find((n) => n.depth === 0)
    if (rootNode) {
      // Calculate how far from the left edge the root node is
      const rootX = rootNode.y
      // Adjust the translation to position the root node more to the left
      // This gives more space for the right side of the mindmap
      translateX = width * 0.3 - rootX * scale
    }
  }

  return d3.zoomIdentity.translate(translateX, translateY).scale(scale)
}
