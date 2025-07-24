"use client"

import React, { forwardRef } from "react"
import GearPositionModal from "./GearPositionModal"

const RACK_UNIT_HEIGHT = 44
const RACK_WIDTH = 482

interface GearWithPosition {
  id: string
  name: string
  units: number
  color: string
  type: string
  category?: string
  slots?: number
  modules?: any[]
  image?: string
  rackPosition: number
  widthFraction?: number
  slotPosition?: number
}

interface RackDisplayProps {
  gear: GearWithPosition[]
  label: string
  rackUnits: number
  onRemoveGear: (id: string) => void
  onMouseDownItem: (e: React.MouseEvent, id: string) => void
  onMoveGear: (gearId: string, newPosition: number) => void
  hoveredItem: string | null
  setHoveredItem: (id: string | null) => void
  removeModuleFromChassis: (chassisId: string, slotIndex: number) => void
  handleModuleMouseDown: (e: React.MouseEvent, chassisId: string, slotIndex: number) => void
  handleModuleMouseUp: (e: React.MouseEvent, chassisId: string, slotIndex: number) => void
  handleEditModule: (chassisId: string, slotIndex: number, name: string) => void
  draggedModule: any
  draggedModuleInfo: any
  setEditingModule: (module: any) => void
  editingModule: any
  racks: any[]
  currentRackId: string | null
  draggedItem: any
  draggedOverSlot: number | null
  setDraggedOverSlot: (slot: number | null) => void
  isPositionFree: (start: number, units: number, excludeId?: string) => boolean
}

