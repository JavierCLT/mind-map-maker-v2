"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Download, FileImage } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import type { SavedMindmap } from "@/lib/account-api"

interface SidebarProps {
  topic: string
  setTopic: (topic: string) => void
  onGenerate: () => void
  onExport: (format: "png" | "interactive") => void
  isGenerating: boolean
  onExampleTopic: (topic: string) => void
  isSettingsOpen: boolean
  layout: "right" | "bi" // Updated to only include right and bi
  setLayout: (layout: "right" | "bi") => void
  colorScheme: "default" | "vibrant" | "summer" | "monochrome"
  setColorScheme: (scheme: "default" | "vibrant" | "summer" | "monochrome") => void
  isAuthenticated: boolean
  accountEmail: string | null
  plan: "free" | "pro"
  monthlyMapsUsed: number
  monthlyMapsLimit: number | null
  savedMaps: SavedMindmap[]
  onLoadMindmap: (map: SavedMindmap) => void
  onOpenMapDetails: (map: SavedMindmap) => void
  onUpgrade: () => void
  onManageBilling: () => void
  isBillingBusy: boolean
}

export function Sidebar({
  topic,
  setTopic,
  onGenerate,
  onExport,
  isGenerating,
  onExampleTopic,
  isSettingsOpen,
  layout,
  setLayout,
  colorScheme,
  setColorScheme,
  isAuthenticated,
  accountEmail,
  plan,
  monthlyMapsUsed,
  monthlyMapsLimit,
  savedMaps,
  onLoadMindmap,
  onOpenMapDetails,
  onUpgrade,
  onManageBilling,
  isBillingBusy,
}: SidebarProps) {
  const MAX_CHARS = 90
  const [charCount, setCharCount] = useState(0)

  // Updated example topics - two longer, more detailed options
  const exampleTopics = ["Personal finance guide for teens", "Plan a trip to Madrid, Spain"]

  // Color scheme preview swatches
  const colorSwatches = {
    default: ["#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
    vibrant: ["#EF476F", "#FFD166", "#118AB2", "#06D6A0"],
    summer: ["#70D6FF", "#FF70A6", "#FFD670", "#E9FF70"],
    monochrome: ["#00A6FB", "#0582CA", "#006494", "#003554"],
  }

  // Update character count when topic changes
  useEffect(() => {
    setCharCount(topic.length)
  }, [topic])

  // Node interactions are handled in the right-side panel.

  // Handle input change with character limit
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_CHARS) {
      setTopic(newValue)
    }
  }

  // Add a keydown handler to the input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isGenerating && topic.trim() && topic.length <= MAX_CHARS) {
      e.preventDefault()
      onGenerate()
    }
  }

  return (
    <div className="w-full min-w-0 border-r border-border bg-card p-4 overflow-y-auto h-full">
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Generate a Mind Map</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="topic" className="text-sm font-medium">
              Enter a topic
            </label>
            <div className="relative">
              <Input
                id="topic"
                value={topic}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g., how to budget"
                maxLength={MAX_CHARS}
                style={{ fontSize: "16px" }} // Add explicit font size to prevent zoom
              />
            </div>
          </div>

          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={onGenerate}
            disabled={isGenerating || charCount === 0 || charCount > MAX_CHARS}
          >
            {isGenerating ? "Generating..." : "Generate Mind Map"}
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">Example topics:</p>
            <div className="grid grid-cols-1 gap-2">
              {exampleTopics.map((exampleTopic) => (
                <Button
                  key={exampleTopic}
                  variant="outline"
                  size="sm"
                  onClick={() => onExampleTopic(exampleTopic)}
                  className="text-sm md:text-xs px-3 py-1.5 h-auto min-h-[2.5rem] justify-center text-center whitespace-normal"
                >
                  {exampleTopic}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Account & Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isAuthenticated ? (
            <>
              <p className="text-xs text-muted-foreground truncate">{accountEmail || "Signed in"}</p>
              <p className="text-sm">
                Plan: <span className="font-semibold uppercase">{plan}</span>
              </p>
              <p className="text-sm">
                Usage this month:{" "}
                <span className="font-semibold">
                  {monthlyMapsUsed}
                  {monthlyMapsLimit === null ? " / Unlimited" : ` / ${monthlyMapsLimit}`}
                </span>
              </p>
              {plan === "free" ? (
                <Button onClick={onUpgrade} disabled={isBillingBusy} className="w-full">
                  {isBillingBusy ? "Opening checkout..." : "Upgrade to Pro"}
                </Button>
              ) : (
                <Button variant="outline" onClick={onManageBilling} disabled={isBillingBusy} className="w-full">
                  {isBillingBusy ? "Opening..." : "Manage Billing"}
                </Button>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Sign in to save maps and track your free 3 maps/month usage.
              </p>
              <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/auth")}>
                Sign In / Sign Up
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Saved Maps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-52 overflow-y-auto">
          {!isAuthenticated ? (
            <p className="text-xs text-muted-foreground">Sign in to save and reopen your maps.</p>
          ) : savedMaps.length === 0 ? (
            <p className="text-xs text-muted-foreground">No maps yet. Generate your first map.</p>
          ) : (
            savedMaps.map((map) => (
              <div
                key={map.id}
                className="rounded-md border border-border p-2"
              >
                <button
                  className="w-full text-left hover:bg-muted transition-colors rounded-sm p-1"
                  onClick={() => onLoadMindmap(map)}
                >
                  <p className="text-sm font-medium truncate">{map.topic}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(map.updated_at).toLocaleDateString()}
                  </p>
                </button>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs w-full" onClick={() => onOpenMapDetails(map)}>
                    Manage
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Mobile-only navigation buttons */}
      <div className="md:hidden mb-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/how-to", "_blank")}
            className="text-sm px-3 py-2 h-auto justify-center text-center"
          >
            📚 How-to Guide
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/examples", "_blank")}
            className="text-sm px-3 py-2 h-auto justify-center text-center"
          >
            💡 Use Case Examples
          </Button>
        </div>
      </div>

      {/* Settings and Export - moved to bottom for mobile */}
      <div className="mt-auto">
        {/* Desktop-only layout selector */}
        <div className="hidden md:block mb-4">
          <Card>
            <CardContent className="pt-4">
              <RadioGroup
                value={layout}
                onValueChange={(value) => setLayout(value as any)}
                className="flex justify-between w-full"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="right" id="right" />
                  <Label htmlFor="right">Right</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bi" id="bi" />
                  <Label htmlFor="bi">Bidirectional</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Color selector - no card wrapper, larger size */}
        <div className="mb-4">
          <Select value={colorScheme} onValueChange={(value) => setColorScheme(value as any)}>
            <SelectTrigger className="w-full h-12 px-3 text-sm md:text-base">
              <div className="flex items-center justify-center w-full">
                <SelectValue placeholder="Select a color scheme" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(colorSwatches).map(([scheme, colors]) => (
                <SelectItem key={scheme} value={scheme}>
                  <div className="flex items-center justify-center w-full">
                    <span className="mr-2">{scheme.charAt(0).toUpperCase() + scheme.slice(1)}</span>
                    <div className="flex">
                      {colors.map((color, i) => (
                        <div key={i} className="w-3 h-3 rounded-sm ml-1" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Export Options:</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => onExport("interactive")}
              className="flex items-center justify-center"
            >
              <Download className="mr-2 h-4 w-4" />
              HTML
            </Button>
            <Button variant="outline" onClick={() => onExport("png")} className="flex items-center justify-center">
              <FileImage className="mr-2 h-4 w-4" />
              PNG
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
