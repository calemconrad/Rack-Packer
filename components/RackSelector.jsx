"use client"

const RackSelector = ({ rackType, setRackType, rackHeight, setRackHeight, rackWidth, setRackWidth }) => {
  const rackOptions = {
    fly: { min: 1, max: 6 },
    tour: { min: 1, max: 25 },
  }

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-3 gap-4">
        {/* Rack Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rack Type</label>
          <select
            value={rackType}
            onChange={(e) => setRackType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="fly">Fly Rack</option>
            <option value="tour">Tour Rack</option>
          </select>
        </div>

        {/* Rack Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (U)</label>
          <select
            value={rackHeight}
            onChange={(e) => setRackHeight(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: rackOptions[rackType].max - rackOptions[rackType].min + 1 }, (_, i) => {
              const units = i + rackOptions[rackType].min
              return (
                <option key={units} value={units}>
                  {units}U
                </option>
              )
            })}
          </select>
        </div>

        {/* Rack Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
          <select
            value={rackWidth}
            onChange={(e) => setRackWidth(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="single">Single Wide</option>
            <option value="double">Double Wide</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default RackSelector
