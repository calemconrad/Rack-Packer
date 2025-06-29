"use client"

import type React from "react"
import Image from "next/image"

const RACK_UNIT_HEIGHT = 44 // Standard 1U = 44px

// Fix the Y-position calculation for gear items
const calculateGearPosition = (rackUnit: number, rackSize: number) => {
  // Rack units are numbered from bottom (1U) to top (4U, 8U, etc.)
  // But screen Y coordinates start from top (0) to bottom
  const yPosition = (rackSize - rackUnit) * RACK_UNIT_HEIGHT
  return yPosition
}

interface GearItemProps {
  item: any
  onRemove: (gearId: string) => void
  onMouseDown?: (e: React.MouseEvent, gearId: string) => void
  isDragging?: boolean
  hoveredItem?: string | null
  setHoveredItem?: (id: string | null) => void
  removeModuleFromChassis?: (chassisId: string, moduleSlotIndex: number) => void
  handleModuleMouseDown?: (e: React.MouseEvent, chassisId: string, slotIndex: number) => void
  handleModuleMouseUp?: (e: React.MouseEvent, chassisId: string, slotIndex: number) => void
  handleEditModule?: (chassisId: string, slotIndex: number, currentName: string) => void
  setEditingModule?: (editingModule: any) => void
  editingModule?: any
  draggedModule?: any
  draggedModuleInfo?: any
  position: number // Y position in pixels
  racks: any // Declare racks variable
  currentRackId: string // Declare currentRackId variable
}

const RACK_WIDTH = 482

