"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Linkedin } from "lucide-react"
import { Button } from "../components/ui/button"

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About Mind Map Maker</DialogTitle>
          <DialogDescription>An AI-powered mind map application to visualize and organize ideas.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">How to use:</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Enter a topic in the sidebar and click "Generate Mind Map"</li>
              <li>Choose from example topics for quick generation</li>
              <li>Select different layouts and color schemes</li>
              <li>Export your mind map as PNG or interactive HTML</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Features:</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>AI-powered mind map generation. It can make mistakes</li>
              <li>Multiple layout options</li>
              <li>Customizable color schemes</li>
              <li>Interactive visualization</li>
              <li>Export capabilities</li>
              <li>Dark/light mode support</li>
            </ul>
          </div>
          <div className="pt-2 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => window.open("https://www.linkedin.com/in/javiersz/", "_blank")}
            >
              <Linkedin className="h-4 w-4" />
              Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
