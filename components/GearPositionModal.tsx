"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GearWithPosition {
  id: string
  name: string
  units: number
  color: string
  type: string
  rackPosition: number
  widthFraction?: number
  slotPosition?: number
}

interface GearPositionModalProps {
  gear: GearWithPosition
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
  const [selectedPosition, setSelectedPosition] = useState(gear.rackPosition)

  const handleMove = () => {
    if (isPositionFree(selectedPosition, gear.units, gear.id)) {
      onMove(selectedPosition)
    }
  }

  const positions = Array.from({ length: rackUnits - gear.units + 1 }, (_, i) => i + 1)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="bg-gray-800 border-gray-700 w-96">
        <CardHeader>
          <CardTitle className="text-white">Move {gear.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-gray-300 text-sm">Select new position for this {gear.units}U item:</div>

          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {positions.map((position) => {
              const isFree = isPositionFree(position, gear.units, gear.id)
              const isCurrent = position === gear.rackPosition

              return (
                <button
                  key={position}
                  onClick={() => setSelectedPosition(position)}
                  disabled={!isFree && !isCurrent}
                  className={`
                    p-2 rounded text-sm font-medium transition-colors
                    ${
                      selectedPosition === position
                        ? "bg-blue-600 text-white"
                        : isFree || isCurrent
                          ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                          : "bg-gray-800 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  {position}U{isCurrent && <div className="text-xs">Current</div>}
                  {!isFree && !isCurrent && <div className="text-xs">Blocked</div>}
                </button>
              )
            })}
          </div>

          <div className="flex justify-between">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={
                !isPositionFree(selectedPosition, gear.units, gear.id) && selectedPosition !== gear.rackPosition
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              Move to {selectedPosition}U
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
