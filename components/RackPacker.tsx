"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

// Gear data
const gearList = [
  // 500-series chassis
  {
    id: "chassis-500-6",
    name: "500-Series Chassis (6 slots)",
    type: "chassis",
    units: 2,
    slots: 6,
    modules: Array(6).fill(null),
    category: "Utility",
  },
  {
    id: "chassis-500-10",
    name: "500-Series Chassis (10 slots)",
    type: "chassis",
    units: 3,
    slots: 10,
    modules: Array(10).fill(null),
    category: "Utility",
  },

  // 500-series modules
  {
    id: "api-512c",
    name: "API 512c Preamp",
    type: "500-module",
    units: 0,
    category: "Preamp",
  },
  {
    id: "ssl-500-eq",
    name: "SSL 500-EQ",
    type: "500-module",
    units: 0,
    category: "EQ",
  },

  // Power Conditioners
  { id: "furman-pl8c", name: "Furman PL-8C Power Conditioner", type: "standard", units: 1, category: "Power" },
  {
    id: "furman-p1800",
    name: "Furman P-1800 PF Prestige Power Conditioner",
    type: "standard",
    units: 1,
    category: "Power",
  },

  // Audio Interfaces
  { id: "ua-apollo-x8", name: "Universal Audio Apollo x8", type: "standard", units: 1, category: "Interface" },
  { id: "ua-apollo-x4", name: "Universal Audio Apollo x4", type: "standard", units: 1, category: "Interface" },

  // Desktop interfaces (fractional width)
  {
    id: "ua-apollo-twin-mkii-duo",
    name: "Universal Audio Apollo Twin MKII DUO",
    type: "standard",
    units: 1,
    widthFraction: 1 / 3,
    color: "#6b7280",
    category: "Interface",
  },
  {
    id: "focusrite-scarlett-2i2",
    name: "Focusrite Scarlett 2i2",
    type: "standard",
    units: 1,
    widthFraction: 1 / 4,
    color: "#ef4444",
    category: "Interface",
  },

  // Preamps
  { id: "neve-1073", name: "Neve 1073", type: "standard", units: 1, category: "Preamp" },
  { id: "bae-1073", name: "BAE 1073", type: "standard", units: 1, category: "Preamp" },

  // Dynamics
  { id: "empirical-el8", name: "Empirical Labs Distressor EL8", type: "standard", units: 1, category: "Dynamics" },
  { id: "dbx-266xs", name: "DBX 266xs", type: "standard", units: 1, category: "Dynamics" },

  // Custom Items
  { id: "blank-1u", name: "1U Black Panel", type: "standard", units: 1, category: "Custom", color: "#374151" },
  { id: "blank-2u", name: "2U Black Panel", type: "standard", units: 2, category: "Custom", color: "#374151" },
  { id: "rack-shelf-1u", name: "1U Rack Shelf", type: "standard", units: 1, category: "Custom", color: "#6b7280" },
  { id: "rack-shelf-2u", name: "2U Rack Shelf", type: "standard", units: 2, category: "Custom", color: "#6b7280" },
]

// Weight data
const gearWeights = {
  "500-Series Chassis (6 slots)": 8.5,
  "500-Series Chassis (10 slots)": 12.8,
  "API 512c Preamp": 1.2,
  "SSL 500-EQ": 1.1,
  "Furman PL-8C Power Conditioner": 4.5,
  "Furman P-1800 PF Prestige Power Conditioner": 8.2,
  "Universal Audio Apollo x8": 12.0,
  "Universal Audio Apollo x4": 8.5,
  "Universal Audio Apollo Twin MKII DUO": 3.2,
  "Focusrite Scarlett 2i2": 1.8,
  "Neve 1073": 8.2,
  "BAE 1073": 8.0,
  "Empirical Labs Distressor EL8": 6.0,
  "DBX 266xs": 4.8,
  "1U Black Panel": 0.8,
  "2U Black Panel": 1.6,
  "1U Rack Shelf": 4.2,
  "2U Rack Shelf": 8.5,
}

const RACK_UNIT_HEIGHT = 44
const RACK_WIDTH = 482

interface Project {
  id: string
  name: string
  racks: RackConfig[]
  createdAt: string
}

interface RackConfig {
  id: string
  name: string
  type: string
  units: number
  width: "single" | "double"
  frontGear: GearWithPosition[]
  backGear: GearWithPosition[]
  notes?: string
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
  rackPosition: number
  widthFraction?: number
  slotPosition?: number
}

const palette = {
  standard: ["#3b82f6", "#ef4444", "#10b981", "#8b5cf6"],
  chassis: ["#374151", "#4b5563", "#6b7280"],
  custom: ["#6b7280", "#374151"],
}

