const RACK_UNIT_HEIGHT = 44

/**
 * Converts mouse Y position to correct rack unit position
 * @param mouseY - Mouse Y position relative to rack container
 * @param rackUnits - Total units in current rack
 * @returns Correct rack unit number (1-based index)
 */
export const convertMouseYToRackUnit = (mouseY: number, rackUnits: number): number => {
  // Directly convert mouseY to rack unit using the SAME
  // logic as calculateGearPosition (but in reverse)
  const rawUnit = Math.floor(mouseY / RACK_UNIT_HEIGHT)
  const rackUnit = rackUnits - rawUnit

  // Clamp between 1 and max units
  return Math.max(1, Math.min(rackUnits, rackUnit))
}