export default function GearItem({
  item,
  onRemove,
  onMouseDown,
  isDragging = false,
  hoveredItem,
  setHoveredItem,
  removeModuleFromChassis,
  handleModuleMouseDown,
  handleModuleMouseUp,
  handleEditModule,
  draggedModule,
  draggedModuleInfo,
  position, // This will be overridden by calculated position
  setEditingModule,
  editingModule,
  racks,
  currentRackId,
}: GearItemProps) {
  // Calculate proper Y position based on rack unit
  const currentRack = racks?.find((r) => r.id === currentRackId)
  const calculatedPosition =
    currentRack && item.rackPosition ? calculateGearPosition(item.rackPosition, currentRack.units) : position

  // Calculate width and position for fractional width items
  const getItemWidth = () => {
    if (item.widthFraction) {
      const fullWidth = 458 // GEAR_WIDTH from RackDisplay (482 - 24px padding)
      return fullWidth * item.widthFraction
    }
    return "100%" // Full width for standard items
  }

  const getItemLeft = () => {
    if (item.widthFraction && typeof item.slotPosition === "number") {
      const fullWidth = 458
      const itemWidth = fullWidth * item.widthFraction
      const slotWidth = fullWidth / Math.floor(1 / item.widthFraction)
      return item.slotPosition * slotWidth
    }
    return 0
  }

  // Render chassis with modules
  if (item.type === "chassis") {
    const numSlots = item.slots || 10
    const slotGap = 2 // px gap between slots

    return (
      <div
        key={item.id}
        className="chassis"
        onMouseDown={(e) => onMouseDown?.(e, item.id)}
        onMouseEnter={() => setHoveredItem?.(item.id)}
        onMouseLeave={() => setHoveredItem?.(null)}
        style={{
          position: "absolute",
          top: `${calculatedPosition}px`,
          left: 0,
          right: 0,
          height: `${item.units * RACK_UNIT_HEIGHT}px`,
        }}
      >
        <div
          className="rack-gear-placeholder"
          style={{
            paddingLeft: "20px",
            paddingRight: "20px",
            boxSizing: "border-box",
            width: "100%",
            height: "100%",
            border: "2px solid #444",
            background: "#1a1a1a",
            display: "flex",
            flexDirection: "column",
            cursor: "move",
            zIndex: isDragging ? 100 : 10,
            borderRadius: "8px",
            boxShadow: isDragging ? "0 0 10px 3px rgba(37, 99, 235, 0.7)" : "0 4px 6px rgba(0,0,0,0.3)",
            transition: "all 0.2s ease",
            opacity: isDragging ? 0.9 : 1,
            outline: "none",
          }}
        >
          <div
            className="chassis-label"
            style={{
              color: "white",
              fontWeight: "bold",
              padding: "8px 0",
              textAlign: "center",
              fontSize: "0.9em",
              flexShrink: 0,
            }}
          >
            {item.name}
          </div>

          <div
            className="modules-row"
            style={{
              display: "flex",
              flexDirection: "row",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              gap: `${slotGap}px`,
              minHeight: "60px",
            }}
          >
            {item.modules?.map((module, idx) => {
              const isEditing = editingModule?.chassisId === item.id && editingModule?.slotIndex === idx
              const isSourceSlot = draggedModuleInfo?.chassisId === item.id && draggedModuleInfo?.slotIndex === idx
              const isDraggedModule = draggedModule && module && draggedModule.id === module.id

              return (
                <div
                  key={idx}
                  className="module-slot"
                  onMouseDown={(e) => !isEditing && handleModuleMouseDown?.(e, item.id, idx)}
                  onMouseUp={(e) => !isEditing && handleModuleMouseUp?.(e, item.id, idx)}
                  style={{
                    flex: 1,
                    background: module ? "#7c3aed" : "#2d2d2d",
                    border: isSourceSlot ? "2px solid #3b82f6" : "1px solid #666",
                    borderRadius: "3px",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "80%",
                    cursor: module && !isEditing ? "move" : "default",
                    fontSize: "0.6em",
                    padding: "2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    opacity: isDraggedModule ? 0.8 : 1,
                    position: "relative",
                  }}
                >
                  {module ? (
                    <>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingModule?.name || module.name}
                          onChange={(e) => setEditingModule({ ...editingModule, name: e.target.value })}
                          onBlur={() => {
                            if (editingModule?.name) {
                              handleEditModule?.(item.id, idx, editingModule.name)
                            }
                            setEditingModule(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.target.blur()
                            } else if (e.key === "Escape") {
                              setEditingModule(null)
                            }
                          }}
                          autoFocus
                          style={{
                            width: "90%",
                            background: "#111",
                            color: "#fff",
                            border: "1px solid #666",
                            borderRadius: "3px",
                            padding: "2px",
                            fontSize: "0.6em",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            lineHeight: "1",
                            width: "100%",
                          }}
                        >
                          <div>{module.name.split(" ")[0]}</div>
                          <div style={{ fontSize: "0.8em", opacity: 0.8 }}>
                            {module.name.split(" ")[1]?.substring(0, 4)}
                          </div>
                        </div>
                      )}
                      <div
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          display: "flex",
                          gap: "2px",
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingModule({ chassisId: item.id, slotIndex: idx, name: module.name })
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          style={{
                            background: "#333",
                            color: "#fff",
                            border: "none",
                            borderRadius: "3px",
                            fontSize: "0.5em",
                            padding: "1px 3px",
                            cursor: "pointer",
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeModuleFromChassis?.(item.id, idx)
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          style={{
                            background: "#333",
                            color: "#fff",
                            border: "none",
                            borderRadius: "3px",
                            fontSize: "0.5em",
                            padding: "1px 3px",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        opacity: 0.5,
                        fontSize: "0.5em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        width: "100%",
                      }}
                    >
                      Empty
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Remove chassis button on hover */}
          {hoveredItem === item.id && !isDragging && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item.id)
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute top-2 right-2 bg-transparent text-white hover:text-red-500 text-xl"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    )
  }

  // Render standard gear items (with fractional width support)
  return (
    <div
      onMouseDown={(e) => onMouseDown?.(e, item.id)}
      onMouseEnter={() => setHoveredItem?.(item.id)}
      onMouseLeave={() => setHoveredItem?.(null)}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: `${calculatedPosition}px`,
        height: `${item.units * RACK_UNIT_HEIGHT}px`,
      }}
    >
      <div
        className="rack-gear-placeholder"
        style={{
          paddingLeft: "20px",
          paddingRight: "20px",
          boxSizing: "border-box",
          width: item.widthFraction ? `${getItemWidth()}px` : "100%",
          height: "100%",
          backgroundColor: item.image ? "#000" : item.color,
          borderRadius: "8px",
          border: "2px solid #444",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "move",
          zIndex: isDragging ? 100 : 10,
          boxShadow: isDragging ? "0 0 10px 3px rgba(37, 99, 235, 0.7)" : "0 4px 6px rgba(0,0,0,0.3)",
          transition: "all 0.2s ease",
          opacity: isDragging ? 0.9 : 1,
          outline: "none",
          overflow: "hidden",
          position: "relative",
          left: item.widthFraction ? `${getItemLeft()}px` : "0",
          marginLeft: item.widthFraction ? "20px" : "0", // Account for container padding
        }}
      >
        {/* Equipment image or content */}
        {item.image ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-cover"
              style={{
                objectFit: "cover",
                borderRadius: "6px",
              }}
              draggable={false}
            />
          </div>
        ) : (
          // For non-image items, center the text completely
          <div
            className="gear-name"
            style={{
              fontSize: item.widthFraction ? "0.6em" : "0.8em", // Smaller text for fractional items
              textAlign: "center",
              padding: "0 8px",
              wordWrap: "break-word",
              maxWidth: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            {item.name}
          </div>
        )}

        {/* Remove button on hover */}
        {hoveredItem === item.id && !isDragging && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(item.id)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 bg-black bg-opacity-70 text-white hover:text-red-500 text-xl rounded-full w-6 h-6 flex items-center justify-center z-20"
          >
            ✕
          </button>
        )}

        {/* Width and slot indicators for fractional items */}
        {item.widthFraction && (
          <div className="absolute bottom-1 left-1 flex gap-1">
            <div className="bg-black bg-opacity-70 text-white text-xs px-1 rounded" style={{ fontSize: "0.6em" }}>
              {Math.round(item.widthFraction * 100)}%
            </div>
            {typeof item.slotPosition === "number" && (
              <div className="bg-blue-600 bg-opacity-70 text-white text-xs px-1 rounded" style={{ fontSize: "0.6em" }}>
                Slot {item.slotPosition + 1}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
