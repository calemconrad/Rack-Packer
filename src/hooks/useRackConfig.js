// Custom hook to extract rack configuration in a clean way
export function useRackConfig(currentRack) {
  if (!currentRack) {
    return {
      rackType: null,
      rackSizeU: null,
      rackWidth: null,
      isValidRack: false,
    }
  }

  return {
    rackType: currentRack.type,
    rackSizeU: currentRack.units,
    rackWidth: currentRack.width,
    isValidRack: true,
  }
}
