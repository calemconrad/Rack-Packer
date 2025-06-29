"use client"
import { useState } from "react"
import RackBuilder from "./components/RackBuilder"

// Sample project data for testing
const sampleProject = {
  id: "sample-project-1",
  name: "My Studio Rack",
  createdAt: new Date().toISOString(),
  racks: [
    {
      id: "rack-1",
      name: "Main Rack 12U",
      type: "tour",
      units: 12,
      width: "single",
      gear: [],
      frontGear: [],
      backGear: [],
      notes: "",
    },
  ],
}

export default function RackPacker() {
  const [project, setProject] = useState(sampleProject)

  return (
    <div className="min-h-screen bg-gray-900">
      <RackBuilder project={project} setProject={setProject} />
    </div>
  )
}
