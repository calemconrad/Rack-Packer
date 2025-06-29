"use client"

import { useState } from "react"

interface GearPositionModalProps {
  isOpen: boolean
  onClose: () => void
  gear: any
  rackUnits: number
  currentPosition: number
  onMove: (newPosition: number) => void
  occupiedPositions: number[]
}

export default function GearPositionModal({
  isOpen,
  onClose,
  gear,
  rackUnits,
  currentPosition,
  onMove,
  occupiedPositions,
}: GearPositionModalProps) {
  const [selectedPosition, setSelectedPosition] = useState(currentPosition)

  if (!isOpen || !gear) return null

  // Check if a position is available for the gear
  const isPositionAvailable = (position: number) => {
    if (position < 1 || position + gear.units - 1 > rackUnits) return false

    // Check if any of the required positions are occupied (excluding current gear)
    for (let i = 0; i < gear.units; i++) {
      const checkPosition = position + i
      if (
        occupiedPositions.includes(checkPosition) &&
        !(checkPosition >= currentPosition && checkPosition < currentPosition + gear.units)
      ) {
        return false
      }
    }
    return true
  }

  // Get the positions this gear will occupy
  const getOccupiedRange = (position: number) => {
    const range = []
    for (let i = 0; i < gear.units; i++) {
      range.push(position + i)
    }
    return range
  }

  const handleMove = () => {
    if (isPositionAvailable(selectedPosition)) {
      onMove(selectedPosition)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Move {gear.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">Select a new position for this {gear.units}U gear item:</p>
          <p className="text-gray-400 text-xs">Rack units are numbered from bottom (1U) to top ({rackUnits}U)</p>
        </div>

        {/* Position Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {Array.from({ length: rackUnits }, (_, i) => {
            const position = rackUnits - i // Reverse order (top to bottom display)
            const isCurrentPosition = position >= currentPosition && position < currentPosition + gear.units
            const isAvailable = isPositionAvailable(position)
            const isSelected = position === selectedPosition
            const willOccupy = getOccupiedRange(selectedPosition).includes(position)

            return (
              <button
                key={position}
                onClick={() => isAvailable && setSelectedPosition(position)}
                disabled={!isAvailable}
                className={`
                  h-10 rounded text-sm font-medium transition-colors
                  ${
                    isCurrentPosition
                      ? "bg-blue-600 text-white"
                      : isSelected && willOccupy
                        ? "bg-green-600 text-white"
                        : isAvailable
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }
                `}
                title={
                  isCurrentPosition ? "Current position" : isAvailable ? `Move to ${position}U` : "Position blocked"
                }
              >
                {position}U
              </button>
            )
          })}
        </div>

        {/* Preview */}
        {selectedPosition !== currentPosition && (
          <div className="mb-4 p-3 bg-gray-700 rounded">
            <p className="text-sm text-gray-300">
              <strong>Preview:</strong> {gear.name} will occupy positions{" "}
              {getOccupiedRange(selectedPosition).join("U, ")}U
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleMove}
            disabled={!isPositionAvailable(selectedPosition) || selectedPosition === currentPosition}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded font-medium transition-colors"
          >
            Move to {selectedPosition}U
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-xs text-gray-400">
          <p>
            <span className="inline-block w-3 h-3 bg-blue-600 rounded mr-2"></span>Current position
          </p>
          <p>
            <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>Available positions
          </p>
          <p>
            <span className="inline-block w-3 h-3 bg-gray-600 rounded mr-2"></span>Blocked positions
          </p>
        </div>
      </div>
    </div>
  )
}
