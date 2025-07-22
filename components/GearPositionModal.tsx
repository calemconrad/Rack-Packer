"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GearPositionModalProps {
  gear: {
    id: string
    name: string
    units: number
    rackPosition: number
  } | null
  rackUnits: number
  onMove: (newPosition: number) => void
  onClose: () => void
  isPositionFree: (start: number, units: number, excludeId?: string) => boolean
}

export default function GearPositionModal({
  gear,
  rackUnits,
  onMove,
  onClose,
  isPositionFree,
}: GearPositionModalProps) {
  const [newPosition, setNewPosition] = useState(gear?.rackPosition || 1)

  if (!gear) return null

  const handleMove = () => {
    if (isPositionFree(newPosition, gear.units, gear.id)) {
      onMove(newPosition)
    }
  }

  const isValidPosition = isPositionFree(newPosition, gear.units, gear.id)
  const maxPosition = rackUnits - gear.units + 1

  return (
    <Dialog open={!!gear} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move {gear.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">Rack Position (1U = bottom)</Label>
            <Input
              id="position"
              type="number"
              min={1}
              max={maxPosition}
              value={newPosition}
              onChange={(e) => setNewPosition(Number.parseInt(e.target.value) || 1)}
              className={!isValidPosition ? "border-red-500" : ""}
            />
            {!isValidPosition && (
              <p className="text-sm text-red-500">
                Position {newPosition} is not available for a {gear.units}U item
              </p>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <p>
              Item: {gear.name} ({gear.units}U)
            </p>
            <p>Current position: {gear.rackPosition}U</p>
            <p>Valid range: 1U - {maxPosition}U</p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleMove} disabled={!isValidPosition}>
              Move to {newPosition}U
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
