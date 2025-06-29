import gearWeights from "../data/gearWeights"

// Calculate rack weight based on type and size
export function getRackWeight(rackType, rackSizeU) {
  if (rackType.toLowerCase().includes("fly")) {
    if ([4, 5, 6].includes(rackSizeU)) return 13.5
    if ([1, 2, 3].includes(rackSizeU)) return 10.0
  }
  return 0 // Tour racks or unsupported sizes add no extra weight
}

// Calculate total weight of rack items plus the rack itself
export function calculateTotalWeight(rackItems, rackType, rackSizeU) {
  // Sum gear weights
  const gearWeightLbs = rackItems.reduce((sum, item) => {
    let itemWeight = gearWeights[item.name] || 0

    // For 500-series chassis, add weight of installed modules only
    if (item.type === "chassis" && item.modules && item.modules.length > 0) {
      const moduleWeight = item.modules.reduce((moduleSum, module) => {
        if (!module) return moduleSum // skip empty slots
        return moduleSum + (gearWeights[module.name] || 1.2) // default module weight
      }, 0)
      itemWeight += moduleWeight
    }

    return sum + itemWeight
  }, 0)

  // Add rack weight
  const rackWeightLbs = getRackWeight(rackType, rackSizeU)
  const totalLbs = gearWeightLbs + rackWeightLbs
  const totalKg = totalLbs * 0.453592

  return { totalLbs, totalKg, gearWeightLbs, rackWeightLbs }
}

// Get weight for individual item (useful for tooltips)
export function getItemWeight(itemName) {
  return gearWeights[itemName] || 0
}

// Calculate weight distribution warnings
export function getWeightWarnings(rackItems, rackUnits, rackType) {
  const { totalLbs, gearWeightLbs, rackWeightLbs } = calculateTotalWeight(rackItems, rackType, rackUnits)
  const warnings = []

  // General weight warnings
  if (totalLbs > 100) {
    warnings.push("Heavy rack - consider weight distribution")
  }

  if (totalLbs > 150) {
    warnings.push("Very heavy rack - may require lifting assistance")
  }

  // Fly rack specific warnings
  if (rackType.toLowerCase().includes("fly")) {
    if (totalLbs > 80) {
      warnings.push("Heavy for fly rack - check portability requirements")
    }
    if (gearWeightLbs > 60) {
      warnings.push("High equipment weight for portable rack")
    }
  }

  // Weight per rack unit
  const weightPerU = totalLbs / rackUnits
  if (weightPerU > 8) {
    warnings.push("High weight density - check rack capacity")
  }

  // Tour rack warnings
  if (rackType.toLowerCase().includes("tour") && totalLbs > 200) {
    warnings.push("Very heavy tour rack - verify caster capacity")
  }

  return warnings
}

// Get weight breakdown for detailed display
export function getWeightBreakdown(rackItems, currentRack = null) {
  if (!currentRack) {
    return {
      total: { lbs: 0, kg: 0 },
      equipment: { lbs: 0, kg: 0 },
      rack: { lbs: 0, kg: 0 },
      hasRackWeight: false,
    }
  }

  const { totalLbs, totalKg, gearWeightLbs, rackWeightLbs } = calculateTotalWeight(
    rackItems,
    currentRack.type,
    currentRack.units,
  )

  return {
    total: { lbs: totalLbs, kg: totalKg },
    equipment: { lbs: gearWeightLbs, kg: gearWeightLbs * 0.453592 },
    rack: { lbs: rackWeightLbs, kg: rackWeightLbs * 0.453592 },
    hasRackWeight: rackWeightLbs > 0,
  }
}
