"use client"

interface ViewModeToggleProps {
  viewMode: "single" | "front-back" | "vertical"
  setViewMode: (mode: "single" | "front-back" | "vertical") => void
}

export default function ViewModeToggle({ viewMode, setViewMode }: ViewModeToggleProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-gray-800 rounded-lg p-1 flex">
        <button
          onClick={() => setViewMode("single")}
          className={`px-4 py-2 rounded-md transition-all ${
            viewMode === "single"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-transparent text-gray-300 hover:text-white hover:bg-gray-700"
          }`}
        >
          Single View
        </button>
        <button
          onClick={() => setViewMode("front-back")}
          className={`px-4 py-2 rounded-md transition-all ${
            viewMode === "front-back"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-transparent text-gray-300 hover:text-white hover:bg-gray-700"
          }`}
        >
          Side by Side
        </button>
        <button
          onClick={() => setViewMode("vertical")}
          className={`px-4 py-2 rounded-md transition-all ${
            viewMode === "vertical"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-transparent text-gray-300 hover:text-white hover:bg-gray-700"
          }`}
        >
          Front/Back
        </button>
      </div>
    </div>
  )
}
