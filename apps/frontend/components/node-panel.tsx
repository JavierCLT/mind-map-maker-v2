"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/loading-spinner"

export function NodePanel({
  selectedNodeId,
  selectedNodeName,
  selectedNodePath,
  isBusy,
  deepDiveSummary,
  deepDiveMarkdown,
  onEditNode,
  onExpandNode,
  onClearSelection,
}: {
  selectedNodeId: string | null
  selectedNodeName: string | null
  selectedNodePath: string[] | null
  isBusy: boolean
  deepDiveSummary: string | null
  deepDiveMarkdown: string | null
  onEditNode: (newName: string) => Promise<void> | void
  onExpandNode: () => Promise<void> | void
  onClearSelection: () => void
}) {
  const [tab, setTab] = useState<"edit" | "expand">("edit")
  const [draftName, setDraftName] = useState("")

  useEffect(() => {
    setDraftName(selectedNodeName || "")
    setTab("edit")
  }, [selectedNodeId, selectedNodeName])

  const breadcrumb = useMemo(() => {
    if (!selectedNodePath?.length) return null
    return selectedNodePath.join(" > ")
  }, [selectedNodePath])

  if (!selectedNodeId || !selectedNodeName) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Node</CardTitle>
          <p className="text-xs text-muted-foreground">Click any node to edit or expand it.</p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            Tip: click a node to open actions here. Use Expand to deepen one area without regenerating the whole map.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm truncate">{selectedNodeName}</CardTitle>
            {breadcrumb && <p className="text-[11px] text-muted-foreground truncate">{breadcrumb}</p>}
          </div>
          <Button size="sm" variant="ghost" onClick={onClearSelection} disabled={isBusy}>
            Close
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="expand">Expand</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Rename this node (updates your map immediately).</p>
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Node name"
                disabled={isBusy}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  disabled={isBusy || !draftName.trim() || draftName.trim() === selectedNodeName}
                  onClick={() => setDraftName(selectedNodeName)}
                >
                  Reset
                </Button>
                <Button
                  disabled={isBusy || !draftName.trim() || draftName.trim() === selectedNodeName}
                  onClick={() => onEditNode(draftName.trim())}
                >
                  Save
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expand" className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Expand will add more detail under this node and keep the rest of the map intact.
            </p>
            <Button className="w-full" onClick={() => onExpandNode()} disabled={isBusy}>
              {isBusy ? "Expanding..." : "Expand This Node"}
            </Button>

            {isBusy && (
              <div className="py-2">
                <LoadingSpinner size={28} />
              </div>
            )}

            {deepDiveSummary && <p className="text-xs font-medium">{deepDiveSummary}</p>}

            {deepDiveMarkdown && (
              <pre className="text-xs whitespace-pre-wrap rounded-md border border-border bg-muted/50 p-2 max-h-72 overflow-y-auto">
                {deepDiveMarkdown}
              </pre>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

