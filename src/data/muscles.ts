import type { MuscleDef, MuscleGroup } from '../types'

// Ported from the standalone Three.js prototype. Positions/scales are in
// body-space units (figure is ~1.8 units tall). shape:'dome' = a hemisphere
// bulge whose apex points along `normal` (chest/shoulder/glute caps).
// shape:'ellipsoid' = a tapered fusiform belly oriented by `rot` (limb
// muscles, traps, lats, abs, etc). side:'both' auto-mirrors left/right.
export const REGION_ORDER: MuscleGroup[] = ['Chest', 'Shoulders', 'Back', 'Arms', 'Core', 'Legs']

export const MUSCLES: MuscleDef[] = [
  { id: 'pec_major', name: 'Pectoralis Major', group: 'Chest', side: 'both', shape: 'dome', pos: [0.10, 0.40, 0.10], scale: [0.125, 0.075, 0.10], normal: [0.45, 0.15, 0.88] },
  { id: 'serratus', name: 'Serratus Anterior', group: 'Chest', side: 'both', shape: 'dome', pos: [0.155, 0.31, 0.06], scale: [0.045, 0.05, 0.045], normal: [0.65, 0.0, 0.7] },

  { id: 'anterior_delt', name: 'Anterior Deltoid', group: 'Shoulders', side: 'both', shape: 'dome', pos: [0.195, 0.525, 0.055], scale: [0.075, 0.075, 0.075], normal: [0.5, 0.4, 0.75] },
  { id: 'lateral_delt', name: 'Lateral Deltoid', group: 'Shoulders', side: 'both', shape: 'dome', pos: [0.225, 0.52, -0.01], scale: [0.075, 0.08, 0.075], normal: [0.95, 0.28, 0.05] },
  { id: 'posterior_delt', name: 'Posterior Deltoid', group: 'Shoulders', side: 'both', shape: 'dome', pos: [0.195, 0.515, -0.075], scale: [0.07, 0.07, 0.07], normal: [0.5, 0.4, -0.75] },

  { id: 'upper_traps', name: 'Upper Trapezius', group: 'Back', side: 'both', shape: 'ellipsoid', pos: [0.095, 0.575, -0.045], scale: [0.07, 0.075, 0.06], rot: [15, 0, 12] },
  { id: 'mid_lower_traps', name: 'Mid / Lower Trapezius', group: 'Back', side: 'both', shape: 'ellipsoid', pos: [0.08, 0.42, -0.105], scale: [0.065, 0.16, 0.05], rot: [0, 0, 0] },
  { id: 'rhomboids', name: 'Rhomboids', group: 'Back', side: 'both', shape: 'ellipsoid', pos: [0.065, 0.38, -0.105], scale: [0.045, 0.09, 0.04], rot: [0, 0, 0] },
  { id: 'lat', name: 'Latissimus Dorsi', group: 'Back', side: 'both', shape: 'ellipsoid', pos: [0.155, 0.29, -0.09], scale: [0.09, 0.18, 0.06], rot: [0, 0, -12] },
  { id: 'teres_major', name: 'Teres Major', group: 'Back', side: 'both', shape: 'dome', pos: [0.175, 0.32, -0.06], scale: [0.045, 0.05, 0.045], normal: [0.6, -0.1, -0.75] },
  { id: 'erector_spinae', name: 'Erector Spinae', group: 'Back', side: 'center', shape: 'ellipsoid', pos: [0, 0.22, -0.115], scale: [0.045, 0.30, 0.045], rot: [0, 0, 0] },

  { id: 'biceps', name: 'Biceps Brachii', group: 'Arms', side: 'both', shape: 'ellipsoid', pos: [0.245, 0.40, 0.06], scale: [0.05, 0.15, 0.05], rot: [0, 0, 12] },
  { id: 'triceps', name: 'Triceps Brachii', group: 'Arms', side: 'both', shape: 'ellipsoid', pos: [0.245, 0.40, -0.06], scale: [0.05, 0.15, 0.05], rot: [0, 0, 12] },
  { id: 'forearm_flexors', name: 'Forearm Flexors', group: 'Arms', side: 'both', shape: 'ellipsoid', pos: [0.30, 0.16, 0.045], scale: [0.04, 0.13, 0.04], rot: [0, 0, 6] },
  { id: 'forearm_extensors', name: 'Forearm Extensors', group: 'Arms', side: 'both', shape: 'ellipsoid', pos: [0.30, 0.16, -0.045], scale: [0.04, 0.13, 0.04], rot: [0, 0, 6] },

  { id: 'rectus_abd_upper', name: 'Rectus Abdominis (upper)', group: 'Core', side: 'center', shape: 'ellipsoid', pos: [0, 0.28, 0.115], scale: [0.100, 0.07, 0.04], rot: [0, 0, 0] },
  { id: 'rectus_abd_lower', name: 'Rectus Abdominis (lower)', group: 'Core', side: 'center', shape: 'ellipsoid', pos: [0, 0.16, 0.115], scale: [0.085, 0.05, 0.04], rot: [0, 0, 0] },
  { id: 'obliques', name: 'External Obliques', group: 'Core', side: 'both', shape: 'ellipsoid', pos: [0.125, 0.20, 0.075], scale: [0.045, 0.15, 0.05], rot: [0, 0, -12] },
  { id: 'hip_flexors', name: 'Hip Flexors (Iliopsoas)', group: 'Core', side: 'both', shape: 'ellipsoid', pos: [0.09, -0.01, 0.075], scale: [0.045, 0.13, 0.045], rot: [0, 0, 0] },

  { id: 'glute_max', name: 'Gluteus Maximus', group: 'Legs', side: 'both', shape: 'ellipsoid', pos: [0.10, -0.05, -0.10], scale: [0.095, 0.15, 0.085], rot: [0, 0, 0] },
  { id: 'glute_med', name: 'Gluteus Medius', group: 'Legs', side: 'both', shape: 'dome', pos: [0.145, 0.03, -0.03], scale: [0.05, 0.055, 0.05], normal: [0.9, 0.15, -0.25] },
  { id: 'quad_rectus', name: 'Quadriceps - Rectus Femoris', group: 'Legs', side: 'both', shape: 'ellipsoid', pos: [0.10, -0.22, 0.09], scale: [0.05, 0.24, 0.045], rot: [0, 0, 0] },
  { id: 'quad_lateral', name: 'Quadriceps - Vastus Lateralis', group: 'Legs', side: 'both', shape: 'ellipsoid', pos: [0.15, -0.24, 0.03], scale: [0.045, 0.22, 0.045], rot: [0, 0, 0] },
  { id: 'quad_medial', name: 'Quadriceps - Vastus Medialis', group: 'Legs', side: 'both', shape: 'ellipsoid', pos: [0.075, -0.30, 0.10], scale: [0.035, 0.13, 0.04], rot: [0, 0, 0] },
  { id: 'adductors', name: 'Adductors', group: 'Legs', side: 'both', shape: 'ellipsoid', pos: [0.06, -0.20, 0.0], scale: [0.045, 0.24, 0.055], rot: [0, 0, 0] },
  { id: 'hamstrings', name: 'Hamstrings', group: 'Legs', side: 'both', shape: 'ellipsoid', pos: [0.10, -0.24, -0.08], scale: [0.055, 0.26, 0.055], rot: [0, 0, 0] },
  { id: 'gastrocnemius', name: 'Gastrocnemius', group: 'Legs', side: 'both', shape: 'ellipsoid', pos: [0.10, -0.55, -0.07], scale: [0.05, 0.16, 0.055], rot: [0, 0, 0] },
  { id: 'soleus', name: 'Soleus', group: 'Legs', side: 'both', shape: 'ellipsoid', pos: [0.10, -0.68, -0.06], scale: [0.04, 0.12, 0.045], rot: [0, 0, 0] },
  { id: 'tibialis_anterior', name: 'Tibialis Anterior', group: 'Legs', side: 'both', shape: 'ellipsoid', pos: [0.10, -0.60, 0.06], scale: [0.035, 0.18, 0.035], rot: [0, 0, 0] },
]

export const MUSCLE_BY_ID: Record<string, MuscleDef> = Object.fromEntries(MUSCLES.map((m) => [m.id, m]))

export const ALL_MUSCLE_IDS: string[] = MUSCLES.map((m) => m.id)

/** Single source of truth for "which muscle ids belong to which body region" - used by both the 3D model's sidebar list and the scoring/progress-bar logic. */
export const MUSCLE_IDS_BY_GROUP: Record<MuscleGroup, string[]> = REGION_ORDER.reduce(
  (acc, group) => {
    acc[group] = MUSCLES.filter((m) => m.group === group).map((m) => m.id)
    return acc
  },
  {} as Record<MuscleGroup, string[]>,
)
