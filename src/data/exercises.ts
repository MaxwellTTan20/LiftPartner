import { MUSCLE_BY_ID } from './muscles'
import type { Equipment, Exercise, MuscleGroup } from '../types'

// Exercise -> muscle emphasis table. Weights are roughly 0..1, where 1.0 is
// the prime mover for that lift. These are reasonable estimates (not lab
// measurements) - tune freely as you learn more about how your users train.
export const EXERCISES: Exercise[] = [
  // ---- Arms ----
  { id: 'dumbbell_curls', name: 'Dumbbell Curls', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { biceps: 1.0, forearm_flexors: 0.3 } },
  { id: 'concentration_curls', name: 'Concentration Curls', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { biceps: 1.0, forearm_flexors: 0.2 } },
  { id: 'incline_dumbbell_curls', name: 'Incline Dumbbell Curls', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { biceps: 1.0, forearm_flexors: 0.2 } },
  { id: 'hammer_curls', name: 'Hammer Curls', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { biceps: 0.7, forearm_flexors: 0.6 } },
  { id: 'low_pulley_curls', name: 'Low-Pulley Curls', equipment: 'Cable', logType: 'reps_weight', muscles: { biceps: 1.0, forearm_flexors: 0.3 } },
  { id: 'high_pulley_curls', name: 'High-Pulley Curls', equipment: 'Cable', logType: 'reps_weight', muscles: { biceps: 1.0, forearm_flexors: 0.2 } },
  { id: 'barbell_curls', name: 'Barbell Curls', equipment: 'Barbell', logType: 'reps_weight', muscles: { biceps: 1.0, forearm_flexors: 0.3 } },
  { id: 'machine_curls', name: 'Machine Curls', equipment: 'Machine', logType: 'reps_weight', muscles: { biceps: 1.0, forearm_flexors: 0.2 } },
  { id: 'preacher_curls', name: 'Preacher Curls', equipment: 'Barbell', logType: 'reps_weight', muscles: { biceps: 1.0, forearm_flexors: 0.15 } },
  { id: 'standing_reverse_wrist_curls', name: 'Standing Reverse Wrist Curls', equipment: 'Barbell', logType: 'reps_weight', muscles: { forearm_extensors: 1.0 } },
  { id: 'seated_reverse_wrist_curls', name: 'Seated Reverse Wrist Curls', equipment: 'Barbell', logType: 'reps_weight', muscles: { forearm_extensors: 1.0 } },
  { id: 'wrist_curls', name: 'Wrist Curls', equipment: 'Barbell', logType: 'reps_weight', muscles: { forearm_flexors: 1.0 } },
  { id: 'finger_curls', name: 'Finger Curls', equipment: 'Barbell', logType: 'reps_weight', muscles: { forearm_flexors: 1.0 } },
  { id: 'reverse_barbell_curls', name: 'Reverse Barbell Curls', equipment: 'Barbell', logType: 'reps_weight', muscles: { forearm_extensors: 0.6, biceps: 0.5 } },
  { id: 'triceps_pushdowns', name: 'Triceps Push-Downs', equipment: 'Cable', logType: 'reps_weight', muscles: { triceps: 1.0 } },
  { id: 'reverse_triceps_pushdowns', name: 'Reverse Triceps Push-Downs', equipment: 'Cable', logType: 'reps_weight', muscles: { triceps: 1.0, forearm_extensors: 0.2 } },
  { id: 'one_arm_reverse_triceps_pushdowns', name: 'One-Arm Reverse Triceps Push-Downs', equipment: 'Cable', logType: 'reps_weight', muscles: { triceps: 1.0, forearm_extensors: 0.2 } },
  { id: 'triceps_pushdowns_rope', name: 'Triceps Push-Downs with Rope', equipment: 'Cable', logType: 'reps_weight', muscles: { triceps: 1.0 } },
  { id: 'seated_overhead_triceps_extensions', name: 'Seated Overhead Triceps Extensions', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { triceps: 1.0 } },
  { id: 'standing_overhead_cable_triceps_extensions', name: 'Standing Overhead Cable Triceps Extensions', equipment: 'Cable', logType: 'reps_weight', muscles: { triceps: 1.0 } },
  { id: 'lying_barbell_triceps_extensions', name: 'Lying Barbell Triceps Extensions', equipment: 'Barbell', logType: 'reps_weight', muscles: { triceps: 1.0 } },
  { id: 'lying_dumbbell_triceps_extensions', name: 'Lying Dumbbell Triceps Extensions', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { triceps: 1.0 } },
  { id: 'one_arm_overhead_dumbbell_triceps_extensions', name: 'One-Arm Overhead Dumbbell Triceps Extensions', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { triceps: 1.0 } },
  { id: 'triceps_kickbacks', name: 'Triceps Kickbacks', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { triceps: 1.0 } },
  { id: 'seated_dumbbell_triceps_extensions', name: 'Seated Dumbbell Triceps Extensions', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { triceps: 1.0 } },
  { id: 'seated_ez_curl_bar_triceps_extensions', name: 'Seated EZ Curl Bar Triceps Extensions', equipment: 'Barbell', logType: 'reps_weight', muscles: { triceps: 1.0 } },
  { id: 'triceps_dips', name: 'Triceps Dips', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { triceps: 0.9, pec_major: 0.4, anterior_delt: 0.2 } },
  { id: 'machine_tricep_dips', name: 'Machine Tricep Dips', equipment: 'Machine', logType: 'reps_weight', muscles: { triceps: 0.9, pec_major: 0.4, anterior_delt: 0.2 } },

  // ---- Shoulders ----
  { id: 'back_presses', name: 'Back Presses', equipment: 'Barbell', logType: 'reps_weight', muscles: { lateral_delt: 0.9, anterior_delt: 0.6, triceps: 0.5, upper_traps: 0.2 } },
  { id: 'seated_front_presses', name: 'Seated Front Presses', equipment: 'Barbell', logType: 'reps_weight', muscles: { anterior_delt: 1.0, lateral_delt: 0.5, triceps: 0.6 } },
  { id: 'seated_dumbbell_presses', name: 'Seated Dumbbell Presses', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { anterior_delt: 0.9, lateral_delt: 0.6, triceps: 0.5 } },
  { id: 'arnold_presses', name: 'Arnold Presses', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { anterior_delt: 0.9, lateral_delt: 0.7, triceps: 0.4 } },
  { id: 'lateral_dumbbell_raises', name: 'Lateral Dumbbell Raises', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { lateral_delt: 1.0, anterior_delt: 0.1 } },
  { id: 'bent_over_lateral_dumbbell_raises', name: 'Bent-Over Lateral Dumbbell Raises', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { posterior_delt: 1.0, rhomboids: 0.2 } },
  { id: 'alternating_front_dumbbell_raises', name: 'Alternating Front Dumbbell Raises', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { anterior_delt: 1.0 } },
  { id: 'side_lying_lateral_dumbbell_raises', name: 'Side-Lying Lateral Dumbbell Raises', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { lateral_delt: 1.0 } },
  { id: 'low_pulley_alternating_front_raises', name: 'Low-Pulley Alternating Front Raises', equipment: 'Cable', logType: 'reps_weight', muscles: { anterior_delt: 1.0 } },
  { id: 'low_pulley_front_raises_neutral_grip', name: 'Low-Pulley Front Raises with a Neutral Grip', equipment: 'Cable', logType: 'reps_weight', muscles: { anterior_delt: 1.0 } },
  { id: 'high_pulley_lateral_extensions', name: 'High-Pulley Lateral Extensions', equipment: 'Cable', logType: 'reps_weight', muscles: { lateral_delt: 1.0 } },
  { id: 'pulley_external_arm_rotations', name: 'Pulley External Arm Rotations', equipment: 'Cable', logType: 'reps_weight', muscles: { posterior_delt: 0.7, lateral_delt: 0.2 } },
  { id: 'low_pulley_bent_over_lateral_raises', name: 'Low-Pulley Bent-Over Lateral Raises', equipment: 'Cable', logType: 'reps_weight', muscles: { posterior_delt: 1.0 } },
  { id: 'low_pulley_lateral_raises', name: 'Low-Pulley Lateral Raises', equipment: 'Cable', logType: 'reps_weight', muscles: { lateral_delt: 1.0 } },
  { id: 'one_dumbbell_front_raises', name: 'One-Dumbbell Front Raises', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { anterior_delt: 1.0 } },
  { id: 'barbell_front_raises', name: 'Barbell Front Raises', equipment: 'Barbell', logType: 'reps_weight', muscles: { anterior_delt: 1.0 } },
  { id: 'upright_rows', name: 'Upright Rows', equipment: 'Barbell', logType: 'reps_weight', muscles: { lateral_delt: 0.7, upper_traps: 0.6, biceps: 0.2 } },
  { id: 'machine_lateral_raises', name: 'Machine Lateral Raises', equipment: 'Machine', logType: 'reps_weight', muscles: { lateral_delt: 1.0 } },
  { id: 'pec_deck_rear_delt_laterals', name: 'Pec Deck Rear-Delt Laterals', equipment: 'Machine', logType: 'reps_weight', muscles: { posterior_delt: 1.0, rhomboids: 0.2 } },

  // ---- Chest ----
  { id: 'incline_bench_presses', name: 'Incline Bench Presses', equipment: 'Barbell', logType: 'reps_weight', muscles: { pec_major: 0.9, anterior_delt: 0.6, triceps: 0.5 } },
  { id: 'bench_presses', name: 'Bench Presses', equipment: 'Barbell', logType: 'reps_weight', muscles: { pec_major: 1.0, anterior_delt: 0.5, triceps: 0.6, serratus: 0.2 } },
  { id: 'close_grip_bench_presses', name: 'Close-Grip Bench Presses', equipment: 'Barbell', logType: 'reps_weight', muscles: { triceps: 0.9, pec_major: 0.5, anterior_delt: 0.3 } },
  { id: 'decline_bench_presses', name: 'Decline Bench Presses', equipment: 'Barbell', logType: 'reps_weight', muscles: { pec_major: 1.0, triceps: 0.5 } },
  { id: 'machine_bench_presses', name: 'Machine Bench Presses', equipment: 'Machine', logType: 'reps_weight', muscles: { pec_major: 1.0, anterior_delt: 0.4, triceps: 0.5 } },
  { id: 'parallel_bar_dips', name: 'Parallel Bar Dips', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { pec_major: 0.8, triceps: 0.7, anterior_delt: 0.3 } },
  { id: 'pushups', name: 'Push-Ups', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { pec_major: 1.0, anterior_delt: 0.4, triceps: 0.5, serratus: 0.3, rectus_abd_upper: 0.2 } },
  { id: 'dumbbell_bench_presses', name: 'Dumbbell Bench Presses', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { pec_major: 1.0, anterior_delt: 0.45, triceps: 0.5 } },
  { id: 'dumbbell_flys', name: 'Dumbbell Flys', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { pec_major: 1.0, anterior_delt: 0.2 } },
  { id: 'incline_dumbbell_presses', name: 'Incline Dumbbell Presses', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { pec_major: 0.9, anterior_delt: 0.6, triceps: 0.4 } },
  { id: 'incline_dumbbell_flys', name: 'Incline Dumbbell Flys', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { pec_major: 1.0, anterior_delt: 0.25 } },
  { id: 'pec_deck_flys', name: 'Pec Deck Flys', equipment: 'Machine', logType: 'reps_weight', muscles: { pec_major: 1.0 } },
  { id: 'cable_middle_fly', name: 'Cable Middle Fly', equipment: 'Cable', logType: 'reps_weight', muscles: { pec_major: 1.0, anterior_delt: 0.2 } },
  { id: 'cable_low_fly', name: 'Cable Low Fly', equipment: 'Cable', logType: 'reps_weight', muscles: { pec_major: 1.0, anterior_delt: 0.35 } },
  { id: 'cable_middle_chest_press', name: 'Cable Middle Chest Press', equipment: 'Cable', logType: 'reps_weight', muscles: { pec_major: 1.0, anterior_delt: 0.4, triceps: 0.5 } },
  { id: 'cable_low_chest_press', name: 'Cable Low Chest Press', equipment: 'Cable', logType: 'reps_weight', muscles: { pec_major: 0.9, anterior_delt: 0.6, triceps: 0.4 } },
  { id: 'dumbbell_pullovers', name: 'Dumbbell Pullovers', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { lat: 0.6, pec_major: 0.6, serratus: 0.2 } },
  { id: 'barbell_pullovers', name: 'Barbell Pullovers', equipment: 'Barbell', logType: 'reps_weight', muscles: { lat: 0.6, pec_major: 0.6, serratus: 0.2 } },

  // ---- Back ----
  { id: 'chinups', name: 'Chin-Ups', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { lat: 0.9, biceps: 0.8, teres_major: 0.4 } },
  { id: 'pullups', name: 'Pull-Ups', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { lat: 1.0, biceps: 0.6, teres_major: 0.5, rhomboids: 0.4, mid_lower_traps: 0.3, forearm_flexors: 0.3 } },
  { id: 'lat_pulldowns', name: 'Lat Pull-Downs', equipment: 'Cable', logType: 'reps_weight', muscles: { lat: 1.0, biceps: 0.5, teres_major: 0.4, rhomboids: 0.3 } },
  { id: 'pulldowns_behind_neck', name: 'Pull-Downs Behind the Neck', equipment: 'Cable', logType: 'reps_weight', muscles: { lat: 1.0, teres_major: 0.4 } },
  { id: 'close_grip_lat_pulldowns', name: 'Close-Grip Lat Pull-Downs', equipment: 'Cable', logType: 'reps_weight', muscles: { lat: 1.0, biceps: 0.5 } },
  { id: 'straight_arm_pulldowns', name: 'Straight-Arm Pull-Downs', equipment: 'Cable', logType: 'reps_weight', muscles: { lat: 1.0, serratus: 0.2 } },
  { id: 'close_grip_seated_rows_semipronated', name: 'Close-Grip Seated Rows with a Semipronated Grip', equipment: 'Cable', logType: 'reps_weight', muscles: { lat: 0.7, mid_lower_traps: 0.6, rhomboids: 0.4, biceps: 0.4 } },
  { id: 'wide_grip_seated_rows_overhand', name: 'Wide-Grip Seated Rows with an Overhand Grip', equipment: 'Cable', logType: 'reps_weight', muscles: { mid_lower_traps: 0.7, rhomboids: 0.6, posterior_delt: 0.3, lat: 0.5 } },
  { id: 'single_arm_dumbbell_rows', name: 'Single-Arm Dumbbell Rows', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { lat: 0.9, rhomboids: 0.5, mid_lower_traps: 0.4, biceps: 0.4, teres_major: 0.3 } },
  { id: 'bent_over_dumbbell_rows', name: 'Bent-Over Dumbbell Rows', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { lat: 0.8, mid_lower_traps: 0.5, rhomboids: 0.5, biceps: 0.3, posterior_delt: 0.2 } },
  { id: 'barbell_rows', name: 'Barbell Rows', equipment: 'Barbell', logType: 'reps_weight', muscles: { lat: 0.8, mid_lower_traps: 0.6, rhomboids: 0.6, biceps: 0.4, erector_spinae: 0.4, posterior_delt: 0.3 } },
  { id: 'close_grip_upright_rows', name: 'Close-Grip Upright Rows', equipment: 'Barbell', logType: 'reps_weight', muscles: { lateral_delt: 0.6, upper_traps: 0.6, biceps: 0.2 } },
  { id: 't_bar_rows', name: 'T-Bar Rows', equipment: 'Machine', logType: 'reps_weight', muscles: { lat: 0.8, mid_lower_traps: 0.6, rhomboids: 0.5, biceps: 0.3 } },
  { id: 'abdominal_supported_t_bar_rows', name: 'Abdominal-Supported T-Bar Rows', equipment: 'Machine', logType: 'reps_weight', muscles: { lat: 0.8, mid_lower_traps: 0.6, rhomboids: 0.5 } },
  { id: 'stiff_legged_deadlifts', name: 'Stiff-Legged Deadlifts', equipment: 'Barbell', logType: 'reps_weight', muscles: { hamstrings: 1.0, glute_max: 0.7, erector_spinae: 0.6 } },
  { id: 'sumo_deadlifts', name: 'Sumo Deadlifts', equipment: 'Barbell', logType: 'reps_weight', muscles: { glute_max: 0.8, adductors: 0.7, hamstrings: 0.6, quad_rectus: 0.4, erector_spinae: 0.5, forearm_flexors: 0.4 } },
  { id: 'deadlifts', name: 'Deadlifts', equipment: 'Barbell', logType: 'reps_weight', muscles: { erector_spinae: 1.0, glute_max: 0.9, hamstrings: 0.8, lat: 0.4, forearm_flexors: 0.5, mid_lower_traps: 0.3, quad_rectus: 0.3 } },
  { id: 'trap_bar_deadlifts', name: 'Trap Bar Deadlifts', equipment: 'Barbell', logType: 'reps_weight', muscles: { glute_max: 0.8, quad_rectus: 0.6, hamstrings: 0.6, erector_spinae: 0.6 } },
  { id: 'back_extensions', name: 'Back Extensions', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { erector_spinae: 1.0, glute_max: 0.5, hamstrings: 0.3 } },
  { id: 'machine_back_extensions', name: 'Machine Back Extensions', equipment: 'Machine', logType: 'reps_weight', muscles: { erector_spinae: 1.0, glute_max: 0.4, hamstrings: 0.3 } },
  { id: 'barbell_shrugs', name: 'Barbell Shrugs', equipment: 'Barbell', logType: 'reps_weight', muscles: { upper_traps: 1.0, forearm_flexors: 0.2 } },
  { id: 'dumbbell_shrugs', name: 'Dumbbell Shrugs', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { upper_traps: 1.0, forearm_flexors: 0.2 } },
  { id: 'trap_bar_shrugs', name: 'Trap Bar Shrugs', equipment: 'Barbell', logType: 'reps_weight', muscles: { upper_traps: 1.0, forearm_flexors: 0.2 } },
  { id: 'machine_shrugs', name: 'Machine Shrugs', equipment: 'Machine', logType: 'reps_weight', muscles: { upper_traps: 1.0 } },
  { id: 'smith_machine_shrugs', name: "Delavier's Shrugs (Smith Machine)", equipment: 'Machine', logType: 'reps_weight', muscles: { upper_traps: 1.0 } },
  { id: 'high_pulley_neck_pulls', name: 'High-Pulley Neck Pulls', equipment: 'Cable', logType: 'reps_weight', muscles: { upper_traps: 0.5, erector_spinae: 0.3 } },
  { id: 'high_pulley_neck_extensions', name: 'High-Pulley Neck Extensions', equipment: 'Cable', logType: 'reps_weight', muscles: { upper_traps: 0.5, erector_spinae: 0.3 } },
  { id: 'standing_crossover_reverse_fly', name: 'Standing Cross-over Reverse Fly', equipment: 'Cable', logType: 'reps_weight', muscles: { rhomboids: 1.0, posterior_delt: 0.7, mid_lower_traps: 0.3 } },

  // ---- Legs ----
  { id: 'dumbbell_squats', name: 'Dumbbell Squats', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { quad_rectus: 1.0, quad_lateral: 0.8, quad_medial: 0.8, glute_max: 0.6 } },
  { id: 'sumo_dumbbell_squats', name: 'Sumo Dumbbell Squats', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { glute_max: 0.7, adductors: 0.7, quad_rectus: 0.6 } },
  { id: 'front_squats', name: 'Front Squats', equipment: 'Barbell', logType: 'reps_weight', muscles: { quad_rectus: 1.0, quad_lateral: 0.85, quad_medial: 0.85, glute_max: 0.6, erector_spinae: 0.35 } },
  { id: 'squats', name: 'Squats', equipment: 'Barbell', logType: 'reps_weight', muscles: { quad_rectus: 1.0, quad_lateral: 0.9, quad_medial: 0.9, glute_max: 0.8, adductors: 0.4, erector_spinae: 0.3, hamstrings: 0.2 } },
  { id: 'power_squats', name: 'Power Squats', equipment: 'Barbell', logType: 'reps_weight', muscles: { quad_rectus: 0.9, quad_lateral: 0.9, quad_medial: 0.8, glute_max: 0.9, erector_spinae: 0.35 } },
  { id: 'hack_squats', name: 'Hack Squats', equipment: 'Machine', logType: 'reps_weight', muscles: { quad_rectus: 1.0, quad_lateral: 0.9, quad_medial: 0.9, glute_max: 0.5 } },
  { id: 'incline_leg_presses', name: 'Incline Leg Presses', equipment: 'Machine', logType: 'reps_weight', muscles: { quad_rectus: 0.9, quad_lateral: 0.85, quad_medial: 0.85, glute_max: 0.6 } },
  { id: 'box_squats', name: 'Box Squats', equipment: 'Barbell', logType: 'reps_weight', muscles: { quad_rectus: 0.8, glute_max: 0.9, erector_spinae: 0.3, hamstrings: 0.3 } },
  { id: 'leg_extensions', name: 'Leg Extensions', equipment: 'Machine', logType: 'reps_weight', muscles: { quad_rectus: 1.0, quad_lateral: 0.6, quad_medial: 0.6 } },
  { id: 'lying_leg_curls', name: 'Lying Leg Curls', equipment: 'Machine', logType: 'reps_weight', muscles: { hamstrings: 1.0 } },
  { id: 'alternating_standing_leg_curls', name: 'Alternating Standing Leg Curls', equipment: 'Machine', logType: 'reps_weight', muscles: { hamstrings: 1.0 } },
  { id: 'seated_leg_curls', name: 'Seated Leg Curls', equipment: 'Machine', logType: 'reps_weight', muscles: { hamstrings: 1.0 } },
  { id: 'good_mornings', name: 'Good Mornings', equipment: 'Barbell', logType: 'reps_weight', muscles: { erector_spinae: 1.0, hamstrings: 0.7, glute_max: 0.5 } },
  { id: 'cable_hip_adductions', name: 'Cable Hip Adductions', equipment: 'Cable', logType: 'reps_weight', muscles: { adductors: 1.0 } },
  { id: 'seated_machine_hip_adductions', name: 'Seated Machine Hip Adductions', equipment: 'Machine', logType: 'reps_weight', muscles: { adductors: 1.0 } },
  { id: 'standing_calf_raises', name: 'Standing Calf Raises', equipment: 'Machine', logType: 'reps_weight', muscles: { gastrocnemius: 1.0, soleus: 0.4 } },
  { id: 'standing_machine_calf_raises', name: 'Standing Machine Calf Raises', equipment: 'Machine', logType: 'reps_weight', muscles: { gastrocnemius: 1.0, soleus: 0.4 } },
  { id: 'one_leg_dumbbell_calf_raises', name: 'One-Leg Dumbbell Calf Raises', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { gastrocnemius: 1.0, soleus: 0.4 } },
  { id: 'donkey_calf_raises', name: 'Donkey Calf Raises', equipment: 'Machine', logType: 'reps_weight', muscles: { gastrocnemius: 1.0, soleus: 0.5 } },
  { id: 'seated_machine_calf_raises', name: 'Seated Machine Calf Raises', equipment: 'Machine', logType: 'reps_weight', muscles: { soleus: 1.0, gastrocnemius: 0.3 } },
  { id: 'seated_barbell_calf_raises', name: 'Seated Barbell Calf Raises', equipment: 'Barbell', logType: 'reps_weight', muscles: { soleus: 1.0, gastrocnemius: 0.3 } },

  // ---- Buttocks ----
  { id: 'barbell_forward_lunges', name: 'Barbell Forward Lunges', equipment: 'Barbell', logType: 'reps_weight', muscles: { glute_max: 0.8, quad_rectus: 0.8, quad_lateral: 0.5, hamstrings: 0.3 } },
  { id: 'dumbbell_forward_lunges', name: 'Dumbbell Forward Lunges', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { glute_max: 0.8, quad_rectus: 0.8, quad_lateral: 0.5, hamstrings: 0.3 } },
  { id: 'cable_kickbacks', name: 'Cable Kickbacks', equipment: 'Cable', logType: 'reps_weight', muscles: { glute_max: 1.0 } },
  { id: 'machine_hip_extensions', name: 'Machine Hip Extensions', equipment: 'Machine', logType: 'reps_weight', muscles: { glute_max: 1.0, hamstrings: 0.3 } },
  { id: 'assisted_machine_hip_extensions', name: 'Hip Extensions (Assisted Pull-Up/Dip Machine)', equipment: 'Machine', logType: 'reps_weight', muscles: { glute_max: 1.0, hamstrings: 0.2 } },
  { id: 'floor_hip_extensions', name: 'Floor Hip Extensions', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { glute_max: 1.0, hamstrings: 0.2 } },
  { id: 'bridges', name: 'Bridges', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { glute_max: 1.0, hamstrings: 0.3 } },
  { id: 'bridges_one_leg', name: 'Bridges on One Leg', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { glute_max: 1.0, hamstrings: 0.3 } },
  { id: 'bridges_feet_raised', name: 'Bridges with Both Feet Raised', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { glute_max: 1.0, hamstrings: 0.2 } },
  { id: 'cable_hip_abductions', name: 'Cable Hip Abductions', equipment: 'Cable', logType: 'reps_weight', muscles: { glute_med: 1.0 } },
  { id: 'standing_machine_hip_abductions', name: 'Standing Machine Hip Abductions', equipment: 'Machine', logType: 'reps_weight', muscles: { glute_med: 1.0 } },
  { id: 'lying_hip_abductions', name: 'Lying Hip Abductions', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { glute_med: 1.0 } },
  { id: 'seated_machine_hip_abductions_buttocks', name: 'Seated Machine Hip Abductions', equipment: 'Machine', logType: 'reps_weight', muscles: { glute_med: 1.0 } },

  // ---- Abdomen ----
  { id: 'crunches', name: 'Crunches', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { rectus_abd_upper: 1.0 } },
  { id: 'situps', name: 'Sit-Ups', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { rectus_abd_upper: 0.8, rectus_abd_lower: 0.6, hip_flexors: 0.5 } },
  { id: 'gym_ladder_situps', name: 'Gym Ladder Sit-Ups', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { rectus_abd_upper: 0.9, hip_flexors: 0.5 } },
  { id: 'raised_leg_situps', name: 'Raised Leg Sit-Ups', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { rectus_abd_upper: 0.8, rectus_abd_lower: 0.5, hip_flexors: 0.6 } },
  { id: 'incline_bench_situps', name: 'Incline Bench Sit-Ups', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { rectus_abd_upper: 0.9, hip_flexors: 0.6 } },
  { id: 'hanging_situps', name: 'Hanging Sit-Ups', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { rectus_abd_upper: 0.8, rectus_abd_lower: 0.6, hip_flexors: 0.6 } },
  { id: 'high_pulley_crunches', name: 'High-Pulley Crunches', equipment: 'Cable', logType: 'reps_weight', muscles: { rectus_abd_upper: 1.0, rectus_abd_lower: 0.3 } },
  { id: 'machine_crunches', name: 'Machine Crunches', equipment: 'Machine', logType: 'reps_weight', muscles: { rectus_abd_upper: 1.0, rectus_abd_lower: 0.3 } },
  { id: 'incline_leg_raises', name: 'Incline Leg Raises', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { rectus_abd_lower: 1.0, hip_flexors: 0.5 } },
  { id: 'leg_raises', name: 'Leg Raises', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { rectus_abd_lower: 1.0, hip_flexors: 0.6 } },
  { id: 'hanging_leg_raises', name: 'Hanging Leg Raises', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { rectus_abd_lower: 1.0, hip_flexors: 0.7, rectus_abd_upper: 0.3 } },
  { id: 'standing_torso_rotations', name: 'Standing Torso Rotations', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { obliques: 1.0 } },
  { id: 'dumbbell_side_bends', name: 'Dumbbell Side Bends', equipment: 'Dumbbell', logType: 'reps_weight', muscles: { obliques: 1.0 } },
  { id: 'roman_chair_side_bends', name: 'Roman Chair Side Bends', equipment: 'Bodyweight', logType: 'reps_bodyweight', muscles: { obliques: 1.0 } },
  { id: 'machine_torso_rotations', name: 'Machine Torso Rotations', equipment: 'Machine', logType: 'reps_weight', muscles: { obliques: 1.0 } },
]

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))

