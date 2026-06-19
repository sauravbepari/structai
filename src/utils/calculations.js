// ============================================================
// UNIT CONVERSION UTILITIES
// ============================================================

export const convert = {
  // Length conversions
  ftToIn: (ft) => ft * 12,
  ftToCm: (ft) => ft * 30.48,
  ftToMm: (ft) => ft * 304.8,
  ftToM: (ft) => ft * 0.3048,

  inToFt: (inch) => inch / 12,
  inToCm: (inch) => inch * 2.54,
  inToMm: (inch) => inch * 25.4,
  inToM: (inch) => inch * 0.0254,

  cmToFt: (cm) => cm / 30.48,
  cmToIn: (cm) => cm / 2.54,
  cmToMm: (cm) => cm * 10,
  cmToM: (cm) => cm / 100,

  mmToFt: (mm) => mm / 304.8,
  mmToIn: (mm) => mm / 25.4,
  mmToCm: (mm) => mm / 10,
  mmToM: (mm) => mm / 1000,

  mToFt: (m) => m / 0.3048,
  mToIn: (m) => m / 0.0254,
  mToCm: (m) => m * 100,
  mToMm: (m) => m * 1000,

  // Parse feet-inch format: "3'-6\"" or "3'6"" → decimal feet
  parseFeetInch: (str) => {
    const clean = str.replace(/['"]/g, '').trim()
    const match = clean.match(/^(\d+(?:\.\d+)?)['\s-]*(\d+(?:\.\d+)?)?$/)
    if (!match) return null
    const feet = parseFloat(match[1]) || 0
    const inches = parseFloat(match[2]) || 0
    return feet + inches / 12
  },

  // Format decimal feet → "X'-Y\""
  formatFeetInch: (decimalFt) => {
    const ft = Math.floor(decimalFt)
    const inches = Math.round((decimalFt - ft) * 12)
    if (inches === 12) return `${ft + 1}'-0"`
    return `${ft}'-${inches}"`
  },

  // Convert any value to all units
  toAllUnits: (value, fromUnit) => {
    let mm
    switch (fromUnit.toLowerCase()) {
      case 'ft': case 'feet': mm = value * 304.8; break
      case 'in': case 'inch': case 'inches': mm = value * 25.4; break
      case 'cm': mm = value * 10; break
      case 'm': case 'meter': mm = value * 1000; break
      case 'mm': mm = value; break
      default: return null
    }
    return {
      mm: Math.round(mm * 100) / 100,
      cm: Math.round(mm / 10 * 100) / 100,
      m: Math.round(mm / 1000 * 1000) / 1000,
      ft: Math.round(mm / 304.8 * 1000) / 1000,
      in: Math.round(mm / 25.4 * 100) / 100,
      ftFormatted: convert.formatFeetInch(mm / 304.8),
    }
  }
}

// ============================================================
// RL / EL / GL CALCULATIONS
// ============================================================

export const elevation = {
  // Calculate depth from GL
  depthFromGL: (glElevation, bottomElevation) => {
    const depth = glElevation - bottomElevation
    return {
      depth_ft: Math.round(depth * 1000) / 1000,
      depth_in: Math.round(depth * 12 * 100) / 100,
      depth_cm: Math.round(depth * 30.48 * 100) / 100,
      depth_mm: Math.round(depth * 304.8),
      depth_m: Math.round(depth * 0.3048 * 1000) / 1000,
      formatted: convert.formatFeetInch(Math.abs(depth)),
    }
  },

  // Get foundation bottom from GL and depth
  foundationBottom: (glElevation, depthFt) => {
    return {
      elevation: glElevation - depthFt,
      formatted: `EL ${(glElevation - depthFt).toFixed(2)}'`,
    }
  },

  // Parse elevation string: "EL -3.50" or "GL -3'-6""
  parseElevation: (str) => {
    const clean = str.replace(/EL|GL|RL/gi, '').trim()
    const val = parseFloat(clean)
    return isNaN(val) ? null : val
  }
}

// ============================================================
// REBAR DATA (ACI 318 + BNBC 2020)
// ============================================================

export const rebarData = {
  // US customary rebar sizes
  US: {
    '#3': { diameter_in: 0.375, area_in2: 0.11, weight_lbft: 0.376, diameter_mm: 9.5 },
    '#4': { diameter_in: 0.500, area_in2: 0.20, weight_lbft: 0.668, diameter_mm: 12.7 },
    '#5': { diameter_in: 0.625, area_in2: 0.31, weight_lbft: 1.043, diameter_mm: 15.9 },
    '#6': { diameter_in: 0.750, area_in2: 0.44, weight_lbft: 1.502, diameter_mm: 19.1 },
    '#7': { diameter_in: 0.875, area_in2: 0.60, weight_lbft: 2.044, diameter_mm: 22.2 },
    '#8': { diameter_in: 1.000, area_in2: 0.79, weight_lbft: 2.670, diameter_mm: 25.4 },
    '#9': { diameter_in: 1.128, area_in2: 1.00, weight_lbft: 3.400, diameter_mm: 28.7 },
    '#10': { diameter_in: 1.270, area_in2: 1.27, weight_lbft: 4.303, diameter_mm: 32.3 },
    '#11': { diameter_in: 1.410, area_in2: 1.56, weight_lbft: 5.313, diameter_mm: 35.8 },
  },
  // Metric rebar (Bangladesh/SI)
  Metric: {
    'D10': { diameter_mm: 10, area_mm2: 78.5, weight_kgm: 0.617 },
    'D12': { diameter_mm: 12, area_mm2: 113.1, weight_kgm: 0.888 },
    'D16': { diameter_mm: 16, area_mm2: 201.1, weight_kgm: 1.578 },
    'D20': { diameter_mm: 20, area_mm2: 314.2, weight_kgm: 2.466 },
    'D22': { diameter_mm: 22, area_mm2: 380.1, weight_kgm: 2.984 },
    'D25': { diameter_mm: 25, area_mm2: 490.9, weight_kgm: 3.853 },
    'D28': { diameter_mm: 28, area_mm2: 615.8, weight_kgm: 4.834 },
    'D32': { diameter_mm: 32, area_mm2: 804.2, weight_kgm: 6.313 },
  },

  // Get total steel area for multiple bars
  totalArea: (barSize, count, system = 'US') => {
    const bar = rebarData[system][barSize]
    if (!bar) return null
    const areaKey = system === 'US' ? 'area_in2' : 'area_mm2'
    return {
      totalArea: bar[areaKey] * count,
      unit: system === 'US' ? 'in²' : 'mm²',
      perBar: bar[areaKey],
    }
  },

  // Calculate required bar count for target area
  barsRequired: (targetArea, barSize, system = 'US') => {
    const bar = rebarData[system][barSize]
    if (!bar) return null
    const areaKey = system === 'US' ? 'area_in2' : 'area_mm2'
    return Math.ceil(targetArea / bar[areaKey])
  }
}

// ============================================================
// FOUNDATION CALCULATIONS (ACI 318 / BNBC 2020)
// ============================================================

export const foundation = {
  // Isolated footing sizing
  isolatedFooting: ({ axialLoad_kip, soilCapacity_ksf, selfWeightFactor = 1.1 }) => {
    const totalLoad = axialLoad_kip * selfWeightFactor
    const area_ft2 = totalLoad / soilCapacity_ksf
    const side_ft = Math.sqrt(area_ft2)
    const roundedSide = Math.ceil(side_ft * 2) / 2 // round to nearest 6"
    return {
      required_area_ft2: Math.round(area_ft2 * 100) / 100,
      min_side_ft: Math.round(side_ft * 100) / 100,
      recommended_size: `${roundedSide}' × ${roundedSide}'`,
      recommended_size_in: `${roundedSide * 12}" × ${roundedSide * 12}"`,
      area_provided_ft2: roundedSide * roundedSide,
    }
  },

  // Minimum footing depth (ACI 318-19 13.3.1)
  minDepth_ACI: (barSize_in = 0.5) => {
    return {
      min_depth_in: Math.max(6, barSize_in * 3 + 3),
      cover_in: 3,
      note: 'ACI 318-19 §13.3.1: Min 6" for footings on soil, 3" clear cover'
    }
  },

  // Column pedestal sizing
  pedestalSize: (colWidth_in, colDepth_in) => {
    return {
      width_in: colWidth_in + 4,
      depth_in: colDepth_in + 4,
      note: 'Pedestal min 2" larger each side than column'
    }
  }
}

// ============================================================
// BEAM/COLUMN QUICK CHECKS
// ============================================================

export const structural = {
  // Beam depth rule of thumb (ACI 318 Table 9.3.1.1)
  beamDepthRuleOfThumb: (span_ft, condition = 'simply_supported') => {
    const ratios = {
      simply_supported: 16,
      one_end_continuous: 18.5,
      both_ends_continuous: 21,
      cantilever: 8,
    }
    const ratio = ratios[condition] || 16
    const depth_in = (span_ft * 12) / ratio
    return {
      min_depth_in: Math.round(depth_in * 10) / 10,
      min_depth_cm: Math.round(depth_in * 2.54 * 10) / 10,
      span_to_depth_ratio: ratio,
      note: `ACI 318-19 Table 9.3.1.1 — span/depth ≥ ${ratio}`,
    }
  },

  // Min column size
  minColumnSize: (axialLoad_kip, fc_psi = 4000, fy_psi = 60000, steelRatio = 0.02) => {
    const fc_ksi = fc_psi / 1000
    const fy_ksi = fy_psi / 1000
    const phi = 0.65
    const Ag = axialLoad_kip / (phi * (0.8 * (0.85 * fc_ksi * (1 - steelRatio) + fy_ksi * steelRatio)))
    const side_in = Math.sqrt(Ag)
    const roundedSide = Math.ceil(side_in / 2) * 2 // round to even inches
    return {
      required_Ag_in2: Math.round(Ag * 100) / 100,
      min_side_in: Math.round(side_in * 10) / 10,
      recommended_size: `${roundedSide}" × ${roundedSide}"`,
      note: `ACI 318-19 §22.4.2 — fc'=${fc_psi}psi, fy=${fy_psi}psi, ρ=${steelRatio * 100}%`
    }
  },

  // Slab thickness rule of thumb
  slabThickness: (span_ft, type = 'two_way') => {
    const minThickness = type === 'two_way'
      ? Math.max(5, (span_ft * 12) / 33)
      : Math.max(3.5, (span_ft * 12) / 20)
    return {
      min_thickness_in: Math.round(minThickness * 10) / 10,
      min_thickness_cm: Math.round(minThickness * 2.54 * 10) / 10,
      min_thickness_mm: Math.round(minThickness * 25.4),
      note: type === 'two_way'
        ? 'ACI 318-19 §8.3.1.1 — two-way slab'
        : 'ACI 318-19 §7.3.1.1 — one-way slab'
    }
  }
}

// ============================================================
// BUILD SYSTEM PROMPT FOR AI
// ============================================================

export const buildSystemPrompt = (codeStandard, knowledgeBase) => {
  const kbSummary = Object.entries(knowledgeBase)
    .map(([cat, items]) => items.length > 0
      ? `${cat.toUpperCase()} (${items.length} entries): ${items.slice(0, 3).map(i => i.title || i.name || JSON.stringify(i)).join(', ')}`
      : null
    )
    .filter(Boolean)
    .join('\n')

  return `You are StructAI — a professional structural engineering assistant specialized in building design, AutoCAD drawing analysis, and structural calculations.

PRIMARY CODE STANDARD: ${codeStandard === 'ACI318' ? 'ACI 318-19 (US standard)' : 'BNBC 2020 (Bangladesh National Building Code)'}

YOUR EXPERTISE:
- Foundation design: isolated, combined, strip, raft footings
- Structural members: beams, columns, slabs, shear walls
- Rebar/reinforcement: sizing, spacing, detailing per ACI 318 / BNBC 2020
- Section analysis: cutting planes, cross-sections, elevation details
- AutoCAD drawing interpretation: DXF geometry, layers, dimensions
- Unit conversions: feet-inches, mm, cm, meters (RL/EL/GL elevations)
- Load calculations: dead, live, wind, seismic

UNIT HANDLING:
- Always show results in multiple units: ft-in, cm, mm
- For elevations: show RL, EL, GL relationships clearly
- Verify all calculations step-by-step

DRAWING ANALYSIS:
When analyzing uploaded drawings or DXF data:
1. Identify structural elements (columns, beams, walls, footings)
2. Check critical dimensions and code compliance
3. Suggest rebar placement with bar sizes and spacing
4. Note any missing elements or structural concerns
5. Describe what a section cut would look like

KNOWLEDGE BASE:
${kbSummary || 'No custom knowledge base entries yet.'}

RESPONSE FORMAT:
- Lead with the key finding or answer
- Show calculations step-by-step with units
- Reference specific ACI/BNBC sections
- Use structured format with clear headings
- For drawings: describe visual output with dimensions
- Flag any code violations with ⚠️
- Flag recommendations with ✅
- Be direct and technical — the user is a structural engineer

LANGUAGE: Respond in Bengali (Banglish is fine) mixed with English technical terms. Use English for all measurements, code references, and technical specifications.`
}
