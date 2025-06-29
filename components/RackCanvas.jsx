"use client"

import { useState } from "react"
import Image from "next/image"

const RackCanvas = ({ rackItems, rackHeight, onMoveGear, onRotateGear, onRemoveGear }) => {
  const RACK_UNIT_HEIGHT = 44
  const [dragItem, setDragItem] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e, item) => {
    setDragItem(item)
    setDragOffset({
      x: e.clientX - item.x,
      y: e.clientY - item.y,
    })
  }

  const handleMouseMove = (e) => {
    if (!dragItem) return

    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y

    // Snap to rack units
    const snappedY = Math.round(newY / RACK_UNIT_HEIGHT) * RACK_UNIT_HEIGHT

    onMoveGear(dragItem.id, newX, snappedY)
  }

  const handleMouseUp = () => {
    setDragItem(null)
  }

  return (
    <div
      className="relative bg-gray-100 border border-gray-300 rounded-lg"
      style={{ height: `${rackHeight * RACK_UNIT_HEIGHT + 40}px` }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Rack outline */}
      <div className="absolute top-5 left-5 right-5 bottom-5 border-4 border-gray-700 bg-gray-200 rounded">
        {/* Rack unit numbers */}
        {Array.from({ length: rackHeight }, (_, i) => (
          <div
            key={i}
            className="absolute -left-8 text-sm font-mono text-gray-600"
            style={{ top: `${5 + i * RACK_UNIT_HEIGHT}px` }}
          >
            {rackHeight - i}U
          </div>
        ))}
      </div>

      {/* Gear items */}
      {rackItems.map((item) => (
        <div
          key={item.id}
          className="absolute bg-white border-2 border-gray-500 rounded shadow-md cursor-move flex items-center text-center p-2"
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: "450px",
            height: `${item.units * RACK_UNIT_HEIGHT}px`,
            transform: `rotate(${item.rotation}deg)`,
            zIndex: dragItem?.id === item.id ? 100 : 10,
          }}
          onMouseDown={(e) => handleMouseDown(e, item)}
        >
          {/* Equipment Image */}
          {item.image && (
            <div className="w-16 h-full mr-3 flex-shrink-0">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={64}
                height={item.units * RACK_UNIT_HEIGHT - 16}
                className="w-full h-full object-cover rounded"
              />
            </div>
          )}

          <div className="flex-1">
            <div className="font-medium text-sm">{item.name}</div>
            <div className="mt-1 flex space-x-2 justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRotateGear(item.id)
                }}
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                ↻ Rotate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveGear(item.id)
                }}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                ✕ Remove
              </button>
            </div>
          </div>
        </div>
      ))}

      {rackItems.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          Drag gear from the library to build your rack
        </div>
      )}
    </div>
  )
}

export default RackCanvas
