"use client"

import { useDrag } from "react-dnd"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FiPlus, FiZap } from "react-icons/fi"
import Image from "next/image"

const ItemTypes = {
  GEAR: "gear",
}

export default function DraggableGearItem({ item, onAddGear, isGearMounted }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.GEAR,
    item: { gear: item },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <Card
      ref={drag}
      className={`hover:shadow-md transition-all cursor-move ${
        isDragging ? "opacity-50 rotate-1 scale-105" : ""
      } ${isGearMounted ? "opacity-60" : ""}`}
    >
      <CardHeader className="pb-2">
        <div
          className={`relative mb-2 bg-gray-900 rounded-md overflow-hidden border-2 border-gray-700 ${
            item.units === 1 ? "h-16" : item.units === 2 ? "h-24" : "h-32"
          }`}
        >
          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
          {isDragging && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
              <div className="text-blue-600 font-semibold text-sm">Moving...</div>
            </div>
          )}
          {/* Rack unit indicators */}
          <div className="absolute left-1 top-1 bottom-1 w-2 bg-gray-600 rounded-sm flex flex-col justify-between py-1">
            {Array.from({ length: item.units }, (_, i) => (
              <div key={i} className="w-1 h-1 bg-gray-400 rounded-full mx-auto" />
            ))}
          </div>
        </div>
        <CardTitle
          className="text-sm leading-tight overflow-hidden text-ellipsis text-center"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
            hyphens: "auto",
          }}
        >
          {item.name}
        </CardTitle>
        <CardDescription
          className="text-xs overflow-hidden text-ellipsis text-center"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Rack Units:</span>
            <span className="font-semibold">{item.units}U</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Power:</span>
            <span className="flex items-center gap-1">
              <FiZap className="h-3 w-3" />
              {item.power}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Brand:</span>
            <span className="text-right truncate max-w-[100px]">{item.manufacturer}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {item.category}
          </Badge>
        </div>
        <Button onClick={() => onAddGear(item)} disabled={isGearMounted} className="w-full mt-3" size="sm">
          <FiPlus className="mr-1" />
          {isGearMounted ? "Mounted" : "Mount in Rack"}
        </Button>
      </CardContent>
    </Card>
  )
}

export { ItemTypes }
