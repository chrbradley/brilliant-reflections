// ABOUTME: UI state management with pure update functions
// ABOUTME: Handles ray count, bounce count, and quality settings immutably

/**
 * Quality level options for rendering
 */
export type QualityLevel = 'low' | 'medium' | 'high';

/**
 * UI state interface
 */
export interface UIState {
  readonly rayCount: number;
  readonly fanRays: number;
  readonly maxBounces: number;
  readonly quality: QualityLevel;
}

/**
 * Create initial UI state
 */
export const createInitialUIState = (): UIState => {
  return Object.freeze({
    rayCount: 1,
    fanRays: 3,
    maxBounces: 2,
    quality: 'high' as QualityLevel,
  });
};

/**
 * Validate and clamp ray count to valid range
 */
export const validateRayCount = (value: number): number => {
  const rounded = Math.round(value);
  return Math.max(0, Math.min(8, rounded));
};

/**
 * Validate and clamp fan rays to valid range
 */
export const validateFanRays = (value: number): number => {
  const rounded = Math.round(value);
  return Math.max(1, Math.min(6, rounded));
};

/**
 * Validate and clamp max bounces to valid range
 */
export const validateMaxBounces = (value: number): number => {
  const rounded = Math.round(value);
  return Math.max(1, Math.min(5, rounded));
};

/**
 * Update ray count with validation
 */
export const updateRayCount = (state: UIState, rayCount: number): UIState => {
  const validated = validateRayCount(rayCount);

  // Return same state if value unchanged
  if (validated === state.rayCount) {
    return state;
  }

  return Object.freeze({
    ...state,
    rayCount: validated,
  });
};

/**
 * Update fan rays with validation
 */
export const updateFanRays = (state: UIState, fanRays: number): UIState => {
  const validated = validateFanRays(fanRays);

  // Return same state if value unchanged
  if (validated === state.fanRays) {
    return state;
  }

  return Object.freeze({
    ...state,
    fanRays: validated,
  });
};

/**
 * Update max bounces with validation
 */
export const updateMaxBounces = (
  state: UIState,
  maxBounces: number
): UIState => {
  const validated = validateMaxBounces(maxBounces);

  // Return same state if value unchanged
  if (validated === state.maxBounces) {
    return state;
  }

  return Object.freeze({
    ...state,
    maxBounces: validated,
  });
};

/**
 * Update quality level
 */
export const updateQuality = (
  state: UIState,
  quality: QualityLevel
): UIState => {
  // Return same state if value unchanged
  if (quality === state.quality) {
    return state;
  }

  return Object.freeze({
    ...state,
    quality,
  });
};
