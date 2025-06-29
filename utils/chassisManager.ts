export function findEmptySlotInChassis(chassis: any): number {
  if (!chassis.modules) return -1

  for (let i = 0; i < chassis.modules.length; i++) {
    if (!chassis.modules[i]) return i
  }
  return -1
}

export function addModuleToChassis(chassis: any, module: any, slotIndex: number) {
  const updatedChassis = { ...chassis }
  if (!updatedChassis.modules) {
    updatedChassis.modules = Array(chassis.slots || 6).fill(null)
  }

  updatedChassis.modules = [...updatedChassis.modules]
  updatedChassis.modules[slotIndex] = {
    ...module,
    id: `module-${Date.now()}-${slotIndex}`,
  }

  return updatedChassis
}

export function removeModuleFromChassis(chassis: any, slotIndex: number) {
  const updatedChassis = { ...chassis }
  if (!updatedChassis.modules) return updatedChassis

  updatedChassis.modules = [...updatedChassis.modules]
  updatedChassis.modules[slotIndex] = null

  return updatedChassis
}
