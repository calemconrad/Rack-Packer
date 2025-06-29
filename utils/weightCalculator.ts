import gearWeights from "@/data/gearWeights"

interface GearWithPosition {
  id: string
  name: string
  units: number
  type: string
  modules?: any[]
}

export function calculateTotalWeight(
  rackItems: GearWithPosition[],
  rackType: string,
  rackUnits: number,
): { totalLbs: number; totalKg: number } {
  const totalLbs = rackItems.reduce((sum, item) => {
    let itemWeight = gearWeights[item.name] || 0

    // Add module weights for chassis
    if (item.type === "chassis" && item.modules) {
      const moduleWeight = item.modules.reduce((moduleSum, module) => {
        if (!module) return moduleSum
        return moduleSum + (gearWeights[module.name] || 1.2)
      }, 0)
      itemWeight += moduleWeight
    }

    return sum + itemWeight
  }, 0)

  const totalKg = totalLbs * 0.453592
  return { totalLbs, totalKg }
}

export function getWeightWarnings(rackItems: GearWithPosition[], rackUnits: number, rackType: string): string[] {
  const warnings: string[] = []
  const { totalLbs } = calculateTotalWeight(rackItems, rackType, rackUnits)

  // Weight limits based on rack type
  const limits = {
    fly: { warning: 50, danger: 75 },
    tour: { warning: 100, danger: 150 },
  }

  const limit = limits[rackType as keyof typeof limits] || limits.fly

  if (totalLbs > limit.danger) {
    warnings.push(`Rack is overweight (${totalLbs.toFixed(1)} lbs > ${limit.danger} lbs limit)`)
  } else if (totalLbs > limit.warning) {
    warnings.push(`Rack is approaching weight limit (${totalLbs.toFixed(1)} lbs)`)
  }

  return warnings
}