export default function RackPacker() {
  const [currentView, setCurrentView] = useState<"projects" | "builder">("projects")
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState("")

  // Builder state
  const [currentRackId, setCurrentRackId] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [editingRackId, setEditingRackId] = useState<string | null>(null)
  const [editingRackName, setEditingRackName] = useState("")

  const frontRackRef = useRef<HTMLDivElement>(null)
  const backRackRef = useRef<HTMLDivElement>(null)

  // Load projects from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rackProjects")
      if (saved) {
        setProjects(JSON.parse(saved))
      }
    }
  }, [])

  // Save projects to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rackProjects", JSON.stringify(projects))
    }
  }, [projects])

  // Helper functions
  const calculateTotalWeight = (rackItems: GearWithPosition[]) => {
    const totalLbs = rackItems.reduce((sum, item) => {
      let itemWeight = gearWeights[item.name] || 0
      if (item.type === "chassis" && item.modules) {
        const moduleWeight = item.modules.reduce((moduleSum, module) => {
          if (!module) return moduleSum
          return moduleSum + (gearWeights[module.name] || 1.2)
        }, 0)
        itemWeight += moduleWeight
      }
      return sum + itemWeight
    }, 0)
    const totalKg = totalLbs * 0.453592
    return { totalLbs, totalKg }
  }

  const findNextAvailablePosition = (
    sideGear: GearWithPosition[],
    units: number,
    rackUnits: number,
    widthFraction?: number,
  ) => {
    for (let position = 1; position <= rackUnits - units + 1; position++) {
      const isPositionFree = sideGear.every((g) => {
        const gEnd = g.rackPosition + g.units - 1
        const nEnd = position + units - 1
        return nEnd < g.rackPosition || position > gEnd
      })

      if (isPositionFree) {
        if (widthFraction) {
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

  // Project management
  const createNewProject = () => {
    if (!newProjectName.trim()) return

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: newProjectName,
      createdAt: new Date().toISOString(),
      racks: [
        {
          id: `rack-${Date.now()}`,
          name: "Main Rack",
          type: "fly",
          units: 4,
          width: "single",
          frontGear: [],
          backGear: [],
          notes: "",
        },
      ],
    }

    setProjects([...projects, newProject])
    setNewProjectName("")
    setCurrentProject(newProject)
    setCurrentRackId(newProject.racks[0].id)
    setCurrentView("builder")
  }

  const openProject = (project: Project) => {
    setCurrentProject(project)
    setCurrentRackId(project.racks[0]?.id || null)
    setCurrentView("builder")
  }

  const deleteProject = (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter((p) => p.id !== projectId))
    }
  }

  // Rack management
  const addGear = (gear: any, side: "front" | "back" = "front") => {
    if (!currentProject || !currentRackId) return

    const currentRack = currentProject.racks.find((r) => r.id === currentRackId)
    if (!currentRack) return

    const color =
      gear.color ||
      palette[gear.type as keyof typeof palette]?.[
        Math.floor(Math.random() * palette[gear.type as keyof typeof palette].length)
      ] ||
      "#3b82f6"

    const units = gear.units || 1
    const sideGear = side === "front" ? currentRack.frontGear : currentRack.backGear

    const { rackPosition, slotPosition } = findNextAvailablePosition(
      sideGear,
      units,
      currentRack.units,
      gear.widthFraction,
    )

    const newItem: GearWithPosition = {
      id: `gear-${Date.now()}`,
      name: gear.name,
      units,
      color,
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

    const updatedProject = { ...currentProject }
    const updatedRacks = updatedProject.racks.map((rack) => {
      if (rack.id === currentRackId) {
        const updatedRack = { ...rack }
        if (side === "front") {
          updatedRack.frontGear = [...rack.frontGear, newItem]
        } else {
          updatedRack.backGear = [...rack.backGear, newItem]
        }
        return updatedRack
      }
      return rack
    })

    updatedProject.racks = updatedRacks
    setCurrentProject(updatedProject)
    setProjects(projects.map((p) => (p.id === currentProject.id ? updatedProject : p)))
  }

  const removeGear = (side: "front" | "back", gearId: string) => {
    if (!currentProject || !currentRackId) return

    const updatedProject = { ...currentProject }
    const updatedRacks = updatedProject.racks.map((rack) => {
      if (rack.id === currentRackId) {
        const updatedRack = { ...rack }
        if (side === "front") {
          updatedRack.frontGear = rack.frontGear.filter((g) => g.id !== gearId)
        } else {
          updatedRack.backGear = rack.backGear.filter((g) => g.id !== gearId)
        }
        return updatedRack
      }
      return rack
    })

    updatedProject.racks = updatedRacks
    setCurrentProject(updatedProject)
    setProjects(projects.map((p) => (p.id === currentProject.id ? updatedProject : p)))
  }

  const addRack = (label: string) => {
    if (!currentProject) return

    const fly = label.includes("Fly Rack")
    const size = Number(label.match(/(\d+)U/)?.[1] ?? 4)
    const wide = label.includes("Double") ? "double" : "single"

    const id = `rack-${Date.now()}`
    const newRack: RackConfig = {
      id,
      name: label,
      type: fly ? "fly" : "tour",
      units: size,
      width: wide,
      frontGear: [],
      backGear: [],
      notes: "",
    }

    const updatedProject = {
      ...currentProject,
      racks: [...currentProject.racks, newRack],
    }

    setCurrentProject(updatedProject)
    setProjects(projects.map((p) => (p.id === currentProject.id ? updatedProject : p)))
    setCurrentRackId(id)
  }

  // Export functionality
  const exportPDF = async () => {
    if (!frontRackRef.current || !currentProject || !currentRackId) return

    const currentRack = currentProject.racks.find((r) => r.id === currentRackId)
    if (!currentRack) return

    const canvas = await html2canvas(frontRackRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")

    pdf.setFontSize(20)
    pdf.text(`${currentRack.name}`, 20, 20)

    const imgWidth = 170
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    pdf.addImage(imgData, "PNG", 20, 30, imgWidth, imgHeight)

    pdf.save(`${currentRack.name.replace(/\s+/g, "_")}_export.pdf`)
  }

  // Get current rack
  const currentRack = currentProject && currentRackId ? currentProject.racks.find((r) => r.id === currentRackId) : null

  const rackItems = currentRack ? [...currentRack.frontGear, ...currentRack.backGear] : []
  const { totalLbs, totalKg } = calculateTotalWeight(rackItems)

  const calculateGearPosition = (rackUnit: number, rackSize: number) => {
    const yPosition = (rackSize - rackUnit) * RACK_UNIT_HEIGHT
    return yPosition
  }

  // Render gear item
  const renderGearItem = (item: GearWithPosition, side: "front" | "back") => {
    // Use proper rack unit positioning
    const position = calculateGearPosition(item.rackPosition, currentRack!.units)

    const getItemWidth = () => {
      if (item.widthFraction) {
        const fullWidth = 458
        return fullWidth * item.widthFraction
      }
      return "100%"
    }

    const getItemLeft = () => {
      if (item.widthFraction && typeof item.slotPosition === "number") {
        const fullWidth = 458
        const slotWidth = fullWidth / Math.floor(1 / item.widthFraction)
        return item.slotPosition * slotWidth
      }
      return 0
    }

    if (item.type === "chassis") {
      return (
        <div
          key={item.id}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            position: "absolute",
            top: `${position}px`,
            left: 0,
            right: 0,
            height: `${item.units * RACK_UNIT_HEIGHT}px`,
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
                  }}
                >
                  {module ? module.name.split(" ")[0] : "Empty"}
                </div>
              ))}
            </div>

            {hoveredItem === item.id && (
              <button
                onClick={() => removeGear(side, item.id)}
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
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${position}px`,
          height: `${item.units * RACK_UNIT_HEIGHT}px`,
        }}
      >
        <div
          style={{
            paddingLeft: "20px",
            paddingRight: "20px",
            width: item.widthFraction ? `${getItemWidth()}px` : "100%",
            height: "100%",
            backgroundColor: item.color,
            borderRadius: "8px",
            border: "2px solid #444",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            position: "relative",
            left: item.widthFraction ? `${getItemLeft()}px` : "0",
            marginLeft: item.widthFraction ? "20px" : "0",
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
              onClick={() => removeGear(side, item.id)}
              className="absolute top-2 right-2 bg-black bg-opacity-70 text-white hover:text-red-500 text-xl rounded-full w-6 h-6 flex items-center justify-center"
            >
              ✕
            </button>
          )}

          {item.widthFraction && (
            <div className="absolute bottom-1 left-1 flex gap-1">
              <div className="bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                {Math.round(item.widthFraction * 100)}%
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render rack display
  const renderRackDisplay = (
    gear: GearWithPosition[],
    label: string,
    side: "front" | "back",
    ref: React.RefObject<HTMLDivElement>,
  ) => {
    if (!currentRack) return null

    const rackLayout = Array.from({ length: currentRack.units }, (_, i) => ({
      position: currentRack.units - i,
      y: i * RACK_UNIT_HEIGHT,
    }))

    return (
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
                height: RACK_UNIT_HEIGHT * currentRack.units,
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
                height: RACK_UNIT_HEIGHT * currentRack.units,
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
              style={{
                width: RACK_WIDTH,
                height: RACK_UNIT_HEIGHT * currentRack.units,
                border: "4px solid #111",
                background: "#111",
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23333333'/%3E%3C/svg%3E")`,
                position: "relative",
              }}
              className="rounded-lg overflow-hidden"
            >
              {/* Horizontal lines */}
              {Array.from({ length: currentRack.units - 1 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    top: (i + 1) * RACK_UNIT_HEIGHT,
                  }}
                  className="absolute left-0 right-0 border-t border-gray-600"
                />
              ))}

              {/* Gear items */}
              {gear.map((g) => renderGearItem(g, side))}

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
    )
  }

  if (currentView === "projects") {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">RackPacker</h1>
            <p className="text-gray-400 text-lg">Professional Audio Rack Planning Tool</p>
          </div>

          {/* Create Project */}
          <Card className="mb-8 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Create New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="flex-1 bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && createNewProject()}
                />
                <Button
                  onClick={createNewProject}
                  disabled={!newProjectName.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors group"
                >
                  <CardHeader>
                    <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </CardTitle>
                    <div className="text-gray-400 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Racks:</span>
                        <span className="text-white font-medium">{project.racks.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total Equipment:</span>
                        <span className="text-white font-medium">
                          {project.racks.reduce(
                            (total, rack) => total + rack.frontGear.length + rack.backGear.length,
                            0,
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Created:</span>
                        <span className="text-white font-medium">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Button
                        onClick={() => openProject(project)}
                        className="text-blue-400 hover:text-blue-300"
                        variant="ghost"
                      >
                        Open Project →
                      </Button>
                      <Button
                        onClick={() => deleteProject(project.id)}
                        className="text-red-500 hover:text-red-400"
                        variant="ghost"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Card className="bg-gray-800 border-gray-700 p-12">
                <div className="text-6xl mb-6">🎛️</div>
                <h3 className="text-2xl font-semibold text-white mb-4">No Projects Yet</h3>
                <p className="text-gray-400 mb-6">
                  Create your first rack project to start planning your professional audio setup.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Builder view
  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 min-h-screen bg-gray-950 p-4">
        <div className="mb-8">
          <Button
            onClick={() => setCurrentView("projects")}
            variant="ghost"
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to Projects
          </Button>
          <h1 className="text-xl font-bold text-white">RACKPACKER</h1>
        </div>

        {/* Add Rack */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Add Rack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["4U Fly Rack", "6U Fly Rack", "12U Tour Rack", "16U Tour Rack"].map((rackType) => (
                <Button
                  key={rackType}
                  onClick={() => addRack(rackType)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {rackType}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Equipment */}
        {currentRack && (
          <Card className="mb-6 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center">Add Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {gearList
                  .filter((g) => g.type !== "500-module")
                  .map((gear) => (
                    <Button
                      key={gear.id}
                      onClick={() => addGear(gear)}
                      className="w-full justify-start text-left bg-gray-700 hover:bg-gray-600 text-white"
                      size="sm"
                    >
                      <div>
                        <div className="font-medium">{gear.name}</div>
                        <div className="text-xs text-gray-400">
                          {gear.units}U • {gear.category}
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export */}
        {currentRack && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center">Export</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={exportPDF} className="w-full bg-teal-600 hover:bg-teal-700">
                Export PDF
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {currentProject && currentProject.racks.length > 0 && (
          <div className="mb-6 flex gap-2">
            {currentProject.racks.map((rack) => (
              <Button
                key={rack.id}
                onClick={() => setCurrentRackId(rack.id)}
                variant={currentRackId === rack.id ? "default" : "outline"}
                className={currentRackId === rack.id ? "bg-blue-600" : ""}
              >
                {rack.name}
              </Button>
            ))}
          </div>
        )}

        {currentRack && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold mb-2 text-white">{currentRack.name}</h1>
              <div className="text-gray-400 text-sm mb-4">
                {currentRack.units}U {currentRack.type === "fly" ? "Fly" : "Tour"} Rack
              </div>
              <div className="text-gray-300">
                {rackItems.length} items • {rackItems.reduce((s, i) => s + i.units, 0)}/{currentRack.units}U used •{" "}
                {totalLbs.toFixed(1)} lbs / {totalKg.toFixed(1)} kg
              </div>
            </div>

            <div className="flex flex-col space-y-8 items-center">
              {renderRackDisplay(currentRack.frontGear, "Front", "front", frontRackRef)}
              {renderRackDisplay(currentRack.backGear, "Back", "back", backRackRef)}
            </div>
          </>
        )}

        {(!currentProject || currentProject.racks.length === 0) && (
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
