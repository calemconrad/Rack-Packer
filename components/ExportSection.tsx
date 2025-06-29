"use client"

import type React from "react"
import { useState } from "react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import saveAs from "file-saver"
import { calculateTotalWeight } from "@/utils/weightCalculator"
import { useRackConfig } from "@/hooks/useRackConfig"
import gearWeights from "@/data/gearWeights"

interface ExportSectionProps {
  exportTargetRef: React.RefObject<HTMLDivElement>
  rackItems?: any[]
  currentRack?: any
}

// Enhanced export functionality
const exportFunctions = {
  // PDF with layout + gear list
  exportPDF: async (rackRef, rackItems, rackName, totalLbs, totalKg, rackNotes) => {
    const canvas = await html2canvas(rackRef.current)
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    })

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
    pdf.addPage()
    pdf.setFontSize(16)
    pdf.text(`${rackName} - Gear List`, 20, 20)

    let yPos = 30
    rackItems.forEach((item) => {
      pdf.setFontSize(12)
      pdf.text(`- ${item.name} (${item.units}U)`, 20, yPos)
      yPos += 10
    })

    pdf.setFontSize(14)
    pdf.text(`Total Weight: ${totalLbs.toFixed(1)} lbs / ${totalKg.toFixed(1)} kg`, 20, yPos + 20)
    pdf.text("Notes:", 20, yPos + 40)
    pdf.setFontSize(12)
    pdf.text(rackNotes || "No notes", 20, yPos + 55, { maxWidth: 170 })

    pdf.save(`${rackName.replace(/\s+/g, "_")}_export.pdf`)
  },

  // JPG of rack layout
  exportJPG: async (rackRef: React.RefObject<HTMLDivElement>, rackName: string) => {
    if (!rackRef.current) return

    const canvas = await html2canvas(rackRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
      useCORS: true,
    })

    canvas.toBlob(
      (blob) => {
        if (blob) {
          saveAs(blob, `${rackName.replace(/\s+/g, "_")}_layout.jpg`)
        }
      },
      "image/jpeg",
      0.95,
    )
  },

  // CSV gear list export
  exportCSV: (rackItems: any[], rackName: string, totalLbs: number, totalKg: number, rackNotes?: string) => {
    let csvContent = "Name,Units,Category,Weight (lbs),Weight (kg)\n"

    rackItems.forEach((item) => {
      const weightLbs = gearWeights[item.name] || 0
      const weightKg = weightLbs * 0.453592
      csvContent += `"${item.name}",${item.units},"${item.category || "N/A"}",${weightLbs.toFixed(1)},${weightKg.toFixed(1)}\n`
    })

    csvContent += `"TOTAL",,,"${totalLbs.toFixed(1)}","${totalKg.toFixed(1)}"\n`
    csvContent += `\nNotes\n"${rackNotes || "No notes"}"\n`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, `${rackName.replace(/\s+/g, "_")}_inventory.csv`)
  },

  // JSON gear list export
  exportJSON: (rackItems: any[], rackName: string, totalLbs: number, totalKg: number, rackNotes?: string) => {
    const jsonData = {
      rackName,
      items: rackItems.map((item) => ({
        name: item.name,
        units: item.units,
        category: item.category || "N/A",
        weightLbs: gearWeights[item.name] || 0,
        weightKg: (gearWeights[item.name] || 0) * 0.453592,
        rackPosition: item.rackPosition,
      })),
      total: {
        lbs: totalLbs,
        kg: totalKg,
        items: rackItems.length,
      },
      exportedAt: new Date().toISOString(),
      notes: rackNotes || "No notes",
    }

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json;charset=utf-8;" })
    saveAs(blob, `${rackName.replace(/\s+/g, "_")}_inventory.json`)
  },
}