export function searchExercises(query: string): Exercise[] {
  const q = query.trim().toLowerCase()
  if (!q) return EXERCISES
  return EXERCISES.filter((e) => e.name.toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q))
}

export function getTopExercisesForMuscle(muscleId: string, limit = 3): Exercise[] {
  return EXERCISES
    .filter((e) => (e.muscles[muscleId] ?? 0) > 0)
    .sort((a, b) => (b.muscles[muscleId] ?? 0) - (a.muscles[muscleId] ?? 0))
    .slice(0, limit)
}

// Body-part browsing for the exercise picker: an exercise's "primary group"
// is the body region of whichever muscle it emphasizes the most (e.g. Barbell
// Bench Press -> pec_major, weight 1.0 -> Chest).
export function getExercisePrimaryGroup(exercise: Exercise): MuscleGroup | null {
  let bestMuscle: string | null = null
  let bestWeight = -Infinity
  for (const [muscleId, weight] of Object.entries(exercise.muscles)) {
    if (weight > bestWeight) {
      bestWeight = weight
      bestMuscle = muscleId
    }
  }
  return bestMuscle ? (MUSCLE_BY_ID[bestMuscle]?.group ?? null) : null
}

export const UPPER_BODY_GROUPS: MuscleGroup[] = ['Chest', 'Shoulders', 'Back', 'Arms']
export const LOWER_BODY_GROUPS: MuscleGroup[] = ['Legs', 'Core']

export function getExercisesByGroup(group: MuscleGroup): Exercise[] {
  return EXERCISES.filter((e) => getExercisePrimaryGroup(e) === group)
}

export function getExercisesByGroupAndEquipment(group: MuscleGroup, equipment: Equipment): Exercise[] {
  return EXERCISES.filter((e) => e.equipment === equipment && getExercisePrimaryGroup(e) === group)
}
