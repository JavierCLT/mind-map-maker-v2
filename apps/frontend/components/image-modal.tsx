"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  images: Array<{
    src: string
    alt: string
    title: string
  }>
  currentIndex: number
  onNavigate: (index: number) => void
}

export function ImageModal({ isOpen, onClose, images, currentIndex, onNavigate }: ImageModalProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  const currentImage = images[currentIndex]

  // Reset zoom and position when image changes
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  // Prevent browser zoom when modal is open
  useEffect(() => {
    if (!isOpen) return

    const preventBrowserZoom = (e: WheelEvent) => {
      // Prevent browser zoom on Ctrl+wheel or trackpad pinch
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }

    const preventKeyboardZoom = (e: KeyboardEvent) => {
      // Prevent Ctrl/Cmd + +/- zoom
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "0")) {
        e.preventDefault()
      }
    }

    // Add event listeners to document to catch all zoom attempts
    document.addEventListener("wheel", preventBrowserZoom, { passive: false })
    document.addEventListener("keydown", preventKeyboardZoom)

    return () => {
      document.removeEventListener("wheel", preventBrowserZoom)
      document.removeEventListener("keydown", preventKeyboardZoom)
    }
  }, [isOpen])

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if Ctrl/Cmd is pressed (we're preventing those above)
      if (e.ctrlKey || e.metaKey) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          if (currentIndex > 0) onNavigate(currentIndex - 1)
          break
        case "ArrowRight":
          if (currentIndex < images.length - 1) onNavigate(currentIndex + 1)
          break
        case "+":
        case "=":
          handleZoomIn()
          break
        case "-":
          handleZoomOut()
          break
        case "0":
          handleReset()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, images.length, onClose, onNavigate])

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.1, 5)) // Reduced from 1.2 to 1.1
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.1, 0.1)) // Reduced from 1.2 to 1.1
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging if we're clicking on the image and it's zoomed
    if (scale > 1 && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect()
      const isClickOnImage =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom

      if (isClickOnImage) {
        setIsDragging(true)
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        })
        e.preventDefault()
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    // Handle trackpad pinch (Ctrl+wheel) and regular wheel
    const isTrackpadPinch = e.ctrlKey || e.metaKey

    // Slower zoom for better control
    const zoomFactor = isTrackpadPinch ? 1.05 : 1.08 // Even slower for trackpad pinch
    const delta = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor

    setScale((prev) => Math.min(Math.max(prev * delta, 0.1), 5))
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = currentImage.src
    link.download = `${currentImage.title.replace(/\s+/g, "-").toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    // Check if the click is outside the image bounds
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect()
      const isClickOutsideImage =
        e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom

      if (isClickOutsideImage && !isDragging) {
        onClose()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="text-white">
            <h3 className="font-semibold">{currentImage.title}</h3>
            <p className="text-sm text-gray-300">
              {currentIndex + 1} of {images.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} className="text-white hover:bg-white/20">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} className="text-white hover:bg-white/20">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-white hover:bg-white/20">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="text-white hover:bg-white/20">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="lg"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(currentIndex - 1)
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {currentIndex < images.length - 1 && (
        <Button
          variant="ghost"
          size="lg"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(currentIndex + 1)
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Image Container */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleContainerClick}
        style={{ cursor: isDragging ? "grabbing" : scale > 1 ? "grab" : "default" }}
      >
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <img
            ref={imageRef}
            src={currentImage.src || "/placeholder.svg"}
            alt={currentImage.alt}
            className="max-w-[90vw] max-h-[80vh] object-contain select-none"
            draggable={false}
            onLoad={() => {
              // Reset position when image loads
              setPosition({ x: 0, y: 0 })
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center">
        <p>Use trackpad pinch or mouse wheel to zoom • Drag to pan • Arrow keys to navigate • ESC to close</p>
      </div>
    </div>
  )
}
