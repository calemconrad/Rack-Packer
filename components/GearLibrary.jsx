"use client"
import gearList from "@/data/gearList"
import Image from "next/image"

const GearLibrary = ({ onAddGear }) => {
  return (
    <div className="w-80 bg-white p-4 border-r border-gray-200 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Gear Library</h2>
      <input type="text" placeholder="Search gear..." className="w-full p-2 border border-gray-300 rounded mb-4" />

      <div className="space-y-2">
        {gearList.map((gear) => (
          <div
            key={gear.id}
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="w-16 h-16 mr-3 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {gear.image ? (
                <Image
                  src={gear.image || "/placeholder.svg"}
                  alt={gear.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-500 text-sm">
                  {gear.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">{gear.name}</div>
              <div className="text-sm text-gray-500">
                {gear.units}U • {gear.category}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onAddGear(gear, "front")}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  type="button"
                >
                  + Front
                </button>
                <button
                  onClick={() => onAddGear(gear, "back")}
                  className="px-2 py-1 bg-gray-700 text-white rounded text-xs"
                  type="button"
                >
                  + Back
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GearLibrary
