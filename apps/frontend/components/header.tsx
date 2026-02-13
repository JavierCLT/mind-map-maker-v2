"use client"

import { Button } from "../components/ui/button"
import { Menu, Info, Network } from "lucide-react"
import { useState } from "react"
import { InfoModal } from "./info-modal"
import { ModeToggle } from "./mode-toggle"
import Link from "next/link"
import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"

interface HeaderProps {
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

export function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-2 relative"
          data-sidebar-trigger="true"
          aria-label="Toggle sidebar"
          aria-expanded={isSidebarOpen}
        >
          <Menu className={`h-5 w-5 transition-transform ${isSidebarOpen ? "" : "rotate-90"}`} />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex items-center">
          <Network className="mr-2 h-5 w-5 text-primary" />
          <Link href="/" className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
            Mind Map Maker
          </Link>
          <nav className="hidden md:flex ml-8 space-x-6">
            <Link href="/how-to" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              How-to Guide
            </Link>
            <Link href="/examples" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Use Case Examples
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!loading && (
            user ? (
              <>
                <span className="hidden md:inline text-xs text-muted-foreground max-w-40 truncate">{user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await signOut()
                    router.push("/")
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => router.push("/auth")}>
                Sign in
              </Button>
            )
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsInfoModalOpen(true)}>
            <Info className="h-5 w-5" />
            <span className="sr-only">Info</span>
          </Button>
          <ModeToggle />
        </div>
      </div>
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </header>
  )
}
