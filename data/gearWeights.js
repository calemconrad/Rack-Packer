// Comprehensive weight database for audio equipment
export const gearWeights = {
  // Power Conditioners
  "Furman PL-8C Power Conditioner": 4.5,
  "Furman P-1800 PF Prestige Power Conditioner": 8.2,
  "Furman M-8x2": 6.8,
  "Furman AR-1215": 12.5,

  // Audio Interfaces
  "Universal Audio Apollo x8": 12.0,
  "Universal Audio Apollo x4": 8.5,
  "Universal Audio Apollo Twin MKII DUO": 3.2,
  "Universal Audio Apollo Twin MKII QUAD": 3.8,
  "Focusrite Scarlett 2i2": 1.8,
  "Focusrite Scarlett 4i4": 2.2,
  "Focusrite Scarlett 8i6": 3.1,
  "RME Fireface UCX": 4.2,
  "RME Fireface UFX": 8.8,

  // Preamps
  "Neve 1073": 8.2,
  "Neve 1084": 9.1,
  "BAE 1073": 8.0,
  "BAE 1084": 8.8,
  "API 3124+": 12.5,
  "API 512c Preamp": 1.2,
  "Chandler Limited TG2": 15.2,
  "Great River MP-500NV": 1.8,

  // Dynamics Processing
  "Empirical Labs Distressor EL8": 6.0,
  "Empirical Labs EL8-X": 6.2,
  "DBX 266xs": 4.8,
  "DBX 160A": 8.5,
  "Urei 1176": 12.0,
  "Teletronix LA-2A": 18.5,
  "SSL G-Series Bus Compressor": 14.2,

  // EQ
  "Pultec EQP-1A": 22.0,
  "Manley Massive Passive": 28.5,
  "API 550A": 1.5,
  "API 560": 1.3,
  "Neve 1073 EQ": 1.8,
  "SSL 500-EQ": 1.1,

  // 500-series Chassis
  "500-Series Chassis (6 slots)": 8.5,
  "500-Series Chassis (10 slots)": 12.8,
  "API 500-6B": 9.2,
  "API 500-VPR": 15.8,
  "Radial Workhorse": 11.5,

  // 500-series Modules
  "API 512c": 1.2,
  "API 550A": 1.5,
  "API 560": 1.3,
  "Neve 1073LB": 1.8,
  "SSL 500-EQ": 1.1,
  "Chandler TG2-500": 1.6,
  "Great River MP-500NV": 1.8,
  "Empirical Labs EL-500": 1.4,

  // Monitors & Speakers
  "Yamaha NS-10M": 22.0,
  "KRK Rokit 5": 11.2,
  "Genelec 8040A": 15.4,
  "Mackie HR824": 28.6,

  // Mixers
  "Allen & Heath SQ-5": 15.4,
  "Yamaha 01V96i": 12.1,
  "Mackie 1604-VLZ4": 18.2,
  "Soundcraft Signature 22": 14.8,

  // Effects & Processors
  "Lexicon PCM 70": 8.5,
  "Eventide H3000": 12.2,
  "TC Electronic M-One": 4.8,
  "Yamaha SPX90": 6.2,
  "AMS DMX 15-80S": 45.0,

  // Custom/Utility Items
  "1U Black Panel": 0.8,
  "2U Black Panel": 1.6,
  "3U Black Panel": 2.4,
  "4U Black Panel": 3.2,
  "1U Rack Shelf": 4.2,
  "2U Rack Shelf": 8.5,
  "3U Rack Shelf": 12.8,
  "4U Rack Shelf": 17.0,
  "1U Drawer": 6.5,
  "2U Drawer": 12.0,
  "Rack Light": 2.1,
  "Power Strip": 3.2,

  // Default weights for unknown items
  "Unknown 1U": 5.0,
  "Unknown 2U": 10.0,
  "Unknown 3U": 15.0,
  "Unknown 4U": 20.0,
}

// Get weight for an item, with fallback to estimated weight based on rack units
export function getItemWeight(itemName, units = 1) {
  if (gearWeights[itemName]) {
    return gearWeights[itemName]
  }

  // Fallback estimation: 5 lbs per rack unit
  return units * 5.0
}

// Rack weight capacity limits (in lbs)
export const rackCapacities = {
  fly: {
    4: 40,
    6: 60,
    8: 80,
    12: 120,
  },
  tour: {
    12: 150,
    16: 200,
    20: 250,
    24: 300,
    32: 400,
  },
}
