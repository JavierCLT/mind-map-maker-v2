"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { SavedMindmap } from "@/lib/account-api"

interface MapDetailsDialogProps {
  map: SavedMindmap | null
  isOpen: boolean
  isBusy: boolean
  onClose: () => void
  onRename: (map: SavedMindmap, nextTopic: string) => Promise<void>
  onDuplicate: (map: SavedMindmap) => Promise<void>
  onDelete: (map: SavedMindmap) => Promise<void>
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

function getWordCount(markdown: string) {
  return markdown.trim().split(/\s+/).filter(Boolean).length
}

function getNodeCount(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("#") || line.startsWith("-"))
    .length
}

export function MapDetailsDialog({
  map,
  isOpen,
  isBusy,
  onClose,
  onRename,
  onDuplicate,
  onDelete,
}: MapDetailsDialogProps) {
  const [nextTopic, setNextTopic] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (map) {
      setNextTopic(map.topic)
      setConfirmDelete(false)
    }
  }, [map])

  const stats = useMemo(() => {
    if (!map) return null
    return {
      words: getWordCount(map.markdown),
      nodes: getNodeCount(map.markdown),
    }
  }, [map])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Map Details</DialogTitle>
          <DialogDescription>Manage name, duplicates, and deletion for this map.</DialogDescription>
        </DialogHeader>

        {!map ? null : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Map name</p>
              <div className="flex gap-2">
                <Input value={nextTopic} onChange={(e) => setNextTopic(e.target.value)} disabled={isBusy} />
                <Button
                  disabled={isBusy || !nextTopic.trim() || nextTopic.trim() === map.topic}
                  onClick={async () => onRename(map, nextTopic.trim())}
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-border p-3 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Created:</span> {formatDate(map.created_at)}
              </p>
              <p>
                <span className="text-muted-foreground">Updated:</span> {formatDate(map.updated_at)}
              </p>
              <p>
                <span className="text-muted-foreground">Words:</span> {stats?.words ?? 0}
              </p>
              <p>
                <span className="text-muted-foreground">Nodes:</span> {stats?.nodes ?? 0}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" disabled={isBusy} onClick={async () => onDuplicate(map)}>
                Duplicate
              </Button>
              {!confirmDelete ? (
                <Button variant="outline" disabled={isBusy} onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" disabled={isBusy} onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" disabled={isBusy} onClick={async () => onDelete(map)}>
                    Confirm Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