const RackDisplay = forwardRef<HTMLDivElement, RackDisplayProps>(
  (
    {
      gear,
      label,
      rackUnits,
      onRemoveGear,
      onMouseDownItem,
      onMoveGear,
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
      setDraggedOverSlot,
      isPositionFree,
    },
    ref,
  ) => {
    const [showPositionModal, setShowPositionModal] = React.useState(false)
    const [selectedGear, setSelectedGear] = React.useState<GearWithPosition | null>(null)

    const calculateGearPosition = (rackUnit: number) => {
      return (rackUnit - 1) * RACK_UNIT_HEIGHT
    }

    // Updated width calculation for clean fractional spacing
    const getItemWidth = (item: GearWithPosition) => {
      const RACK_WIDTH = 482 // Use the actual rack container width
      return RACK_WIDTH * (item.widthFraction || 1)
    }

    // Updated left position calculation for clean alignment
    const getItemLeft = (item: GearWithPosition) => {
      return (item.slotPosition || 0) * getItemWidth({ ...item, widthFraction: item.widthFraction })
    }

    // Updated drag handler using the corrected conversion utility
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const rackContainer = e.currentTarget
      const rect = rackContainer.getBoundingClientRect()
      const mouseY = e.clientY - rect.top

      // Direct calculation with unified system
      const rawPosition = Math.floor(mouseY / RACK_UNIT_HEIGHT)
      const rackPosition = rawPosition + 1 // Convert to 1-based index

      // Clamp to valid units
      const targetPosition = Math.max(1, Math.min(rackUnits, rackPosition))

      // Debug logging
      console.log(`Drag: mouseY=${mouseY}, ` + `rawPos=${rawPosition}, ` + `targetPos=${targetPosition}`)

      setDraggedOverSlot(targetPosition)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      // Only clear if we're leaving the rack container itself
      if (e.currentTarget === e.target) {
        setDraggedOverSlot(null)
      }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()

      if (draggedItem && draggedOverSlot && onMoveGear) {
        const isValid = isPositionFree(draggedOverSlot, draggedItem.gear.units, draggedItem.gear.id)
        if (isValid) {
          onMoveGear(draggedItem.gear.id, draggedOverSlot)
        }
      }

      setDraggedOverSlot(null)
    }

    const renderGearItem = (item: GearWithPosition) => {
      const position = calculateGearPosition(item.rackPosition)

      if (item.type === "chassis") {
        return (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onMouseDown={(e) => onMouseDownItem(e, item.id)}
            style={{
              position: "absolute",
              top: `${position}px`,
              left: 0,
              right: 0,
              height: `${item.units * RACK_UNIT_HEIGHT}px`,
              cursor: "grab",
            }}
          >
            <div
              style={{
                paddingLeft: "20px",
                paddingRight: "20px",
                width: "100%",
                height: "100%",
                border: "2px solid #444",
                background: "#1a1a1a",
                display: "flex",
                flexDirection: "column",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  color: "white",
                  fontWeight: "bold",
                  padding: "8px 0",
                  textAlign: "center",
                  fontSize: "0.9em",
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  gap: "2px",
                  minHeight: "60px",
                }}
              >
                {item.modules?.map((module, idx) => (
                  <div
                    key={idx}
                    onMouseDown={(e) => handleModuleMouseDown(e, item.id, idx)}
                    onMouseUp={(e) => handleModuleMouseUp(e, item.id, idx)}
                    style={{
                      flex: 1,
                      background: module ? "#7c3aed" : "#2d2d2d",
                      border: "1px solid #666",
                      borderRadius: "3px",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "80%",
                      fontSize: "0.6em",
                      padding: "2px",
                      cursor: module ? "grab" : "default",
                    }}
                  >
                    {module ? module.name.split(" ")[0] : "Empty"}
                  </div>
                ))}
              </div>

              {hoveredItem === item.id && (
                <button
                  onClick={() => onRemoveGear(item.id)}
                  className="absolute top-2 right-2 bg-transparent text-white hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )
      }

      return (
        <div
          key={item.id}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          onMouseDown={(e) => onMouseDownItem(e, item.id)}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${position}px`,
            height: `${item.units * RACK_UNIT_HEIGHT}px`,
            cursor: "grab",
          }}
        >
          <div
            style={{
              width: `${getItemWidth(item)}px`,
              height: "100%",
              backgroundColor: item.color,
              borderRadius: "8px",
              border: "2px solid #444",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
              position: "absolute",
              left: `${getItemLeft(item)}px`,
              top: 0,
              margin: 0,
              padding: 0,
            }}
          >
            <div
              style={{
                fontSize: item.widthFraction ? "0.6em" : "0.8em",
                textAlign: "center",
                padding: "0 8px",
                wordWrap: "break-word",
                maxWidth: "100%",
              }}
            >
              {item.name}
            </div>

            {hoveredItem === item.id && (
              <button
                onClick={() => onRemoveGear(item.id)}
                className="absolute top-2 right-2 bg-black bg-opacity-70 text-white hover:text-red-500 text-xl rounded-full w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )
    }

    const rackLayout = Array.from({ length: rackUnits }, (_, i) => ({
      position: i + 1, // 1-based index
      y: i * RACK_UNIT_HEIGHT,
    }))

    return (
      <>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">{label}</h2>
          <div className="flex justify-center">
            <div style={{ position: "relative" }}>
              {/* Unit labels */}
              <div
                className="absolute text-right"
                style={{
                  left: "-60px",
                  top: 0,
                  height: RACK_UNIT_HEIGHT * rackUnits,
                  width: "50px",
                }}
              >
                {rackLayout.map((s) => (
                  <div
                    key={`left-${s.position}`}
                    style={{
                      height: RACK_UNIT_HEIGHT,
                      lineHeight: `${RACK_UNIT_HEIGHT}px`,
                    }}
                    className="text-gray-400 font-mono text-sm font-bold flex items-center justify-end"
                  >
                    {s.position}U
                  </div>
                ))}
              </div>

              <div
                className="absolute text-left"
                style={{
                  left: `${RACK_WIDTH + 20}px`,
                  top: 0,
                  height: RACK_UNIT_HEIGHT * rackUnits,
                  width: "50px",
                }}
              >
                {rackLayout.map((s) => (
                  <div
                    key={`right-${s.position}`}
                    style={{
                      height: RACK_UNIT_HEIGHT,
                      lineHeight: `${RACK_UNIT_HEIGHT}px`,
                    }}
                    className="text-gray-400 font-mono text-sm font-bold flex items-center"
                  >
                    {s.position}U
                  </div>
                ))}
              </div>

              {/* Rack */}
              <div
                ref={ref}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  width: RACK_WIDTH,
                  height: RACK_UNIT_HEIGHT * rackUnits,
                  border: "4px solid #111",
                  background: "#111",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23333333'/%3E%3C/svg%3E")`,
                  position: "relative",
                }}
                className="rounded-lg"
              >
                {/* Horizontal lines */}
                {Array.from({ length: rackUnits - 1 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      top: (i + 1) * RACK_UNIT_HEIGHT,
                    }}
                    className="absolute left-0 right-0 border-t border-gray-600"
                  />
                ))}

                {/* Drop zone indicators */}
                {draggedItem && draggedOverSlot && (
                  <div
                    style={{
                      position: "absolute",
                      top: `${calculateGearPosition(draggedOverSlot)}px`,
                      left: "0px",
                      right: "0px",
                      height: `${draggedItem.gear.units * RACK_UNIT_HEIGHT}px`,
                      border: "2px dashed #3b82f6",
                      borderRadius: "8px",
                      backgroundColor: isPositionFree(draggedOverSlot, draggedItem.gear.units, draggedItem.gear.id)
                        ? "rgba(59, 130, 246, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                      pointerEvents: "none",
                      zIndex: 1000,
                    }}
                  />
                )}

                {/* Gear items */}
                {gear.map((g) => renderGearItem(g))}

                {/* Empty state */}
                {gear.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-lg mb-2">Empty {label}</div>
                      <div className="text-sm">Add gear from the sidebar</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Position Modal */}
        {showPositionModal && selectedGear && (
          <GearPositionModal
            gear={selectedGear}
            rackUnits={rackUnits}
            onMove={(newPosition) => {
              onMoveGear(selectedGear.id, newPosition)
              setShowPositionModal(false)
              setSelectedGear(null)
            }}
            onClose={() => {
              setShowPositionModal(false)
              setSelectedGear(null)
            }}
            isPositionFree={isPositionFree}
          />
        )}
      </>
    )
  },
)

RackDisplay.displayName = "RackDisplay"

export default RackDisplay
