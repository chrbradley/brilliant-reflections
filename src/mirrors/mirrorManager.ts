// ABOUTME: Functional mirror state management
// ABOUTME: Controls mirror recursion levels and state transitions

import { MirrorTexture } from 'babylonjs';

/**
 * Mirror manager state
 */
export interface MirrorState {
  currentLevel: number;
  maxLevel: number;
  enabled: boolean;
}

/**
 * Mirror effect description
 */
export interface MirrorEffect {
  type: 'UPDATE_MIRRORS';
  level: number;
  mirrors: MirrorTexture[];
  enabled: boolean;
}

/**
 * Creates initial mirror state
 * 
 * @returns Initial state with level 1
 */
export const createMirrorState = (): MirrorState => ({
  currentLevel: 1,
  maxLevel: 4,
  enabled: true,
});

/**
 * Updates mirror recursion level
 * 
 * @param state - Current state
 * @param level - New level (0-4)
 * @returns Updated state
 */
export const updateMirrorLevel = (
  state: MirrorState,
  level: number
): MirrorState => {
  const clampedLevel = Math.max(0, Math.min(level, state.maxLevel));
  
  return {
    ...state,
    currentLevel: clampedLevel,
    enabled: clampedLevel > 0,
  };
};

/**
 * Gets current mirror level
 * 
 * @param state - Mirror state
 * @returns Current level
 */
export const getMirrorLevel = (state: MirrorState): number => {
  return state.currentLevel;
};

/**
 * Checks if mirrors are enabled
 * 
 * @param state - Mirror state
 * @returns True if enabled
 */
export const isMirrorEnabled = (state: MirrorState): boolean => {
  return state.enabled;
};

/**
 * Creates effect description for applying mirror state
 * 
 * @param state - Mirror state
 * @param mirrors - Array of mirror textures
 * @returns Effect description
 */
export const applyMirrorState = (
  state: MirrorState,
  mirrors: MirrorTexture[]
): MirrorEffect => {
  return {
    type: 'UPDATE_MIRRORS',
    level: state.currentLevel,
    mirrors,
    enabled: state.enabled,
  };
};