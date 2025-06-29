"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

const popularRackGear = [
  // Adam Studio Monitor (rackmounted)
  { name: "Adam Studio Monitor (rackmounted)", units: 2, type: "Monitor", category: "Utility", color: "#AAAAAA" },

  // Antelope Audio Orion Studio
  { name: "Antelope Audio Orion Studio", units: 2, type: "Interface", category: "Interface", color: "#0074D9" },

  // Apogee Symphony I/O
  { name: "Apogee Symphony I/O", units: 2, type: "Interface", category: "Interface", color: "#0074D9" },

  // ART Pro VLA II
  { name: "ART Pro VLA II", units: 2, type: "Compressor", category: "Dynamics", color: "#2ECC40" },

  // Audient iD44
  { name: "Audient iD44", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Audient iD48
  { name: "Audient iD48", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // BAE 1073
  { name: "BAE 1073", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // BAE 1073MP
  { name: "BAE 1073MP", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // Black Lion Audio B12A
  { name: "Black Lion Audio B12A", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // Black Lion Audio Level-Loc
  { name: "Black Lion Audio Level-Loc", units: 1, type: "Compressor", category: "Dynamics", color: "#2ECC40" },

  // Blank Panel (1U Black)
  { name: "Blank Panel (1U Black)", units: 1, type: "Panel", category: "Custom", color: "#111111" },

  // Blank Panel (1U Brushed Aluminum)
  { name: "Blank Panel (1U Brushed Aluminum)", units: 1, type: "Panel", category: "Custom", color: "#CCCCCC" },

  // Blank Panel (2U Black)
  { name: "Blank Panel (2U Black)", units: 2, type: "Panel", category: "Custom", color: "#111111" },

  // Blank Panel (3U Black)
  { name: "Blank Panel (3U Black)", units: 3, type: "Panel", category: "Custom", color: "#111111" },

  // Bricasti M7 Reverb
  { name: "Bricasti M7 Reverb", units: 2, type: "Effects", category: "Effects", color: "#FFDC00" },

  // Chandler Limited REDD.47
  { name: "Chandler Limited REDD.47", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // Cisco Network Switch
  { name: "Cisco Network Switch", units: 1, type: "Network", category: "Utility", color: "#AAAAAA" },

  // DBX 160A
  { name: "DBX 160A", units: 1, type: "Compressor", category: "Dynamics", color: "#2ECC40" },

  // DBX 160x
  { name: "DBX 160x", units: 1, type: "Compressor", category: "Dynamics", color: "#2ECC40" },

  // DBX 266xs
  { name: "DBX 266xs", units: 1, type: "Compressor", category: "Dynamics", color: "#2ECC40" },

  // Dorrough Meters
  { name: "Dorrough Meters", units: 1, type: "Meter", category: "Utility", color: "#AAAAAA" },

  // Drawmer DL241
  { name: "Drawmer DL241", units: 2, type: "Compressor", category: "Dynamics", color: "#2ECC40" },

  // Drawmer DS404
  { name: "Drawmer DS404", units: 1, type: "Compressor", category: "Dynamics", color: "#2ECC40" },

  // Drawmer MX60
  { name: "Drawmer MX60", units: 1, type: "Effects", category: "Effects", color: "#FFDC00" },

  // Empirical Labs Distressor EL8
  { name: "Empirical Labs Distressor EL8", units: 1, type: "Compressor", category: "Dynamics", color: "#2ECC40" },

  // Empirical Labs Distressor EL8-S
  { name: "Empirical Labs Distressor EL8-S", units: 1, type: "Compressor", category: "Dynamics", color: "#2ECC40" },

  // Empirical Labs Fatso
  { name: "Empirical Labs Fatso", units: 1, type: "Effects", category: "Effects", color: "#FFDC00" },

  // Eventide H9000
  { name: "Eventide H9000", units: 2, type: "Effects", category: "Effects", color: "#FFDC00" },

  // 500 Series Chassis (Holds 8 modules)
  { name: "500 Series Chassis (Holds 8 modules)", units: 2, type: "Chassis", category: "500 Series", color: "#85144b" },

  // Focusrite ISA828 MkII
  { name: "Focusrite ISA828 MkII", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // Focusrite RedNet MP8R
  { name: "Focusrite RedNet MP8R", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Focusrite Scarlett 18i20
  { name: "Focusrite Scarlett 18i20", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Furman CN-2400S SmartSequencing Power Conditioner
  {
    name: "Furman CN-2400S SmartSequencing Power Conditioner",
    units: 1,
    type: "Power",
    category: "Power",
    color: "#FF4136",
  },

  // Furman Elite-15i Power Conditioner
  { name: "Furman Elite-15i Power Conditioner", units: 1, type: "Power", category: "Power", color: "#FF4136" },

  // Furman IT-Reference 20i Discrete Symmetric Power Conditioner
  {
    name: "Furman IT-Reference 20i Discrete Symmetric Power Conditioner",
    units: 1,
    type: "Power",
    category: "Power",
    color: "#FF4136",
  },

  // Furman M-8Dx 8+1 Outlet Power Conditioner
  { name: "Furman M-8Dx 8+1 Outlet Power Conditioner", units: 1, type: "Power", category: "Power", color: "#FF4136" },

  // Furman M-8x2 8 Outlet Power Conditioner
  { name: "Furman M-8x2 8 Outlet Power Conditioner", units: 1, type: "Power", category: "Power", color: "#FF4136" },

  // Furman P-1800 PF Prestige Power Conditioner
  { name: "Furman P-1800 PF Prestige Power Conditioner", units: 1, type: "Power", category: "Power", color: "#FF4136" },

  // Furman P-2400 AR Voltage Regulator
  { name: "Furman P-2400 AR Voltage Regulator", units: 1, type: "Power", category: "Power", color: "#FF4136" },

  // Furman PL-8C Power Conditioner
  { name: "Furman PL-8C Power Conditioner", units: 1, type: "Power", category: "Power", color: "#FF4136" },

  // Gator Frameworks Rack Shelf
  { name: "Gator Frameworks Rack Shelf", units: 2, type: "Utility", category: "Utility", color: "#AAAAAA" },

  // Genelec Studio Monitor (rackmounted)
  { name: "Genelec Studio Monitor (rackmounted)", units: 2, type: "Monitor", category: "Utility", color: "#AAAAAA" },

  // Grace Design m108
  { name: "Grace Design m108", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // Great River MP-2NV
  { name: "Great River MP-2NV", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // Heritage Audio HA73EQX2 ELITE
  { name: "Heritage Audio HA73EQX2 ELITE", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // Heritage Audio HA73X2 ELITE
  { name: "Heritage Audio HA73X2 ELITE", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // Heritage Audio HA81A
  { name: "Heritage Audio HA81A", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // iConnectivity PlayAudio 1U
  {
    id: "iconnectivity-playaudio-1u",
    name: "iConnectivity PlayAudio 1U",
    description: "USB Audio Interface with MIDI I/O",
    units: 1,
    manufacturer: "iConnectivity",
    category: "Interface",
    power: 15,
    color: "#0074D9",
  },

  // JBL Studio Monitor (rackmounted)
  { name: "JBL Studio Monitor (rackmounted)", units: 2, type: "Monitor", category: "Utility", color: "#AAAAAA" },

  // Klark Teknik EQP-KT
  { name: "Klark Teknik EQP-KT", units: 1, type: "Equalizer", category: "EQ", color: "#B10DC9" },

  // Lexicon PCM92
  { name: "Lexicon PCM92", units: 1, type: "Effects", category: "Effects", color: "#FFDC00" },

  // Lexicon PCM96
  { name: "Lexicon PCM96", units: 1, type: "Effects", category: "Effects", color: "#FFDC00" },

  // Maag Audio EQ4
  { name: "Maag Audio EQ4", units: 1, type: "Equalizer", category: "EQ", color: "#B10DC9" },

  // Mac Mini (rackmounted)
  { name: "Mac Mini (rackmounted)", units: 1, type: "Computer", category: "Utility", color: "#AAAAAA" },

  // Manley Massive Passive
  { name: "Manley Massive Passive", units: 3, type: "Equalizer", category: "EQ", color: "#B10DC9" },

  // Middle Atlantic Rack Shelf
  { name: "Middle Atlantic Rack Shelf", units: 2, type: "Utility", category: "Utility", color: "#AAAAAA" },

  // MOTU 1248
  { name: "MOTU 1248", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // MOTU 16A
  { name: "MOTU 16A", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Neumann MT48 Audio Interface
  { name: "Neumann MT48 Audio Interface", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Neve 1073
  { name: "Neve 1073", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // Neve 1073DPA
  { name: "Neve 1073DPA", units: 2, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // Neve 1073N
  { name: "Neve 1073N", units: 1, type: "Preamp", category: "Preamp", color: "#FF851B" },

  // Neve 551
  { name: "Neve 551", units: 1, type: "Equalizer", category: "EQ", color: "#B10DC9" },

  // Patchbay (Neutrik)
  { name: "Patchbay (Neutrik)", units: 1, type: "Patchbay", category: "Custom", color: "#39CCCC" },

  // Patchbay (Redco)
  { name: "Patchbay (Redco)", units: 1, type: "Patchbay", category: "Custom", color: "#39CCCC" },

  // Patchbay (Samson)
  { name: "Patchbay (Samson)", units: 1, type: "Patchbay", category: "Custom", color: "#39CCCC" },

  // Rack Drawer (for cables, accessories)
  { name: "Rack Drawer (for cables, accessories)", units: 2, type: "Drawer", category: "Custom", color: "#666666" },

  // Rackmount PC
  { name: "Rackmount PC", units: 2, type: "Computer", category: "Utility", color: "#AAAAAA" },

  // Rackmount Thunderbolt Hub
  { name: "Rackmount Thunderbolt Hub", units: 1, type: "Adapter", category: "Utility", color: "#AAAAAA" },

  // Radial JD6 Injector
  { name: "Radial JD6 Injector", units: 1, type: "Effects", category: "Effects", color: "#FFDC00" },

  // Radial JDI (rackmount DI box)
  { name: "Radial JDI (rackmount DI box)", units: 1, type: "DI Box", category: "Custom", color: "#3D9970" },

  // Radial JPC (rackmount DI box)
  { name: "Radial JPC (rackmount DI box)", units: 1, type: "DI Box", category: "Custom", color: "#3D9970" },

  // RME 12Mic Dante
  { name: "RME 12Mic Dante", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Shure AD4D-A
  { name: "Shure AD4D-A", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure AD4Q-A
  { name: "Shure AD4Q-A", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure ADPSM
  { name: "Shure ADPSM", units: 1, color: "#1f2937", type: "Wireless IEM", category: "Wireless" },

  // Shure BLX4
  { name: "Shure BLX4", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure BLX4R
  { name: "Shure BLX4R", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure BLX88
  { name: "Shure BLX88", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure GLXD4+
  { name: "Shure GLXD4+", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure GLXD4R+
  { name: "Shure GLXD4R+", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure GLXD6+
  { name: "Shure GLXD6+", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure PSM1000
  { name: "Shure PSM1000", units: 1, color: "#1f2937", type: "Wireless IEM", category: "Wireless" },

  // Shure PSM300
  { name: "Shure PSM300", units: 1, color: "#1f2937", type: "Wireless IEM", category: "Wireless" },

  // Shure PSM900
  { name: "Shure PSM900", units: 1, color: "#1f2937", type: "Wireless IEM", category: "Wireless" },

  // Shure QLXD4
  { name: "Shure QLXD4", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure SLXD4
  { name: "Shure SLXD4", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure SLXD4D
  { name: "Shure SLXD4D", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure SLXD5
  { name: "Shure SLXD5", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure ULXD4
  { name: "Shure ULXD4", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure ULXD4D
  { name: "Shure ULXD4D", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // Shure ULXD4Q
  { name: "Shure ULXD4Q", units: 1, color: "#1f2937", type: "Wireless Receiver", category: "Wireless" },

  // SKB Shallow Rack Drawer
  { name: "SKB Shallow Rack Drawer", units: 2, type: "Utility", category: "Utility", color: "#AAAAAA" },

  // Smaart RTA (Rackmount PC)
  { name: "Smaart RTA (Rackmount PC)", units: 2, type: "Measurement", category: "Utility", color: "#AAAAAA" },

  // Sonnet Echo Express Rackmount Expansion Chassis
  {
    name: "Sonnet Echo Express Rackmount Expansion Chassis",
    units: 2,
    type: "Expansion",
    category: "Utility",
    color: "#AAAAAA",
  },

  // SSL G Series Compressor
  { name: "SSL G Series Compressor", units: 1, type: "Compressor", category: "Dynamics", color: "#2ECC40" },

  // TC Electronic M-One
  { name: "TC Electronic M-One", units: 1, type: "Effects", category: "Effects", color: "#FFDC00" },

  // TC Electronic M3000
  { name: "TC Electronic M3000", units: 1, type: "Effects", category: "Effects", color: "#FFDC00" },

  // Trident 80B EQ
  { name: "Trident 80B EQ", units: 2, type: "Equalizer", category: "EQ", color: "#B10DC9" },

  // Ubiquiti Network Switch
  { name: "Ubiquiti Network Switch", units: 1, type: "Network", category: "Utility", color: "#AAAAAA" },

  // Universal Audio Apollo x16
  { name: "Universal Audio Apollo x16", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Universal Audio Apollo x16D
  { name: "Universal Audio Apollo x16D", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Universal Audio Apollo x4
  { name: "Universal Audio Apollo x4", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Universal Audio Apollo x6
  { name: "Universal Audio Apollo x6", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Universal Audio Apollo x8
  { name: "Universal Audio Apollo x8", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Universal Audio Apollo x8p
  { name: "Universal Audio Apollo x8p", units: 1, type: "Interface", category: "Interface", color: "#0074D9" },

  // Universal Audio UAD Satellite
  { name: "Universal Audio UAD Satellite", units: 1, type: "Processor", category: "Utility", color: "#AAAAAA" },

  // Warm Audio WA76 Compressor
  { name: "Warm Audio WA76 Compressor", units: 2, type: "Compressor", category: "Dynamics", color: "#2ECC40" },

  // WesAudio NG Bus Compressor
  { name: "WesAudio NG Bus Compressor", units: 1, type: "Compressor", category: "Dynamics", color: "#2ECC40" },
]

const rackTypes = [
  // Fly Racks (1U–6U, Standard Depth only)
  ...Array.from({ length: 6 }, (_, i) => ({
    type: "Fly Rack",
    size: `${i + 1}U`,
    width: "Single",
    depth: "Standard",
  })),
  // Tour Racks (10U, 12U–21U, 25U, Single/Double Wide, 24"/30" Depth) - excluding 11U, 22U, 23U, 24U
  ...Array.from({ length: 16 }, (_, i) => {
    const size = `${i + 10}U`
    return [
      { type: "Tour Rack", size, width: "Single Wide", depth: '24"' },
      { type: "Tour Rack", size, width: "Single Wide", depth: '30"' },
      { type: "Tour Rack", size, width: "Double Wide", depth: '24"' },
      { type: "Tour Rack", size, width: "Double Wide", depth: '30"' },
    ]
  })
    .flat()
    .filter((rack) => !["11U", "22U", "23U", "24U"].includes(rack.size)),
]

export default function RackSidebar({
  onAddRack,
  onAddGear,
  onAddCustomItem,
  onResetWorkspace,
  rackItems,
  currentRack,
  exportTargetRef,
}) {
  const [activeTab, setActiveTab] = useState("racks")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const gearLibrary = popularRackGear

  // Group gear by category for better performance
  const gearByCategory = {}
  gearLibrary.forEach((gear) => {
    if (!gearByCategory[gear.category]) {
      gearByCategory[gear.category] = []
    }
    gearByCategory[gear.category].push(gear)
  })

  const categoryList = Object.keys(gearByCategory)

  const [collapsedCategories, setCollapsedCategories] = useState(() =>
    categoryList.reduce((acc, category) => {
      acc[category] = true // true = collapsed
      return acc
    }, {}),
  )

  const toggleCategory = (category) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  // Filter gear by search term and category
  const filteredGear = gearLibrary.filter((gear) => {
    const matchesSearch = gear.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || gear.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = ["all", ...Object.keys(gearByCategory)]

  // PDF Export function
  const exportPDF = async () => {
    // Get the rack container element
    const element = exportTargetRef?.current || document.getElementById("rack-display")

    if (!element) {
      console.error("Could not find rack display element")
      alert("Could not find rack display element. Please try again.")
      return
    }

    try {
      // Capture the rack as an image
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true, // For external images if needed
        backgroundColor: "#1a1a1a", // Match your rack background
        logging: false,
      })

      // Create a PDF and add the image
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [canvas.width * 0.264583, canvas.height * 0.264583], // px to mm conversion
      })

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight(),
      )

      // Add a second page with equipment list
      pdf.addPage("a4", "portrait")
      pdf.setFontSize(16)
      pdf.text(`${currentRack?.name || "Rack Configuration"} - Equipment List`, 20, 30)

      let yPos = 50
      rackItems.forEach((item, index) => {
        pdf.setFontSize(12)
        pdf.text(`${index + 1}. ${item.name} (${item.units}U) - Position: ${item.rackPosition}U`, 20, yPos)
        yPos += 15

        // Add new page if we're running out of space
        if (yPos > 270) {
          pdf.addPage("a4", "portrait")
          yPos = 30
        }
      })

      // Add summary information
      pdf.setFontSize(14)
      pdf.text(`Total Items: ${rackItems.length}`, 20, yPos + 20)
      pdf.text(`Total Rack Units Used: ${rackItems.reduce((sum, item) => sum + item.units, 0)}U`, 20, yPos + 40)

      if (currentRack) {
        pdf.text(`Rack Size: ${currentRack.units}U`, 20, yPos + 60)
      }

      // Save the PDF
      const filename = currentRack?.name
        ? `${currentRack.name.replace(/\s+/g, "_")}_rack_configuration.pdf`
        : "rack-configuration.pdf"

      pdf.save(filename)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Error exporting PDF. Please try again.")
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold">RackPacker</h2>
        <p className="text-sm text-gray-400">Build your rack configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {[
          { id: "racks", label: "Racks" },
          { id: "gear", label: "Gear" },
          { id: "custom", label: "Custom" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "racks" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Add Rack</h3>
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {rackTypes.map((rack, index) => (
                  <Button
                    key={`${rack.type}-${rack.size}-${rack.width}-${rack.depth}-${index}`}
                    onClick={() => onAddRack(rack)}
                    variant="outline"
                    className="justify-start text-left bg-gray-800 border-gray-700 hover:bg-gray-700 text-white text-xs p-2"
                  >
                    <div>
                      <div className="font-medium">
                        {rack.size} {rack.type}
                      </div>
                      <div className="text-xs text-gray-400">
                        {rack.type === "Fly Rack" ? `Standard Depth` : `${rack.width} • ${rack.depth} Depth`}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {currentRack && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Current Rack</h3>
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white">{currentRack.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-400">
                    <div>
                      {currentRack.units}U {currentRack.type} rack
                    </div>
                    <div>{rackItems.length} items installed</div>
                    <div>
                      {rackItems.reduce((sum, item) => sum + item.units, 0)}/{currentRack.units}U used
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Export PDF Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Export</h3>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <button
                    onClick={exportPDF}
                    disabled={!currentRack || rackItems.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors w-full flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Export PDF
                  </button>
                  {(!currentRack || rackItems.length === 0) && (
                    <p className="text-xs text-gray-400 mt-2 text-center">Add gear to enable export</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Button onClick={onResetWorkspace} variant="destructive" className="w-full">
              Reset Workspace
            </Button>
          </div>
        )}

        {activeTab === "gear" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Gear Library</h3>

              {/* Search and Filter */}
              <div className="space-y-2 mb-4">
                <input
                  type="text"
                  placeholder="Search gear..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grouped Gear by Category */}
            <div className="space-y-3">
              {selectedCategory === "all" ? (
                // Group by categories when "all" is selected
                Object.entries(gearByCategory).map(([category, gears]) => {
                  // Apply search filter to category gear
                  const filteredCategoryGear = gears.filter((gear) =>
                    gear.name.toLowerCase().includes(searchTerm.toLowerCase()),
                  )

                  if (filteredCategoryGear.length === 0) return null

                  return (
                    <div key={category} className="space-y-2 mb-4">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between py-2 px-2 text-left font-medium text-gray-300 hover:bg-gray-800 rounded"
                      >
                        <span>{category}</span>
                        <span>{collapsedCategories[category] ? "▼" : "►"}</span>
                      </button>

                      {!collapsedCategories[category] && (
                        <div className="space-y-1">
                          {filteredCategoryGear.map((gear, index) => (
                            <div key={index} className="space-y-1">
                              <Button
                                onClick={() => onAddGear(gear, "front")}
                                variant="outline"
                                className="w-full justify-start text-left bg-gray-800 border-gray-700 hover:bg-gray-700 text-white whitespace-normal break-words py-4 px-4 min-h-[64px]"
                              >
                                <div>
                                  <div className="font-medium">{gear.name}</div>
                                  <div className="text-xs text-gray-400">
                                    {gear.units}U • {gear.category}
                                  </div>
                                </div>
                              </Button>
                              <div className="flex gap-1 ml-4">
                                <Button
                                  onClick={() => onAddGear(gear, "front")}
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-gray-400 hover:bg-gray-200 hover:text-black"
                                >
                                  + Front
                                </Button>
                                <Button
                                  onClick={() => onAddGear(gear, "back")}
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-gray-400 hover:bg-gray-200 hover:text-black"
                                >
                                  + Back
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                // Show filtered gear when specific category is selected
                <div className="space-y-2">
                  {filteredGear.map((gear, index) => (
                    <div key={index} className="space-y-1">
                      <Button
                        onClick={() => onAddGear(gear, "front")}
                        variant="outline"
                        className="w-full justify-start text-left bg-gray-800 border-gray-700 hover:bg-gray-700 text-white whitespace-normal break-words py-4 px-4 min-h-[64px]"
                      >
                        <div>
                          <div className="font-medium">{gear.name}</div>
                          <div className="text-xs text-gray-400">
                            {gear.units}U • {gear.category}
                          </div>
                        </div>
                      </Button>
                      <div className="flex gap-1 ml-4">
                        <Button
                          onClick={() => onAddGear(gear, "front")}
                          size="sm"
                          variant="ghost"
                          className="text-xs text-gray-400 hover:bg-gray-200 hover:text-black"
                        >
                          + Front
                        </Button>
                        <Button
                          onClick={() => onAddGear(gear, "back")}
                          size="sm"
                          variant="ghost"
                          className="text-xs text-gray-400 hover:bg-gray-200 hover:text-black"
                        >
                          + Back
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {filteredGear.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>No gear found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "custom" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Custom Items</h3>
            <div className="space-y-2">
              {gearLibrary
                .filter((gear) => gear.category === "Custom")
                .map((gear, index) => (
                  <Button
                    key={index}
                    onClick={() => onAddCustomItem(gear)}
                    variant="outline"
                    className="w-full justify-start text-left bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: gear.color }} />
                      <div>
                        <div className="font-medium text-sm">{gear.name}</div>
                        <div className="text-xs text-gray-400">
                          {gear.units}U • {gear.type}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
