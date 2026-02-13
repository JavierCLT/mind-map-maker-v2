"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden border-b border-border bg-background">
      <nav className="flex px-4 py-3 space-x-6">
        <Link
          href="/how-to"
          className={`text-sm font-medium transition-colors ${
            pathname === "/how-to"
              ? "text-primary border-b-2 border-primary pb-1"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          How-to Guide
        </Link>
        <Link
          href="/examples"
          className={`text-sm font-medium transition-colors ${
            pathname === "/examples"
              ? "text-primary border-b-2 border-primary pb-1"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Use Case Examples
        </Link>
      </nav>
    </div>
  )
}
