"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface QuotaPaywallModalProps {
  isOpen: boolean
  onClose: () => void
  monthlyMapsUsed: number
  monthlyMapsLimit: number | null
  onUpgrade: () => void
  isBillingBusy: boolean
}

export function QuotaPaywallModal({
  isOpen,
  onClose,
  monthlyMapsUsed,
  monthlyMapsLimit,
  onUpgrade,
  isBillingBusy,
}: QuotaPaywallModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Free Plan Limit Reached</DialogTitle>
          <DialogDescription>
            You used {monthlyMapsUsed}
            {monthlyMapsLimit === null ? " maps." : ` of ${monthlyMapsLimit} free maps this month.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Upgrade to Pro for unlimited map generation, deep dives, and continuous learning workflows.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onClose}>
              Later
            </Button>
            <Button onClick={onUpgrade} disabled={isBillingBusy}>
              {isBillingBusy ? "Opening..." : "Upgrade to Pro"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
