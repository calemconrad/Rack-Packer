"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import RackBuilder from "../../components/RackBuilder"

export default function RackProjectPage() {
  const router = useRouter()
  const { projectId } = router.query
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return

    const projects = JSON.parse(localStorage.getItem("rackProjects") || "[]")
    const foundProject = projects.find((p) => p.id === projectId)

    if (foundProject) {
      // Normalize project data to ensure compatibility with RackBuilder
      const normalizedProject = {
        ...foundProject,
        racks: foundProject.racks.map((rack) => ({
          ...rack,
          units: rack.units || rack.size || 4, // Handle both 'units' and 'size'
          width: rack.width || "single", // Ensure width is set
          gear: rack.gear || [...(rack.frontGear || []), ...(rack.backGear || [])], // Ensure gear array exists
          frontGear: rack.frontGear || [],
          backGear: rack.backGear || [],
          notes: rack.notes || "",
        })),
      }
      setProject(normalizedProject)
    }

    setLoading(false)
  }, [projectId])

  // Update project and sync with localStorage
  const updateProject = (updatedProject) => {
    setProject(updatedProject)

    // Update localStorage
    const projects = JSON.parse(localStorage.getItem("rackProjects") || "[]")
    const updatedProjects = projects.map((p) => (p.id === projectId ? updatedProject : p))
    localStorage.setItem("rackProjects", JSON.stringify(updatedProjects))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-xl">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Project Not Found</h1>
            <Link href="/" className="text-purple-500 hover:text-purple-400">
              ← Back to Projects
            </Link>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <p className="text-white text-lg">The requested project could not be found.</p>
            <p className="text-gray-400 mt-2">It may have been deleted or the link is incorrect.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Project Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors" title="Back to Projects">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <p className="text-gray-400 text-sm">
                {project.racks.length} rack{project.racks.length !== 1 ? "s" : ""} • Created{" "}
                {new Date(project.createdAt || project.racks[0]?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Link href="/" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors">
            All Projects
          </Link>
        </div>
      </div>

      {/* RackBuilder Component */}
      <RackBuilder project={project} setProject={updateProject} />
    </div>
  )
}
