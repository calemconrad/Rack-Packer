"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import RackSidebar from "./RackSidebar"
import RackDisplay from "./RackDisplay"

import { getWeightWarnings, calculateTotalWeight } from "@/utils/weightCalculator"
import { useRackConfig } from "@/hooks/useRackConfig"
import { addModuleToChassis, removeModuleFromChassis, findEmptySlotInChassis } from "@/utils/chassisManager"

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                         */
/* ------------------------------------------------------------------ */

const RACK_UNIT_HEIGHT = 44 // px per rack-unit
const RACK_WIDTH = 482 // total rack width (px)

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

interface Project {
  id: string
  name: string
  racks: RackConfig[]
  createdAt: string
}

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
  rackPosition: number // 1-based rack-unit position (top-down)
  widthFraction?: number // For fractional width items (1/3, 1/4, etc.)
  slotPosition?: number // For fractional items: 0, 1, 2 (left to right)
}

interface RackConfig {
  id: string
  name: string
  type: string // "fly" | "tour"
  units: number // total rack-units
  width: "single" | "double"
  gear: GearWithPosition[] // Keep for backward compatibility
  frontGear: GearWithPosition[] // Front side gear
  backGear: GearWithPosition[] // Back side gear
  notes?: string
}

interface RackPlannerProps {
  initialProject?: Project
  onProjectChange?: (project: Project) => void
}

/* ------------------------------------------------------------------ */
/*  FRACTIONAL WIDTH HELPERS                                          */
/* ------------------------------------------------------------------ */

const getAvailableSlots = (rackPosition: number, sideGear: GearWithPosition[], widthFraction: number) => {
  if (!widthFraction) return [0] // Full width items use slot 0

  const slotsPerUnit = Math.floor(1 / widthFraction) // e.g., 1/3 = 3 slots, 1/4 = 4 slots
  const occupiedSlots = sideGear
    .filter((g) => g.rackPosition === rackPosition && g.widthFraction === widthFraction)
    .map((g) => g.slotPosition || 0)

  const availableSlots = []
  for (let slot = 0; slot < slotsPerUnit; slot++) {
    if (!occupiedSlots.includes(slot)) {
      availableSlots.push(slot)
    }
  }
  return availableSlots
}

const findNextAvailablePosition = (
  sideGear: GearWithPosition[],
  units: number,
  rackUnits: number,
  widthFraction?: number,
) => {
  for (let position = 1; position <= rackUnits - units + 1; position++) {
    // Check if this rack position range is free for full-width items
    const isPositionFree = sideGear.every((g) => {
      const gEnd = g.rackPosition + g.units - 1
      const nEnd = position + units - 1
      return nEnd < g.rackPosition || position > gEnd
    })

    if (isPositionFree) {
      if (widthFraction) {
        // For fractional items, find available slot
        const availableSlots = getAvailableSlots(position, sideGear, widthFraction)
        if (availableSlots.length > 0) {
          return { rackPosition: position, slotPosition: availableSlots[0] }
        }
      } else {
        // Full width item
        return { rackPosition: position, slotPosition: 0 }
      }
    }
  }
  return { rackPosition: 1, slotPosition: 0 } // Fallback
}

