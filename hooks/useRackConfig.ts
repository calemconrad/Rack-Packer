"use client"

import { useMemo } from "react"

interface RackConfig {
  id: string
  name: string
  type: string
  units: number
  width: "single" | "double"
  gear: any[]
  frontGear: any[]
  backGear: any[]
  notes?: string
}

export function useRackConfig(currentRack: RackConfig | null) {
  return useMemo(() => {
    if (!currentRack) {
      return {
        isValidRack: false,
        rackType: null,
        rackSizeU: 0,
      }
    }

    return {
      isValidRack: true,
      rackType: currentRack.type,
      rackSizeU: currentRack.units,
    }
  }, [currentRack])
}
