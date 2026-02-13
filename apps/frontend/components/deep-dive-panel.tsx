"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { DeepDiveAction } from "@/lib/deep-dive-mindmap"

interface DeepDivePanelProps {
  selectedNodeName: string | null
  isLoading: boolean
  resultSummary: string | null
  resultMarkdown: string | null
  onAction: (action: DeepDiveAction, compareWith?: string) => void
}

const ACTIONS: Array<{ key: DeepDiveAction; label: string }> = [
  { key: "expand", label: "Expand" },
  { key: "explain", label: "Explain" },
  { key: "compare", label: "Compare" },
  { key: "plan", label: "Action Plan" },
  { key: "sources", label: "Sources" },
]

export function DeepDivePanel({
  selectedNodeName,
  isLoading,
  resultSummary,
  resultMarkdown,
  onAction,
}: DeepDivePanelProps) {
  const [compareWith, setCompareWith] = useState("")

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Deep Dive</CardTitle>
        <p className="text-xs text-muted-foreground">
          {selectedNodeName ? `Selected node: ${selectedNodeName}` : "Select a node from the map first"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {ACTIONS.map((action) => (
            <Button
              key={action.key}
              size="sm"
              variant="outline"
              disabled={!selectedNodeName || isLoading}
              onClick={() => onAction(action.key, compareWith)}
            >
              {action.label}
            </Button>
          ))}
        </div>

        <Input
          value={compareWith}
          onChange={(e) => setCompareWith(e.target.value)}
          placeholder="Optional compare target (e.g., ETFs)"
          disabled={isLoading}
        />

        {isLoading && <p className="text-xs text-muted-foreground">Running deep dive...</p>}

        {resultSummary && <p className="text-xs font-medium">{resultSummary}</p>}

        {resultMarkdown && (
          <pre className="text-xs whitespace-pre-wrap rounded-md border border-border bg-muted/50 p-2 max-h-56 overflow-y-auto">
            {resultMarkdown}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}