const canPlaceAtPosition = (
  rackPosition: number,
  units: number,
  sideGear: GearWithPosition[],
  rackUnits: number,
  widthFraction?: number,
  slotPosition?: number,
  excludeId?: string,
) => {
  if (rackPosition < 1 || rackPosition + units - 1 > rackUnits) return false

  // Check for conflicts with existing gear
  const conflicts = sideGear.filter((g) => {
    if (excludeId && g.id === excludeId) return false

    const gEnd = g.rackPosition + g.units - 1
    const nEnd = rackPosition + units - 1

    // Check if rack positions overlap
    const positionsOverlap = !(nEnd < g.rackPosition || rackPosition > gEnd)
    if (!positionsOverlap) return false

    // If positions overlap, check slot conflicts for fractional items
    if (widthFraction && g.widthFraction === widthFraction) {
      return g.slotPosition === slotPosition
    }

    // Full width items conflict with anything in the same position
    if (!widthFraction || !g.widthFraction) return true

    return false
  })

  return conflicts.length === 0
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                    */
/* ------------------------------------------------------------------ */

export default function RackPlanner({ initialProject, onProjectChange }: RackPlannerProps = {}) {
  /* -------------------- state & refs -------------------- */
  const [racks, setRacks] = useState<RackConfig[]>(initialProject?.racks || [])
  const [currentRackId, setCurrentRackId] = useState<string | null>(initialProject?.racks?.[0]?.id || null)

  const [draggedItem, setDraggedItem] = useState<{
    gear: GearWithPosition
    fromSlot: number
    side: "front" | "back"
  } | null>(null)
  const [draggedOverSlot, setDraggedOverSlot] = useState<number | null>(null)
  const [draggedOverSide, setDraggedOverSide] = useState<"front" | "back" | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // 500-series module editing & dragging
  const [draggedModule, setDraggedModule] = useState<any>(null)
  const [draggedModuleInfo, setDraggedModuleInfo] = useState<any>(null)
  const [editingModule, setEditingModule] = useState<any>(null)

  // rack name editing
  const [editingRackId, setEditingRackId] = useState<string | null>(null)
  const [editingRackName, setEditingRackName] = useState("")

  // Update project when racks change
  useEffect(() => {
    if (initialProject && onProjectChange) {
      const updatedProject = {
        ...initialProject,
        racks: racks,
      }
      onProjectChange(updatedProject)
    }
  }, [racks, initialProject, onProjectChange])

  const frontRackRef = useRef<HTMLDivElement>(null)
  const backRackRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)

  /* -------------------- helpers -------------------- */
  const currentRack = racks.find((r) => r.id === currentRackId) || null
  const rackItems = currentRack ? [...currentRack.frontGear, ...currentRack.backGear] : []
  const { isValidRack, rackType, rackSizeU } = useRackConfig(currentRack)

  /* ================================================================
     =  ADD / REMOVE  =
     ============================================== */

  const addGear = (gear: any) => {
    // Default to adding to front side
    addGearToSide("front", gear)
  }

  const removeGearFromSide = (side: "front" | "back", gearId: string) => {
    setRacks((prev) =>
      prev.map((r) => {
        if (r.id === currentRackId) {
          const updatedRack = { ...r }
          if (side === "front") {
            updatedRack.frontGear = r.frontGear.filter((g) => g.id !== gearId)
          } else {
            updatedRack.backGear = r.backGear.filter((g) => g.id !== gearId)
          }
          // Update main gear array
          updatedRack.gear = [...updatedRack.frontGear, ...updatedRack.backGear]
          return updatedRack
        }
        return r
      }),
    )
  }

  const isPositionFreeForSide = (
    start: number,
    units: number,
    side: "front" | "back",
    excludeId?: string,
    widthFraction?: number,
    slotPosition?: number,
  ): boolean => {
    if (!currentRack) return false
    const sideGear = side === "front" ? currentRack.frontGear : currentRack.backGear
    return canPlaceAtPosition(start, units, sideGear, currentRack.units, widthFraction, slotPosition, excludeId)
  }

  const addGearToSide = (side: "front" | "back", gear: any) => {
    if (!currentRack) return

    // Handle 500-series modules
    if (gear.type === "500-module") {
      const targetGear = side === "front" ? currentRack.frontGear : currentRack.backGear
      const chassis = targetGear.find((g) => g.type === "chassis" && findEmptySlotInChassis(g) !== -1)
      if (chassis) {
        addModuleToChassisInRack(chassis.id, gear, side)
        return
      }
    }

    // Normal gear placement logic with fractional width support
    const palette = {
      standard: ["#3b82f6", "#ef4444", "#10b981", "#8b5cf6"],
      chassis: ["#374151", "#4b5563", "#6b7280"],
      custom: ["#6b7280", "#374151"],
    }
    const color =
      palette[gear.type as keyof typeof palette]?.[Math.floor(Math.random() * palette[gear.type].length)] || "#3b82f6"

    const units = gear.units || 1
    const sideGear = side === "front" ? currentRack.frontGear : currentRack.backGear

    // Find next available position (with fractional width support)
    const { rackPosition, slotPosition } = findNextAvailablePosition(
      sideGear,
      units,
      currentRack.units,
      gear.widthFraction,
    )

    const newItem: GearWithPosition = {
      id: `${gear.type}-${Date.now()}`,
      name: gear.name,
      units,
      color: gear.color || color,
      type: gear.type,
      category: gear.category,
      image: gear.image,
      rackPosition,
      widthFraction: gear.widthFraction,
      slotPosition: gear.widthFraction ? slotPosition : undefined,
    }

    if (gear.type === "chassis") {
      newItem.slots = gear.slots || 6
      newItem.modules = Array(gear.slots || 6).fill(null)
    }

    setRacks((prev) =>
      prev.map((r) => {
        if (r.id === currentRackId) {
          const updatedRack = { ...r }
          if (side === "front") {
            updatedRack.frontGear = [...r.frontGear, newItem]
          } else {
            updatedRack.backGear = [...r.backGear, newItem]
          }
          // Also add to main gear array for backward compatibility
          updatedRack.gear = [...updatedRack.frontGear, ...updatedRack.backGear]
          return updatedRack
        }
        return r
      }),
    )
  }

  /* ================== MOVE GEAR TO POSITION ================== */
  const moveGearToPosition = (side: "front" | "back", gearId: string, newPosition: number) => {
    setRacks((prev) =>
      prev.map((r) => {
        if (r.id === currentRackId) {
          const updatedRack = { ...r }
          const sideGear = side === "front" ? updatedRack.frontGear : updatedRack.backGear

          const gearIndex = sideGear.findIndex((g) => g.id === gearId)
          if (gearIndex === -1) return r

          const gear = sideGear[gearIndex]

          // Check if the new position is valid
          if (
            canPlaceAtPosition(
              newPosition,
              gear.units,
              sideGear,
              currentRack.units,
              gear.widthFraction,
              gear.slotPosition,
              gearId,
            )
          ) {
            // Update the gear position
            const updatedGear = { ...gear, rackPosition: newPosition }

            if (side === "front") {
              updatedRack.frontGear = [...sideGear.slice(0, gearIndex), updatedGear, ...sideGear.slice(gearIndex + 1)]
            } else {
              updatedRack.backGear = [...sideGear.slice(0, gearIndex), updatedGear, ...sideGear.slice(gearIndex + 1)]
            }

            // Update main gear array
            updatedRack.gear = [...updatedRack.frontGear, ...updatedRack.backGear]
          }

          return updatedRack
        }
        return r
      }),
    )
  }

  /* ------------- chassis module helpers ------------- */
  const addModuleToChassisInRack = (chassisId: string, mod: any, side?: "front" | "back") => {
    setRacks((prev) =>
      prev.map((rack) => {
        if (rack.id !== currentRackId) return rack
        return {
          ...rack,
          frontGear: rack.frontGear.map((g) => {
            if (g.id !== chassisId) return g
            const slot = findEmptySlotInChassis(g)
            if (slot === -1) return g
            return addModuleToChassis(g, mod, slot)
          }),
          backGear: rack.backGear.map((g) => {
            if (g.id !== chassisId) return g
            const slot = findEmptySlotInChassis(g)
            if (slot === -1) return g
            return addModuleToChassis(g, mod, slot)
          }),
          gear: [...rack.frontGear, ...rack.backGear].map((g) => {
            if (g.id !== chassisId) return g
            const slot = findEmptySlotInChassis(g)
            if (slot === -1) return g
            return addModuleToChassis(g, mod, slot)
          }),
        }
      }),
    )
  }

  const removeModuleFromChassisInRack = (chassisId: string, slotIdx: number) => {
    setRacks((prev) =>
      prev.map((rack) => {
        if (rack.id !== currentRackId) return rack
        return {
          ...rack,
          frontGear: rack.frontGear.map((g) => {
            if (g.id !== chassisId) return g
            return removeModuleFromChassis(g, slotIdx)
          }),
          backGear: rack.backGear.map((g) => {
            if (g.id !== chassisId) return g
            return removeModuleFromChassis(g, slotIdx)
          }),
          gear: [...rack.frontGear, ...rack.backGear].map((g) => {
            if (g.id !== chassisId) return g
            return removeModuleFromChassis(g, slotIdx)
          }),
        }
      }),
    )
  }

  /* ================================================================
     =  RACK CRUD  =
     ============================================================== */

  const handleAddRack = (label: string) => {
    const fly = label.includes("Fly Rack")
    const tour = label.includes("Tour Rack")
    const size = Number(label.match(/(\d+)U/)?.[1] ?? 4)
    const wide = label.includes("Double") ? "double" : "single"

    const id = `rack-${Date.now()}`
    setRacks((p) => [
      ...p,
      {
        id,
        name: label,
        type: fly ? "fly" : "tour",
        units: size,
        width: wide,
        gear: [],
        frontGear: [],
        backGear: [],
        notes: "",
      },
    ])
    setCurrentRackId(id)
  }

  const deleteRack = (id: string) => {
    setRacks((p) => p.filter((r) => r.id !== id))
    if (currentRackId === id) {
      const remainingRacks = racks.filter((r) => r.id !== id)
      setCurrentRackId(remainingRacks[0]?.id || null)
    }
  }

  /* ================================================================
     =  DRAG-AND-DROP FOR FULL GEAR UNITS  =
     ============================================================== */

  const onMouseDownItem = (e: React.MouseEvent, id: string, side: "front" | "back") => {
    e.preventDefault()
    const sideGear = side === "front" ? currentRack?.frontGear : currentRack?.backGear
    const gear = sideGear?.find((g) => g.id === id)
    if (!gear) return
    setDraggedItem({ gear, fromSlot: gear.rackPosition, side })
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const onGlobalMouseMove = (e: MouseEvent) => {
    if (!draggedItem || !currentRack) return

    // Determine which rack we're over
    let targetSide: "front" | "back" | null = null
    let targetRackRef: React.RefObject<HTMLDivElement> | null = null

    if (frontRackRef.current) {
      const frontRect = frontRackRef.current.getBoundingClientRect()
      if (
        e.clientX >= frontRect.left &&
        e.clientX <= frontRect.right &&
        e.clientY >= frontRect.top &&
        e.clientY <= frontRect.bottom
      ) {
        targetSide = "front"
        targetRackRef = frontRackRef
      }
    }

    if (backRackRef.current && !targetSide) {
      const backRect = backRackRef.current.getBoundingClientRect()
      if (
        e.clientX >= backRect.left &&
        e.clientX <= backRect.right &&
        e.clientY >= backRect.top &&
        e.clientY <= backRect.bottom
      ) {
        targetSide = "back"
        targetRackRef = backRackRef
      }
    }

    if (targetSide && targetRackRef?.current) {
      const rackRect = targetRackRef.current.getBoundingClientRect()
      const y = e.clientY - rackRect.top - dragOffset.y
      const targetRackUnit = Math.max(1, Math.min(currentRack.units, Math.floor(y / RACK_UNIT_HEIGHT) + 1))
      setDraggedOverSlot(targetRackUnit)
      setDraggedOverSide(targetSide)
    } else {
      setDraggedOverSlot(null)
      setDraggedOverSide(null)
    }
  }

  const onGlobalMouseUp = () => {
    if (draggedItem && draggedOverSlot && draggedOverSide && currentRack) {
      const { gear } = draggedItem

      // For fractional width items, try to maintain slot position or find new one
      let targetSlotPosition = gear.slotPosition || 0
      if (gear.widthFraction) {
        const sideGear = draggedOverSide === "front" ? currentRack.frontGear : currentRack.backGear
        const availableSlots = getAvailableSlots(draggedOverSlot, sideGear, gear.widthFraction)
        if (availableSlots.length > 0) {
          targetSlotPosition = availableSlots.includes(targetSlotPosition) ? targetSlotPosition : availableSlots[0]
        } else {
          // No available slots, cancel move
          setDraggedItem(null)
          setDraggedOverSlot(null)
          setDraggedOverSide(null)
          return
        }
      }

      if (
        isPositionFreeForSide(
          draggedOverSlot,
          gear.units,
          draggedOverSide,
          gear.id,
          gear.widthFraction,
          targetSlotPosition,
        )
      ) {
        // Remove from original side
        removeGearFromSide(draggedItem.side, gear.id)

        // Add to new side and position
        const updatedGear = {
          ...gear,
          rackPosition: draggedOverSlot,
          slotPosition: gear.widthFraction ? targetSlotPosition : undefined,
        }
        setRacks((prev) =>
          prev.map((rack) => {
            if (rack.id === currentRackId) {
              const updatedRack = { ...rack }
              if (draggedOverSide === "front") {
                updatedRack.frontGear = [...rack.frontGear, updatedGear]
              } else {
                updatedRack.backGear = [...rack.backGear, updatedGear]
              }
              updatedRack.gear = [...updatedRack.frontGear, ...updatedRack.backGear]
              return updatedRack
            }
            return rack
          }),
        )
      }
    }
    setDraggedItem(null)
    setDraggedOverSlot(null)
    setDraggedOverSide(null)
    setDraggedModule(null)
    setDraggedModuleInfo(null)
  }

  useEffect(() => {
    window.addEventListener("mousemove", onGlobalMouseMove)
    window.addEventListener("mouseup", onGlobalMouseUp)
    return () => {
      window.removeEventListener("mousemove", onGlobalMouseMove)
      window.removeEventListener("mouseup", onGlobalMouseUp)
    }
  })

  /* ------------------------------------------------------------------ */
  /*  RENDER HELPERS                                                    */
  /* ------------------------------------------------------------------ */

  const { totalLbs, totalKg } = currentRack
    ? calculateTotalWeight([...currentRack.frontGear, ...currentRack.backGear], currentRack.type, currentRack.units)
    : { totalLbs: 0, totalKg: 0 }

  const warnings = currentRack
    ? getWeightWarnings([...currentRack.frontGear, ...currentRack.backGear], currentRack.units, currentRack.type)
    : []

  /* ------------------------------------------------------------------ */
  /*  JSX                                                               */
  /* ------------------------------------------------------------------ */

  const handleAddCustomItem = (itemName: string) => {
    // Map custom item names to gear objects
    const customItemMap: { [key: string]: any } = {
      "1U Black Panel": { name: "1U Black Panel", units: 1, type: "standard", category: "Custom" },
      "2U Black Panel": { name: "2U Black Panel", units: 2, type: "standard", category: "Custom" },
      "3U Black Panel": { name: "3U Black Panel", units: 3, type: "standard", category: "Custom" },
      "4U Black Panel": { name: "4U Black Panel", units: 4, type: "standard", category: "Custom" },
      "1U Rack Shelf": { name: "1U Rack Shelf", units: 1, type: "standard", category: "Custom" },
      "2U Rack Shelf": { name: "2U Rack Shelf", units: 2, type: "standard", category: "Custom" },
      "3U Rack Shelf": { name: "3U Rack Shelf", units: 3, type: "standard", category: "Custom" },
      "4U Rack Shelf": { name: "4U Rack Shelf", units: 4, type: "standard", category: "Custom" },
    }

    const customItem = customItemMap[itemName]
    if (customItem) {
      addGear(customItem)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#1a1a1a" }}>
      {/* ---------- SIDEBAR ---------- */}
      <div className="w-80 min-h-screen bg-gray-950">
        <RackSidebar
          onAddRack={handleAddRack}
          onAddGear={addGear}
          onAddCustomItem={handleAddCustomItem}
          onResetWorkspace={() => {
            setRacks([])
            setCurrentRackId(null)
          }}
          rackItems={rackItems}
          currentRack={currentRack}
          exportTargetRef={workspaceRef}
        />
      </div>

      {/* ---------- MAIN WORKSPACE ---------- */}
      <div ref={workspaceRef} className="flex-1 p-6">
        {/* Rack Tabs */}
        {racks.length > 0 && (
          <div className="mb-6 flex gap-2">
            {racks.map((rack) => (
              <div key={rack.id} className="relative inline-block mr-2">
                {editingRackId === rack.id ? (
                  <input
                    type="text"
                    value={editingRackName}
                    autoFocus
                    onChange={(e) => setEditingRackName(e.target.value)}
                    onBlur={() => {
                      setRacks(racks.map((r) => (r.id === rack.id ? { ...r, name: editingRackName || r.name } : r)))
                      setEditingRackId(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape") {
                        setRacks(racks.map((r) => (r.id === rack.id ? { ...r, name: editingRackName || r.name } : r)))
                        setEditingRackId(null)
                      }
                    }}
                    className="px-2 py-1 rounded bg-gray-700 text-white border border-blue-500 focus:outline-none"
                    style={{ minWidth: "80px" }}
                  />
                ) : (
                  <button
                    onDoubleClick={() => {
                      setEditingRackId(rack.id)
                      setEditingRackName(rack.name)
                    }}
                    onClick={() => setCurrentRackId(rack.id)}
                    className={`px-4 py-2 rounded ${
                      currentRackId === rack.id ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"
                    } font-semibold transition-colors`}
                    title="Double-click to rename"
                  >
                    {rack.name}
                  </button>
                )}
                {/* Remove button */}
                {racks.length > 1 && (
                  <button
                    onClick={() => deleteRack(rack.id)}
                    className="absolute top-0 right-0 -mr-2 -mt-2 text-gray-400 hover:text-red-500 text-lg font-bold bg-transparent border-none"
                    style={{ pointerEvents: "auto" }}
                    aria-label={`Remove ${rack.name}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rack Header */}
        {currentRack && (
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2 text-white">{currentRack.name}</h1>
            <div className="text-gray-400 text-sm mb-4">
              {currentRack.units}U {currentRack.type === "fly" ? "Fly" : "Tour"} Rack
            </div>
            <div className="text-gray-300">
              {rackItems.length} items • {rackItems.reduce((s, i) => s + i.units, 0)}/{currentRack.units}U used •{" "}
              {totalLbs.toFixed(1)} lbs / {totalKg.toFixed(1)} kg
            </div>

            {warnings.length > 0 && (
              <div className="mt-2 space-y-1">
                {warnings.map((w, i) => (
                  <div key={i} className="text-amber-400 text-sm">
                    ⚠️ {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Front and Back Rack Views */}
        {currentRack && (
          <div className="flex flex-col space-y-8 items-center">
            {/* Front View */}
            <RackDisplay
              ref={frontRackRef}
              gear={currentRack.frontGear}
              label="Front"
              rackUnits={currentRack.units}
              onRemoveGear={(id) => removeGearFromSide("front", id)}
              onMouseDownItem={(e, id) => onMouseDownItem(e, id, "front")}
              onMoveGear={(gearId, newPosition) => moveGearToPosition("front", gearId, newPosition)}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              removeModuleFromChassis={removeModuleFromChassisInRack}
              handleModuleMouseDown={(e, cid, sIdx) => {
                e.preventDefault()
                const chassis = currentRack.frontGear.find((x) => x.id === cid)
                const mod = chassis?.modules?.[sIdx]
                if (mod) {
                  setDraggedModule(mod)
                  setDraggedModuleInfo({ chassisId: cid, slotIndex: sIdx })
                }
              }}
              handleModuleMouseUp={(e, cid, sIdx) => {
                if (!draggedModule || !draggedModuleInfo) return
                const { chassisId, slotIndex } = draggedModuleInfo
                if (cid === chassisId && slotIndex !== sIdx) {
                  removeModuleFromChassisInRack(chassisId, slotIndex)
                  addModuleToChassisInRack(cid, draggedModule)
                }
                setDraggedModule(null)
                setDraggedModuleInfo(null)
              }}
              handleEditModule={(cid, sIdx, name) => {}}
              draggedModule={draggedModule}
              draggedModuleInfo={draggedModuleInfo}
              setEditingModule={setEditingModule}
              editingModule={editingModule}
              racks={racks}
              currentRackId={currentRackId}
              draggedItem={draggedOverSide === "front" ? draggedItem : null}
              draggedOverSlot={draggedOverSide === "front" ? draggedOverSlot : null}
              isPositionFree={(start, units, excludeId) =>
                isPositionFreeForSide(start, units, "front", excludeId, undefined, undefined)
              }
            />

            {/* Back View */}
            <RackDisplay
              ref={backRackRef}
              gear={currentRack.backGear}
              label="Back"
              rackUnits={currentRack.units}
              onRemoveGear={(id) => removeGearFromSide("back", id)}
              onMouseDownItem={(e, id) => onMouseDownItem(e, id, "back")}
              onMoveGear={(gearId, newPosition) => moveGearToPosition("back", gearId, newPosition)}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              removeModuleFromChassis={removeModuleFromChassisInRack}
              handleModuleMouseDown={(e, cid, sIdx) => {
                e.preventDefault()
                const chassis = currentRack.backGear.find((x) => x.id === cid)
                const mod = chassis?.modules?.[sIdx]
                if (mod) {
                  setDraggedModule(mod)
                  setDraggedModuleInfo({ chassisId: cid, slotIndex: sIdx })
                }
              }}
              handleModuleMouseUp={(e, cid, sIdx) => {
                if (!draggedModule || !draggedModuleInfo) return
                const { chassisId, slotIndex } = draggedModuleInfo
                if (cid === chassisId && slotIndex !== sIdx) {
                  removeModuleFromChassisInRack(chassisId, slotIndex)
                  addModuleToChassisInRack(cid, draggedModule)
                }
                setDraggedModule(null)
                setDraggedModuleInfo(null)
              }}
              handleEditModule={(cid, sIdx, name) => {}}
              draggedModule={draggedModule}
              draggedModuleInfo={draggedModuleInfo}
              setEditingModule={setEditingModule}
              editingModule={editingModule}
              racks={racks}
              currentRackId={currentRackId}
              draggedItem={draggedOverSide === "back" ? draggedItem : null}
              draggedOverSlot={draggedOverSide === "back" ? draggedOverSlot : null}
              isPositionFree={(start, units, excludeId) =>
                isPositionFreeForSide(start, units, "back", excludeId, undefined, undefined)
              }
            />
          </div>
        )}

        {/* Empty state when no racks */}
        {racks.length === 0 && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-6xl mb-4">🎛️</div>
              <h2 className="text-2xl font-bold text-white mb-2">No Racks Yet</h2>
              <p className="text-gray-400">Add your first rack to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
