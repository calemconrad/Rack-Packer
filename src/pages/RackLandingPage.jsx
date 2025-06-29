"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function RackLandingPage() {
  const [projects, setProjects] = useState([])
  const [newProjectName, setNewProjectName] = useState("")

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("rackProjects") || "[]")
    setProjects(savedProjects)
  }, [])

  const createNewProject = () => {
    if (!newProjectName.trim()) return

    const newProject = {
      id: Date.now().toString(),
      name: newProjectName,
      createdAt: new Date().toISOString(),
      racks: [
        {
          id: `rack-${Date.now()}`,
          name: "Main Rack",
          type: "fly",
          units: 4, // Using 'units' for consistency with RackBuilder
          width: "single",
          gear: [],
          frontGear: [],
          backGear: [],
          notes: "",
          createdAt: new Date().toISOString(),
        },
      ],
    }

    const updatedProjects = [...projects, newProject]
    setProjects(updatedProjects)
    localStorage.setItem("rackProjects", JSON.stringify(updatedProjects))
    setNewProjectName("")
  }

  const deleteProject = (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const updatedProjects = projects.filter((project) => project.id !== projectId)
      setProjects(updatedProjects)
      localStorage.setItem("rackProjects", JSON.stringify(updatedProjects))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">RackPacker</h1>
          <p className="text-gray-400 text-lg">Professional Audio Rack Planning Tool</p>
        </div>

        {/* Create Project Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Create New Project</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="flex-1 bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyDown={(e) => e.key === "Enter" && createNewProject()}
            />
            <button
              onClick={createNewProject}
              disabled={!newProjectName.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
            >
              Create Project
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-colors group"
              >
                <Link href={`/project/${project.id}`} className="block p-6 hover:bg-gray-750">
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                    {project.name}
                  </h3>
                  <div className="text-gray-400 text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Racks:</span>
                      <span className="text-white font-medium">{project.racks.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Equipment:</span>
                      <span className="text-white font-medium">
                        {project.racks.reduce(
                          (total, rack) => total + (rack.frontGear?.length || 0) + (rack.backGear?.length || 0),
                          0,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Created:</span>
                      <span className="text-white font-medium">
                        {new Date(project.createdAt || project.racks[0]?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Project Actions */}
                <div className="bg-gray-900 px-6 py-3 border-t border-gray-700 flex justify-between items-center">
                  <Link
                    href={`/project/${project.id}`}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    Open Project →
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteProject(project.id)
                    }}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700">
              <div className="text-6xl mb-6">🎛️</div>
              <h3 className="text-2xl font-semibold text-white mb-4">No Projects Yet</h3>
              <p className="text-gray-400 mb-6">
                Create your first rack project to start planning your professional audio setup.
              </p>
              <p className="text-gray-500 text-sm">
                Each project can contain multiple racks with front and back configurations.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>RackPacker - Professional Audio Rack Planning Tool</p>
        </div>
      </div>
    </div>
  )
}
