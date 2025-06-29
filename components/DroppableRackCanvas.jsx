"use client"

import { useDrop } from "react-dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FiTrash2, FiServer, FiDownload } from "react-icons/fi"
import { ItemTypes } from "./DraggableGearItem"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useRef } from "react"

export default function DroppableRackCanvas({ selectedRack, mountedGear, onRemoveGear, onAddGear }) {
  const canvasRef = useRef(null)

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.GEAR,
    drop: (item) => {
      onAddGear(item.gear)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const handleExportPDF = async () => {
    if (!canvasRef.current) return

    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      // Add title
      pdf.setFontSize(20)
      pdf.text(`${selectedRack.name} - ${selectedRack.units}U ${selectedRack.width}`, 20, 20)

      // Add rack info
      pdf.setFontSize(12)
      pdf.text(`Total Units Used: ${totalUnits} / ${selectedRack.units}U`, 20, 35)
      pdf.text(`Equipment Count: ${mountedGear.length}`, 20, 45)
      pdf.text(`Rack Type: ${selectedRack.type.toUpperCase()}`, 20, 55)

      // Add image
      const imgWidth = 170
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 20, 65, imgWidth, imgHeight)

      // Add gear list
      let yPos = 65 + imgHeight + 20
      pdf.setFontSize(14)
      pdf.text("Mounted Equipment:", 20, yPos)
      yPos += 10

      pdf.setFontSize(10)
      mountedGear.forEach((item, index) => {
        if (yPos > 270) {
          pdf.addPage()
          yPos = 20
        }
        pdf.text(`${index + 1}. ${item.name} - ${item.units}U`, 25, yPos)
        yPos += 7
      })

      pdf.save(`${selectedRack.type}-rack-${selectedRack.units}u-config.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  if (!selectedRack) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FiServer className="text-5xl mx-auto mb-4 opacity-50" />
          <p>Configure your rack to start mounting equipment</p>
        </div>
      </Card>
    )
  }

  const totalUnits = mountedGear.reduce((sum, item) => sum + item.units, 0)
  const unitPercentage = (totalUnits / selectedRack.units) * 100

  // Create rack layout
  const rackSlots = Array.from({ length: selectedRack.units }, (_, i) => ({
    position: selectedRack.units - i, // Top to bottom numbering
    occupied: false,
    gear: null,
  }))

  // Fill occupied slots
  let currentSlot = 0
  mountedGear.forEach((gear, gearIndex) => {
    for (let i = 0; i < gear.units; i++) {
      if (currentSlot < rackSlots.length) {
        rackSlots[currentSlot].occupied = true
        rackSlots[currentSlot].gear = gear
        rackSlots[currentSlot].gearIndex = gearIndex
        rackSlots[currentSlot].isFirstUnit = i === 0
        currentSlot++
      }
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Rack Configuration</h2>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} size="sm" variant="outline">
            <FiDownload className="mr-2" />
            Export PDF
          </Button>
          <Badge variant={unitPercentage > 90 ? "destructive" : unitPercentage > 70 ? "secondary" : "default"}>
            {totalUnits} / {selectedRack.units}U
          </Badge>
        </div>
      </div>

      <Card ref={canvasRef}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiServer />
            {selectedRack.name} - {selectedRack.units}U{" "}
            {selectedRack.width === "double" ? "Double Wide" : "Single Wide"}
          </CardTitle>
          <div className="text-sm text-gray-600">
            {selectedRack.type === "fly" ? "Portable Fly Rack" : "Professional Tour Rack"} - 19" Standard
          </div>
        </CardHeader>
        <CardContent>
          {/* Unit Usage Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Rack Units Used</span>
              <span>{unitPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  unitPercentage > 90 ? "bg-red-500" : unitPercentage > 70 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(unitPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Rack Visualization */}
          <div
            ref={drop}
            className={`border-4 border-gray-800 rounded-lg bg-gray-900 p-2 transition-all ${
              isOver ? "border-blue-500 bg-gray-800" : ""
            } ${selectedRack.width === "double" ? "max-w-4xl" : "max-w-2xl"}`}
            style={{ minHeight: `${selectedRack.units * 44 + 16}px` }}
          >
            {/* Rack Rails */}
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gray-700 rounded-l"></div>
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gray-700 rounded-r"></div>

              {/* Rack Slots */}
              <div className="mx-4 space-y-0.5">
                {rackSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`relative h-10 border border-gray-600 rounded flex items-center ${
                      slot.occupied ? "bg-gray-800" : "bg-gray-700"
                    }`}
                  >
                    {/* Unit Number */}
                    <div className="absolute -left-6 text-xs text-gray-400 font-mono w-4 text-center">
                      {slot.position}
                    </div>
                    <div className="absolute -right-6 text-xs text-gray-400 font-mono w-4 text-center">
                      {slot.position}
                    </div>

                    {/* Equipment Display */}
                    {slot.occupied && slot.isFirstUnit && (
                      <div className="flex-1 flex items-center justify-between px-2 relative group">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-6 h-6 bg-gray-600 rounded flex-shrink-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </div>
                          <span className="text-white text-xs font-medium truncate">{slot.gear.name}</span>
                          <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                            {slot.gear.units}U
                          </Badge>
                        </div>
                        <Button
                          onClick={() => onRemoveGear(slot.gearIndex)}
                          size="sm"
                          variant="destructive"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {/* Empty Slot */}
                    {!slot.occupied && (
                      <div className="flex-1 flex items-center justify-center text-gray-500 text-xs">Empty</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Drop Overlay */}
              {isOver && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded flex items-center justify-center pointer-events-none">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">Drop equipment here!</div>
                </div>
              )}
            </div>

            {/* Empty State */}
            {mountedGear.length === 0 && !isOver && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <FiServer className="text-4xl mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Drag equipment here to mount</p>
                  <p className="text-sm mt-1">Or use the "Add to Rack" button</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">{mountedGear.length}</div>
              <div className="text-gray-500">Equipment</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{totalUnits}U</div>
              <div className="text-gray-500">Units Used</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{selectedRack.units - totalUnits}U</div>
              <div className="text-gray-500">Available</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{selectedRack.type.toUpperCase()}</div>
              <div className="text-gray-500">Rack Type</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
