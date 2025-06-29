"use client"

import { useState, useRef, useEffect } from "react"
import RackSidebar from "./RackSidebar"
import RackDisplay from "./RackDisplay"
import { getWeightWarnings, calculateTotalWeight } from "../utils/weightCalculator"
import { useRackConfig } from "../hooks/useRackConfig"
import { addModuleToChassis, removeModuleFromChassis, findEmptySlotInChassis } from "../utils/chassisManager"

const RACK_UNIT_HEIGHT = 44

export default function RackBuilder({ project, setProject }) {
  // Normalize project data to ensure compatibility
  const normalizedProject = {
    ...project,
    racks: project.racks.map((rack) => ({
      ...rack,
      units: rack.units || rack.size || 4, // Handle both 'units' and 'size'
      width: rack.width || "single", // Ensure width is set
      gear: rack.gear || [...(rack.frontGear || []), ...(rack.backGear || [])], // Ensure gear array exists
      frontGear: rack.frontGear || [],
      backGear: rack.backGear || [],
      notes: rack.notes || "",
    })),
  }

  const [currentRackId, setCurrentRackId] = useState(normalizedProject.racks[0]?.id || null)
  const [draggedItem, setDraggedItem] = useState(null)
  const [draggedOverSlot, setDraggedOverSlot] = useState(null)
  const [draggedOverSide, setDraggedOverSide] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hoveredItem, setHoveredItem] = useState(null)
  const [editingRackId, setEditingRackId] = useState(null)
  const [editingRackName, setEditingRackName] = useState("")

  // 500-series module state
  const [draggedModule, setDraggedModule] = useState(null)
  const [draggedModuleInfo, setDraggedModuleInfo] = useState(null)
  const [editingModule, setEditingModule] = useState(null)

  const frontRackRef = useRef(null)
  const backRackRef = useRef(null)
  const workspaceRef = useRef(null)

  // Update localStorage when project changes
  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem("rackProjects") || "[]")
    const updatedProjects = projects.map((p) => (p.id === project.id ? project : p))
    localStorage.setItem("rackProjects", JSON.stringify(updatedProjects))
  }, [project])

  // Helper functions
  const currentRack = normalizedProject.racks.find((r) => r.id === currentRackId) || null
  const rackItems = currentRack ? [...currentRack.frontGear, ...currentRack.backGear] : []
  const { isValidRack, rackType, rackSizeU } = useRackConfig(currentRack)

  // Find next available position for gear
  const findNextAvailablePosition = (sideGear, units, rackUnits, widthFraction) => {
    for (let position = 1; position <= rackUnits - units + 1; position++) {
      const isPositionFree = sideGear.every((g) => {
        const gEnd = g.rackPosition + g.units - 1
        const nEnd = position + units - 1
        return nEnd < g.rackPosition || position > gEnd
      })

      if (isPositionFree) {
        if (widthFraction) {
          // For fractional items, find available slot
          const slotsPerUnit = Math.floor(1 / widthFraction)
          const occupiedSlots = sideGear
            .filter((g) => g.rackPosition === position && g.widthFraction === widthFraction)
            .map((g) => g.slotPosition || 0)

          for (let slot = 0; slot < slotsPerUnit; slot++) {
            if (!occupiedSlots.includes(slot)) {
              return { rackPosition: position, slotPosition: slot }
            }
          }
        } else {
          return { rackPosition: position, slotPosition: 0 }
        }
      }
    }
    return { rackPosition: 1, slotPosition: 0 }
  }

  // Add gear to specific side
  const addGear = (gear, side = "front") => {
    if (!currentRack) return

    // Handle 500-series modules
    if (gear.type === "500-module") {
      const targetGear = side === "front" ? currentRack.frontGear : currentRack.backGear
      const chassis = targetGear.find((g) => g.type === "chassis" && findEmptySlotInChassis(g) !== -1)
      if (chassis) {
        addModuleToChassisInRack(chassis.id, gear)
        return
      }
    }

    const palette = {
      standard: ["#3b82f6", "#ef4444", "#10b981", "#8b5cf6"],
      chassis: ["#374151", "#4b5563", "#6b7280"],
      custom: ["#6b7280", "#374151"],
    }
    const color = palette[gear.type]?.[Math.floor(Math.random() * palette[gear.type].length)] || "#3b82f6"

    const units = gear.units || 1
    const sideGear = side === "front" ? currentRack.frontGear : currentRack.backGear

    const { rackPosition, slotPosition } = findNextAvailablePosition(
      sideGear,
      units,
      currentRack.units,
      gear.widthFraction,
    )

    const newItem = {
      id: `gear-${Date.now()}`,
      name: gear.name,
      units,
      color: gear.color || color,
      type: gear.type,
      category: gear.category,
      image: gear.image,
      rackPosition,
      widthFraction: gear.widthFraction,
      slotPosition: gear.widthFraction ? slotPosition : undefined,
      side,
    }

    if (gear.type === "chassis") {
      newItem.slots = gear.slots || 6
      newItem.modules = Array(gear.slots || 6).fill(null)
    }

    const updatedProject = { ...normalizedProject }
    const updatedRacks = updatedProject.racks.map((rack) => {
      if (rack.id === currentRackId) {
        const updatedRack = { ...rack }
        if (side === "front") {
          updatedRack.frontGear = [...rack.frontGear, newItem]
        } else {
          updatedRack.backGear = [...rack.backGear, newItem]
        }
        updatedRack.gear = [...updatedRack.frontGear, ...updatedRack.backGear]
        return updatedRack
      }
      return rack
    })

    const updateProjectState = (updatedProject) => {
      const finalProject = {
        ...updatedProject,
        racks: updatedProject.racks.map((rack) => ({
          ...rack,
          units: rack.units || rack.size || 4,
          width: rack.width || "single",
          gear: [...(rack.frontGear || []), ...(rack.backGear || [])],
          frontGear: rack.frontGear || [],
          backGear: rack.backGear || [],
          notes: rack.notes || "",
        })),
      }
      setProject(finalProject)
    }

    updatedProject.racks = updatedRacks
    updateProjectState(updatedProject)
  }

  // Remove gear from specific side
  const removeGearFromSide = (side, gearId) => {
    const updatedProject = { ...normalizedProject }
    const updatedRacks = updatedProject.racks.map((rack) => {
      if (rack.id === currentRackId) {
        const updatedRack = { ...rack }
        if (side === "front") {
          updatedRack.frontGear = rack.frontGear.filter((g) => g.id !== gearId)
        } else {
          updatedRack.backGear = rack.backGear.filter((g) => g.id !== gearId)
        }
        updatedRack.gear = [...updatedRack.frontGear, ...updatedRack.backGear]
        return updatedRack
      }
      return rack
    })

    const updateProjectState = (updatedProject) => {
      const finalProject = {
        ...updatedProject,
        racks: updatedProject.racks.map((rack) => ({
          ...rack,
          units: rack.units || rack.size || 4,
          width: rack.width || "single",
          gear: [...(rack.frontGear || []), ...(rack.backGear || [])],
          frontGear: rack.frontGear || [],
          backGear: rack.backGear || [],
          notes: rack.notes || "",
        })),
      }
      setProject(finalProject)
    }

    updatedProject.racks = updatedRacks
    updateProjectState(updatedProject)
  }

  // Add module to chassis
  const addModuleToChassisInRack = (chassisId, module) => {
    const updatedProject = { ...normalizedProject }
    const updatedRacks = updatedProject.racks.map((rack) => {
      if (rack.id !== currentRackId) return rack

      return {
        ...rack,
        frontGear: rack.frontGear.map((g) => {
          if (g.id !== chassisId) return g
          const slot = findEmptySlotInChassis(g)
          if (slot === -1) return g
          return addModuleToChassis(g, module, slot)
        }),
        backGear: rack.backGear.map((g) => {
          if (g.id !== chassisId) return g
          const slot = findEmptySlotInChassis(g)
          if (slot === -1) return g
          return addModuleToChassis(g, module, slot)
        }),
        gear: [...rack.frontGear, ...rack.backGear].map((g) => {
          if (g.id !== chassisId) return g
          const slot = findEmptySlotInChassis(g)
          if (slot === -1) return g
          return addModuleToChassis(g, module, slot)
        }),
      }
    })

    const updateProjectState = (updatedProject) => {
      const finalProject = {
        ...updatedProject,
        racks: updatedProject.racks.map((rack) => ({
          ...rack,
          units: rack.units || rack.size || 4,
          width: rack.width || "single",
          gear: [...(rack.frontGear || []), ...(rack.backGear || [])],
          frontGear: rack.frontGear || [],
          backGear: rack.backGear || [],
          notes: rack.notes || "",
        })),
      }
      setProject(finalProject)
    }

    updatedProject.racks = updatedRacks
    updateProjectState(updatedProject)
  }

  // Remove module from chassis
  const removeModuleFromChassisInRack = (chassisId, slotIdx) => {
    const updatedProject = { ...normalizedProject }
    const updatedRacks = updatedProject.racks.map((rack) => {
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
    })

    const updateProjectState = (updatedProject) => {
      const finalProject = {
        ...updatedProject,
        racks: updatedProject.racks.map((rack) => ({
          ...rack,
          units: rack.units || rack.size || 4,
          width: rack.width || "single",
          gear: [...(rack.frontGear || []), ...(rack.backGear || [])],
          frontGear: rack.frontGear || [],
          backGear: rack.backGear || [],
          notes: rack.notes || "",
        })),
      }
      setProject(finalProject)
    }

    updatedProject.racks = updatedRacks
    updateProjectState(updatedProject)
  }

  // Add new rack
  const handleAddRack = (label) => {
    const fly = label.includes("Fly Rack")
    const tour = label.includes("Tour Rack")
    const size = Number(label.match(/(\d+)U/)?.[1] ?? 4)
    const wide = label.includes("Double") ? "double" : "single"

    const id = `rack-${Date.now()}`
    const newRack = {
      id,
      name: label,
      type: fly ? "fly" : "tour",
      units: size,
      width: wide,
      gear: [],
      frontGear: [],
      backGear: [],
      notes: "",
    }

    const updatedProject = {
      ...normalizedProject,
      racks: [...normalizedProject.racks, newRack],
    }

    const updateProjectState = (updatedProject) => {
      const finalProject = {
        ...updatedProject,
        racks: updatedProject.racks.map((rack) => ({
          ...rack,
          units: rack.units || rack.size || 4,
          width: rack.width || "single",
          gear: [...(rack.frontGear || []), ...(rack.backGear || [])],
          frontGear: rack.frontGear || [],
          backGear: rack.backGear || [],
          notes: rack.notes || "",
        })),
      }
      setProject(finalProject)
    }

    updateProjectState(updatedProject)
    setCurrentRackId(id)
  }

  // Delete rack
  const deleteRack = (id) => {
    const updatedProject = {
      ...normalizedProject,
      racks: normalizedProject.racks.filter((r) => r.id !== id),
    }

    const updateProjectState = (updatedProject) => {
      const finalProject = {
        ...updatedProject,
        racks: updatedProject.racks.map((rack) => ({
          ...rack,
          units: rack.units || rack.size || 4,
          width: rack.width || "single",
          gear: [...(rack.frontGear || []), ...(rack.backGear || [])],
          frontGear: rack.frontGear || [],
          backGear: rack.backGear || [],
          notes: rack.notes || "",
        })),
      }
      setProject(finalProject)
    }

    updateProjectState(updatedProject)

    if (currentRackId === id) {
      const remainingRacks = updatedProject.racks
      setCurrentRackId(remainingRacks[0]?.id || null)
    }
  }

  // Handle custom items
  const handleAddCustomItem = (itemName) => {
    const customItemMap = {
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

  // Drag and drop handlers
  const onMouseDownItem = (e, id, side) => {
    e.preventDefault()
    const sideGear = side === "front" ? currentRack?.frontGear : currentRack?.backGear
    const gear = sideGear?.find((g) => g.id === id)
    if (!gear) return
    setDraggedItem({ gear, fromSlot: gear.rackPosition, side })
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  // Weight calculations
  const { totalLbs, totalKg } = currentRack
    ? calculateTotalWeight([...currentRack.frontGear, ...currentRack.backGear], currentRack.type, currentRack.units)
    : { totalLbs: 0, totalKg: 0 }

  const warnings = currentRack
    ? getWeightWarnings([...currentRack.frontGear, ...currentRack.backGear], currentRack.units, currentRack.type)
    : []

  return (
    <div className="min-h-screen flex" style={{ background: "#1a1a1a" }}>
      {/* Sidebar */}
      <div className="w-80 min-h-screen bg-gray-950">
        <RackSidebar
          onAddRack={handleAddRack}
          onAddGear={addGear}
          onAddCustomItem={handleAddCustomItem}
          onResetWorkspace={() => {
            const updatedProject = {
              ...normalizedProject,
              racks: [],
            }

            const updateProjectState = (updatedProject) => {
              const finalProject = {
                ...updatedProject,
                racks: updatedProject.racks.map((rack) => ({
                  ...rack,
                  units: rack.units || rack.size || 4,
                  width: rack.width || "single",
                  gear: [...(rack.frontGear || []), ...(rack.backGear || [])],
                  frontGear: rack.frontGear || [],
                  backGear: rack.backGear || [],
                  notes: rack.notes || "",
                })),
              }
              setProject(finalProject)
            }

            updateProjectState(updatedProject)
            setCurrentRackId(null)
          }}
          rackItems={rackItems}
          currentRack={currentRack}
          exportTargetRef={workspaceRef}
        />
      </div>

      {/* Main Workspace */}
      <div ref={workspaceRef} className="flex-1 p-6">
        {/* Rack Tabs */}
        {normalizedProject.racks.length > 0 && (
          <div className="mb-6 flex gap-2">
            {normalizedProject.racks.map((rack) => (
              <div key={rack.id} className="relative inline-block mr-2">
                {editingRackId === rack.id ? (
                  <input
                    type="text"
                    value={editingRackName}
                    autoFocus
                    onChange={(e) => setEditingRackName(e.target.value)}
                    onBlur={() => {
                      const updatedProject = {
                        ...normalizedProject,
                        racks: normalizedProject.racks.map((r) =>
                          r.id === rack.id ? { ...r, name: editingRackName || r.name } : r,
                        ),
                      }

                      const updateProjectState = (updatedProject) => {
                        const finalProject = {
                          ...updatedProject,
                          racks: updatedProject.racks.map((rack) => ({
                            ...rack,
                            units: rack.units || rack.size || 4,
                            width: rack.width || "single",
                            gear: [...(rack.frontGear || []), ...(rack.backGear || [])],
                            frontGear: rack.frontGear || [],
                            backGear: rack.backGear || [],
                            notes: rack.notes || "",
                          })),
                        }
                        setProject(finalProject)
                      }

                      updateProjectState(updatedProject)
                      setEditingRackId(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape") {
                        const updatedProject = {
                          ...normalizedProject,
                          racks: normalizedProject.racks.map((r) =>
                            r.id === rack.id ? { ...r, name: editingRackName || r.name } : r,
                          ),
                        }

                        const updateProjectState = (updatedProject) => {
                          const finalProject = {
                            ...updatedProject,
                            racks: updatedProject.racks.map((rack) => ({
                              ...rack,
                              units: rack.units || rack.size || 4,
                              width: rack.width || "single",
                              gear: [...(rack.frontGear || []), ...(rack.backGear || [])],
                              frontGear: rack.frontGear || [],
                              backGear: rack.backGear || [],
                              notes: rack.notes || "",
                            })),
                          }
                          setProject(finalProject)
                        }

                        updateProjectState(updatedProject)
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
                {normalizedProject.racks.length > 1 && (
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
              racks={normalizedProject.racks}
              currentRackId={currentRackId}
              draggedItem={draggedOverSide === "front" ? draggedItem : null}
              draggedOverSlot={draggedOverSide === "front" ? draggedOverSlot : null}
              isPositionFree={() => true}
            />

            {/* Back View */}
            <RackDisplay
              ref={backRackRef}
              gear={currentRack.backGear}
              label="Back"
              rackUnits={currentRack.units}
              onRemoveGear={(id) => removeGearFromSide("back", id)}
              onMouseDownItem={(e, id) => onMouseDownItem(e, id, "back")}
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
              racks={normalizedProject.racks}
              currentRackId={currentRackId}
              draggedItem={draggedOverSide === "back" ? draggedItem : null}
              draggedOverSlot={draggedOverSide === "back" ? draggedOverSlot : null}
              isPositionFree={() => true}
            />
          </div>
        )}

        {/* Empty state when no racks */}
        {normalizedProject.racks.length === 0 && (
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
// V0 cache refreshed on [today’s date]
