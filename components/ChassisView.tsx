"use client"
import { Button } from "@/components/ui/button"

interface MountedGear {
  id: string
  name: string
  units: number
  position: number
  side: "front" | "back"
  category: string
  manufacturer: string
  power: string
}

interface ChassisViewProps {
  mountedGear: MountedGear[]
  rackUnits: number
  onRemoveGear: (gearId: string) => void
  onToggleSide: (gearId: string) => void
  viewSide: "front" | "back"
}

export default function ChassisView({
  mountedGear,
  rackUnits,
  onRemoveGear,
  onToggleSide,
  viewSide,
}: ChassisViewProps) {
  const visibleGear = mountedGear.filter((gear) => gear.side === viewSide)

  const renderGearItem = (gear: MountedGear) => {
    const topPosition = ((rackUnits - gear.position - gear.units + 1) / rackUnits) * 100

    return (
      <div
        key={gear.id}
        className="absolute left-0 right-0 bg-gray-700 border border-gray-600 rounded-sm flex items-center justify-between px-3 py-1 group hover:bg-gray-600 transition-colors"
        style={{
          top: `${topPosition}%`,
          height: `${(gear.units / rackUnits) * 100}%`,
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium truncate">{gear.name}</div>
          <div className="text-gray-300 text-xs">
            {gear.units}U • {gear.category}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleSide(gear.id)}
            className="text-xs text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            + {viewSide === "front" ? "Back" : "Front"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveGear(gear.id)}
            className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Remove
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full bg-gray-900 border-2 border-gray-700 rounded-lg overflow-hidden">
      {/* Rack unit markers */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-800 border-r border-gray-600">
        {Array.from({ length: rackUnits }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-b border-gray-600 flex items-center justify-center text-xs text-gray-400"
            style={{
              top: `${(i / rackUnits) * 100}%`,
              height: `${(1 / rackUnits) * 100}%`,
            }}
          >
            {rackUnits - i}
          </div>
        ))}
      </div>

      {/* Gear mounting area */}
      <div className="ml-8 relative h-full min-h-[400px]">
        {visibleGear.map(renderGearItem)}

        {visibleGear.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            No gear mounted on {viewSide} side
          </div>
        )}
      </div>
    </div>
  )
}
