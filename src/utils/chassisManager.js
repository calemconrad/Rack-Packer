// Utility functions for managing 500-series chassis and modules

export function createEmptyChassis(chassisType, slots) {
  return {
    id: `chassis-${Date.now()}`,
    name: chassisType,
    type: "chassis",
    units: chassisType.includes("10 slots") ? 3 : 2,
    slots: slots,
    modules: Array(slots).fill(null), // Initialize with empty slots
    category: "Utility",
  }
}

export function addModuleToChassis(chassis, module, slotIndex) {
  if (slotIndex < 0 || slotIndex >= chassis.slots) {
    return null // Invalid slot
  }

  if (chassis.modules[slotIndex] !== null) {
    return null // Slot already occupied
  }

  const updatedChassis = {
    ...chassis,
    modules: [...chassis.modules],
  }

  updatedChassis.modules[slotIndex] = {
    id: module.id,
    name: module.name,
    category: module.category,
  }

  return updatedChassis
}

export function removeModuleFromChassis(chassis, slotIndex) {
  if (slotIndex < 0 || slotIndex >= chassis.slots) {
    return chassis // Invalid slot, return unchanged
  }

  const updatedChassis = {
    ...chassis,
    modules: [...chassis.modules],
  }

  updatedChassis.modules[slotIndex] = null

  return updatedChassis
}

export function moveModuleInChassis(chassis, fromSlot, toSlot) {
  if (fromSlot < 0 || fromSlot >= chassis.slots || toSlot < 0 || toSlot >= chassis.slots || fromSlot === toSlot) {
    return chassis // Invalid operation
  }

  const updatedChassis = {
    ...chassis,
    modules: [...chassis.modules],
  }

  // Swap modules
  const temp = updatedChassis.modules[fromSlot]
  updatedChassis.modules[fromSlot] = updatedChassis.modules[toSlot]
  updatedChassis.modules[toSlot] = temp

  return updatedChassis
}

export function getChassisOccupancy(chassis) {
  const occupiedSlots = chassis.modules.filter((module) => module !== null).length
  return {
    occupied: occupiedSlots,
    total: chassis.slots,
    percentage: (occupiedSlots / chassis.slots) * 100,
  }
}

export function findEmptySlotInChassis(chassis) {
  for (let i = 0; i < chassis.modules.length; i++) {
    if (chassis.modules[i] === null) {
      return i
    }
  }
  return -1 // No empty slots
}

export function canAddModuleToChassis(chassis, module) {
  // Check if there's an empty slot
  return findEmptySlotInChassis(chassis) !== -1
}

// Get all modules from a chassis for weight calculation
export function getChassisModules(chassis) {
  return chassis.modules.filter((module) => module !== null)
}

// Update chassis in rack items array
export function updateChassisInRackItems(rackItems, chassisId, updatedChassis) {
  return rackItems.map((item) => (item.id === chassisId ? updatedChassis : item))
}

// Find chassis by ID in rack items
export function findChassisInRackItems(rackItems, chassisId) {
  return rackItems.find((item) => item.id === chassisId && item.type === "chassis")
}

// Get all chassis from rack items
export function getAllChassisFromRackItems(rackItems) {
  return rackItems.filter((item) => item.type === "chassis")
}

// Check if a module is already installed in any chassis
export function isModuleInstalled(rackItems, moduleId) {
  const allChassis = getAllChassisFromRackItems(rackItems)

  for (const chassis of allChassis) {
    for (const module of chassis.modules) {
      if (module && module.id === moduleId) {
        return { chassisId: chassis.id, chassis: chassis }
      }
    }
  }

  return null
}

// Get available chassis that can accept a module
export function getAvailableChassisForModule(rackItems, module) {
  const allChassis = getAllChassisFromRackItems(rackItems)

  return allChassis.filter((chassis) => canAddModuleToChassis(chassis, module))
}
