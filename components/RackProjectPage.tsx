"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import RackBuilder from "./RackBuilder"

interface Project {
  id: string
  name: string
  racks: any[]
  createdAt: string
}

export default function RackProjectPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const projects = JSON.parse(localStorage.getItem("rackProjects") || "[]")
      const foundProject = projects.find((p: Project) => p.id === projectId)
      setProject(foundProject || null)
    }
    setLoading(false)
  }, [projectId])

  // Update project and sync with localStorage
  const updateProject = (updatedProject: Project) => {
    setProject(updatedProject)

    if (typeof window !== "undefined") {
      const projects = JSON.parse(localStorage.getItem("rackProjects") || "[]")
      const updatedProjects = projects.map((p: Project) => (p.id === projectId ? updatedProject : p))
      localStorage.setItem("rackProjects", JSON.stringify(updatedProjects))
    }
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Projects
          </Link>
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
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Link href="/" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
            All Projects
          </Link>
        </div>
      </div>

      {/* RackBuilder Component */}
      <RackBuilder project={project} setProject={updateProject} />
    </div>
  )
}
