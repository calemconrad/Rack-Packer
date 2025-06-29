"use client"
import { forwardRef, useState } from "react"
import GearPositionModal from "./GearPositionModal"

const RACK_UNIT_HEIGHT = 44

// Calculate gear position based on rack unit (1 = bottom, higher = top)
const calculateGearPosition = (rackPosition, units, totalRackUnits) => {
  // Convert rack position to screen coordinates
  // Rack unit 1 should be at the bottom, so we need to invert
  const topPosition = (totalRackUnits - rackPosition - units + 1) * RACK_UNIT_HEIGHT
  return topPosition
}

const RackDisplay = forwardRef(
  (
    {
      gear,
      label,
      rackUnits,
      onRemoveGear,
      onMouseDownItem,
      hoveredItem,
      setHoveredItem,
      removeModuleFromChassis,
      handleModuleMouseDown,
      handleModuleMouseUp,
      handleEditModule,
      draggedModule,
      draggedModuleInfo,
      setEditingModule,
      editingModule,
      racks,
      currentRackId,
      draggedItem,
      draggedOverSlot,
      isPositionFree,
      onMoveGear,
    },
    ref,
  ) => {
    const [positionModal, setPositionModal] = useState({ isOpen: false, gear: null })
    const [dropZones, setDropZones] = useState([])
    const rackHeight = rackUnits * RACK_UNIT_HEIGHT

    // Get all occupied positions for the modal
    const getOccupiedPositions = () => {
      const occupied = []
      gear.forEach((item) => {
        for (let i = 0; i < item.units; i++) {
          occupied.push(item.rackPosition + i)
        }
      })
      return occupied
    }

    const handleMoveGearToPosition = (gearItem, newPosition) => {
      if (onMoveGear) {
        onMoveGear(gearItem.id, newPosition)
      }
      setPositionModal({ isOpen: false, gear: null })
    }

    const openPositionModal = (gearItem) => {
      setPositionModal({ isOpen: true, gear: gearItem })
    }

    // Handle drag over rack units
    const handleDragOver = (e, rackUnit) => {
      e.preventDefault()
      if (draggedItem) {
        // Check if this position is valid for the dragged item
        const isValid = isPositionFree(rackUnit, draggedItem.gear.units, draggedItem.gear.id)
        if (isValid) {
          e.dataTransfer.dropEffect = "move"
        } else {
          e.dataTransfer.dropEffect = "none"
        }
      }
    }

    // Handle drop on rack units
    const handleDrop = (e, rackUnit) => {
      e.preventDefault()
      if (draggedItem && onMoveGear) {
        const isValid = isPositionFree(rackUnit, draggedItem.gear.units, draggedItem.gear.id)
        if (isValid) {
          onMoveGear(draggedItem.gear.id, rackUnit)
        }
      }
    }

    return (
      <div className="flex flex-col items-center">
        {/* Label */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white text-center">{label}</h3>
          <div className="text-gray-400 text-sm text-center">{rackUnits}U Rack</div>
        </div>

        {/* Rack Container */}
        <div className="relative">
          {/* Rack Unit Labels (Left Side) */}
          <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-between">
            {Array.from({ length: rackUnits }).map((_, i) => (
              <div
                key={`left-${i}`}
                className="text-sm font-mono text-gray-500 flex items-center justify-end"
                style={{
                  height: `${RACK_UNIT_HEIGHT}px`,
                  lineHeight: `${RACK_UNIT_HEIGHT}px`,
                }}
              >
                {rackUnits - i}U
              </div>
            ))}
          </div>

          {/* Rack Unit Labels (Right Side) */}
          <div className="absolute -right-12 top-0 bottom-0 flex flex-col justify-between">
            {Array.from({ length: rackUnits }).map((_, i) => (
              <div
                key={`right-${i}`}
                className="text-sm font-mono text-gray-500 flex items-center justify-start"
                style={{
                  height: `${RACK_UNIT_HEIGHT}px`,
                  lineHeight: `${RACK_UNIT_HEIGHT}px`,
                }}
              >
                {rackUnits - i}U
              </div>
            ))}
          </div>

          {/* Main Rack */}
          <div
            id="rack-display"
            ref={ref}
            className="relative bg-gray-900 border-4 border-gray-700 rounded-lg overflow-hidden"
            style={{
              width: "482px",
              height: `${rackHeight}px`,
              background: "#1a1a1a",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23374151'/%3E%3C/svg%3E")`,
            }}
          >
            {/* Horizontal rack unit lines with drop zones */}
            {Array.from({ length: rackUnits }).map((_, i) => {
              const rackUnit = rackUnits - i // Convert to rack unit number (top to bottom)
              const isDropTarget = draggedOverSlot === rackUnit
              const canDrop = draggedItem && isPositionFree(rackUnit, draggedItem.gear.units, draggedItem.gear.id)

              return (
                <div key={i}>
                  {/* Rack unit separator line */}
                  {i > 0 && (
                    <div
                      className="absolute left-0 right-0 border-t border-gray-700"
                      style={{ top: `${i * RACK_UNIT_HEIGHT}px` }}
                    />
                  )}

                  {/* Drop zone overlay */}
                  <div
                    className={`absolute left-0 right-0 transition-all duration-200 ${
                      isDropTarget && canDrop
                        ? "bg-blue-500 bg-opacity-30 border-2 border-blue-400 border-dashed"
                        : isDropTarget
                          ? "bg-red-500 bg-opacity-20 border-2 border-red-400 border-dashed"
                          : "hover:bg-blue-500 hover:bg-opacity-10"
                    }`}
                    style={{
                      top: `${i * RACK_UNIT_HEIGHT}px`,
                      height: `${RACK_UNIT_HEIGHT}px`,
                      zIndex: 1,
                    }}
                    onDragOver={(e) => handleDragOver(e, rackUnit)}
                    onDrop={(e) => handleDrop(e, rackUnit)}
                  >
                    {/* Drop zone indicator */}
                    {isDropTarget && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`text-sm font-medium px-2 py-1 rounded ${
                            canDrop ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                          }`}
                        >
                          {canDrop ? `Drop at ${rackUnit}U` : "Cannot place here"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Rack mounting holes */}
            <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around" style={{ zIndex: 2 }}>
              {Array.from({ length: rackUnits * 2 }).map((_, i) => (
                <div key={`hole-left-${i}`} className="w-2 h-2 bg-gray-600 rounded-full" />
              ))}
            </div>
            <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-around" style={{ zIndex: 2 }}>
              {Array.from({ length: rackUnits * 2 }).map((_, i) => (
                <div key={`hole-right-${i}`} className="w-2 h-2 bg-gray-600 rounded-full" />
              ))}
            </div>

            {/* Gear Items */}
            {gear.map((item) => {
              const topPosition = calculateGearPosition(item.rackPosition, item.units, rackUnits)
              const itemHeight = item.units * RACK_UNIT_HEIGHT
              const isHovered = hoveredItem === item.id
              const isDragged = draggedItem?.gear?.id === item.id

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    // Set drag data
                    e.dataTransfer.setData("text/plain", item.id)
                    e.dataTransfer.effectAllowed = "move"

                    // Trigger the existing mouse down handler for compatibility
                    onMouseDownItem(e, item.id)
                  }}
                  onMouseDown={(e) => onMouseDownItem(e, item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`absolute flex items-center justify-between text-white font-semibold text-center p-2 cursor-move transition-all select-none ${
                    isHovered ? "ring-2 ring-blue-400" : ""
                  } ${isDragged ? "opacity-50 z-50" : "z-10"}`}
                  style={{
                    left: item.widthFraction ? `${(item.slotPosition || 0) * (100 * item.widthFraction)}%` : "8px",
                    top: `${topPosition}px`,
                    width: item.widthFraction ? `${100 * item.widthFraction}%` : "466px",
                    height: `${itemHeight - 4}px`,
                    backgroundColor: item.color,
                    borderRadius: "6px",
                    border: "2px solid rgba(0,0,0,0.3)",
                    boxShadow: isDragged ? "0 8px 25px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {/* Gear Content */}
                  <div className="flex-1 flex items-center justify-center">
                    {item.image ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.target.style.display = "none"
                          }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </div>

                  {/* Position Indicator */}
                  <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {item.rackPosition}U
                  </div>

                  {/* Chassis Modules */}
                  {item.type === "chassis" && item.modules && (
                    <div className="flex gap-1 mr-2">
                      {item.modules.map((module, slotIndex) => (
                        <div
                          key={slotIndex}
                          className={`w-6 h-6 border border-gray-600 rounded text-xs flex items-center justify-center ${
                            module ? "bg-green-600" : "bg-gray-700"
                          }`}
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            if (module) {
                              handleModuleMouseDown(e, item.id, slotIndex)
                            }
                          }}
                          onMouseUp={(e) => {
                            e.stopPropagation()
                            handleModuleMouseUp(e, item.id, slotIndex)
                          }}
                          title={module ? module.name : "Empty slot"}
                        >
                          {module ? "M" : slotIndex + 1}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Control Buttons */}
                  <div className="flex gap-1 ml-2">
                    {/* Move Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openPositionModal(item)
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                      title="Move to position"
                    >
                      ↕
                    </button>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveGear(item.id)
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Drag Preview */}
            {draggedOverSlot && (
              <div
                className="absolute bg-blue-500 opacity-50 rounded"
                style={{
                  left: "8px",
                  top: `${calculateGearPosition(draggedOverSlot, draggedItem?.gear?.units || 1, rackUnits)}px`,
                  width: "466px",
                  height: `${(draggedItem?.gear?.units || 1) * RACK_UNIT_HEIGHT - 4}px`,
                }}
              />
            )}
          </div>
        </div>

        {/* Rack Info */}
        <div className="mt-4 text-center text-gray-400 text-sm">
          <div>
            {gear.length} items • {gear.reduce((sum, item) => sum + item.units, 0)}/{rackUnits}U used
          </div>
        </div>

        {/* Position Modal */}
        <GearPositionModal
          isOpen={positionModal.isOpen}
          onClose={() => setPositionModal({ isOpen: false, gear: null })}
          gear={positionModal.gear}
          rackUnits={rackUnits}
          currentPosition={positionModal.gear?.rackPosition || 1}
          onMove={(newPosition) => handleMoveGearToPosition(positionModal.gear, newPosition)}
          occupiedPositions={getOccupiedPositions()}
        />
      </div>
    )
  },
)

RackDisplay.displayName = "RackDisplay"

export default RackDisplay
