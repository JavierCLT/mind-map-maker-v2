"use client"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Label } from "../components/ui/label"
import { X } from "lucide-react"

interface MindmapSettingsProps {
  layout: "right" | "down" | "bi" | "radial"
  setLayout: (layout: "right" | "down" | "bi" | "radial") => void
  colorScheme: "default" | "vibrant" | "pastel" | "monochrome"
  setColorScheme: (scheme: "default" | "vibrant" | "pastel" | "monochrome") => void
  onClose: () => void
  position?: "left" | "right"
}

export function MindmapSettings({
  layout,
  setLayout,
  colorScheme,
  setColorScheme,
  onClose,
  position = "left",
}: MindmapSettingsProps) {
  return (
    <Card className={`absolute top-4 ${position === "left" ? "left-4" : "right-4"} z-10 w-72`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md">Mindmap Settings</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Layout Direction</h3>
          <RadioGroup
            value={layout}
            onValueChange={(value) => setLayout(value as any)}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="right" id="right" />
              <Label htmlFor="right">Right</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="down" id="down" />
              <Label htmlFor="down">Down</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bi" id="bi" />
              <Label htmlFor="bi">Bidirectional</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="radial" id="radial" />
              <Label htmlFor="radial">Radial</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Color Scheme</h3>
          <RadioGroup
            value={colorScheme}
            onValueChange={(value) => setColorScheme(value as any)}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="default" />
              <Label htmlFor="default">Default</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vibrant" id="vibrant" />
              <Label htmlFor="vibrant">Vibrant</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pastel" id="pastel" />
              <Label htmlFor="pastel">Pastel</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monochrome" id="monochrome" />
              <Label htmlFor="monochrome">Monochrome</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}
