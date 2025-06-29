"use client"

import { useMemo } from "react"

export function useRackConfig(rack) {
  return useMemo(() => {
    if (!rack) {
      return {
        isValidRack: false,
        rackType: null,
        rackSizeU: 0,
      }
    }

    const isValidRack = rack.units > 0 && rack.type && rack.name
    const rackType = rack.type || "fly"
    const rackSizeU = rack.units || 4

    return {
      isValidRack,
      rackType,
      rackSizeU,
    }
  }, [rack])
}