export default function ExportSection({ exportTargetRef, rackItems = [], currentRack }: ExportSectionProps) {
  const [exportFormat, setExportFormat] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  // Clean rack configuration extraction
  const { rackType, rackSizeU, isValidRack } = useRackConfig(currentRack)

  const handleExport = async () => {
    if (!exportFormat || !currentRack) return

    setIsExporting(true)

    try {
      const rackName = currentRack.name || `${currentRack.units}U ${currentRack.type} Rack`
      const { totalLbs, totalKg } = calculateTotalWeight(currentRack.gear, currentRack.type, currentRack.units)
      const rackNotes = currentRack.notes

      switch (exportFormat) {
        case "PDF":
          await exportFunctions.exportPDF(exportTargetRef, rackItems, rackName, totalLbs, totalKg, rackNotes)
          break
        case "JPG":
          await exportFunctions.exportJPG(exportTargetRef, rackName)
          break
        case "CSV":
          exportFunctions.exportCSV(rackItems, rackName, totalLbs, totalKg, rackNotes)
          break
        case "JSON":
          exportFunctions.exportJSON(rackItems, rackName, totalLbs, totalKg, rackNotes)
          break
        default:
          break
      }
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
      setExportFormat("")
    }
  }

  // Clean weight calculation for preview
  const { totalLbs, totalKg } =
    currentRack && rackItems.length > 0
      ? calculateTotalWeight(currentRack.gear, currentRack.type, currentRack.units)
      : { totalLbs: 0, totalKg: 0 }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Export Rack</h2>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => setExportFormat("PDF")}
          disabled={isExporting}
          className={`py-2 px-3 rounded transition-colors text-sm ${
            exportFormat === "PDF"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800"
          }`}
        >
          PDF Report
        </button>
        <button
          onClick={() => setExportFormat("JPG")}
          disabled={isExporting}
          className={`py-2 px-3 rounded transition-colors text-sm ${
            exportFormat === "JPG"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800"
          }`}
        >
          JPG Image
        </button>
        <button
          onClick={() => setExportFormat("CSV")}
          disabled={isExporting}
          className={`py-2 px-3 rounded transition-colors text-sm ${
            exportFormat === "CSV"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800"
          }`}
        >
          CSV Data
        </button>
        <button
          onClick={() => setExportFormat("JSON")}
          disabled={isExporting}
          className={`py-2 px-3 rounded transition-colors text-sm ${
            exportFormat === "JSON"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800"
          }`}
        >
          JSON Data
        </button>
      </div>

      {/* Export preview info */}
      {exportFormat && rackItems.length > 0 && isValidRack && (
        <div className="text-xs text-gray-300 bg-gray-800 p-2 rounded">
          <div className="font-semibold mb-1">{exportFormat} will include:</div>
          <ul className="space-y-1">
            {exportFormat === "PDF" && (
              <>
                <li>• Rack visualization (page 1)</li>
                <li>• Equipment list with weights (page 2)</li>
                <li>• Rack notes section</li>
                <li>• Total weight: {totalLbs.toFixed(1)} lbs</li>
                <li>• {rackItems.length} items listed</li>
              </>
            )}
            {exportFormat === "JPG" && (
              <>
                <li>• High-quality rack layout image</li>
                <li>• Suitable for presentations</li>
              </>
            )}
            {exportFormat === "CSV" && (
              <>
                <li>• Complete equipment inventory</li>
                <li>• Individual item weights</li>
                <li>• Rack notes included</li>
                <li>• Total weight: {totalLbs.toFixed(1)} lbs</li>
                <li>• {rackItems.length} items listed</li>
              </>
            )}
            {exportFormat === "JSON" && (
              <>
                <li>• Complete equipment inventory</li>
                <li>• Individual item weights</li>
                <li>• Rack notes included</li>
                <li>• Total weight: {totalLbs.toFixed(1)} lbs</li>
                <li>• {rackItems.length} items listed</li>
              </>
            )}
          </ul>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={!exportFormat || isExporting || rackItems.length === 0}
        className="w-full py-2 px-4 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <span>Export {exportFormat}</span>
          </>
        )}
      </button>

      <div className="mt-3 text-xs text-gray-400 text-center">
        {rackItems.length === 0
          ? "Add equipment to enable export"
          : "PDF/JPG include layout + gear list. CSV/JSON export inventory data."}
      </div>
    </div>
  )
}
