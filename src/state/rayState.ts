// ABOUTME: State management for ray visualization configuration
// ABOUTME: Tracks ray count and bounce settings

import { RayConfig } from '../rays/types';

/**
 * Ray visualization state
 */
export interface RayState {
  config: RayConfig;
}

/**
 * Creates initial ray state
 */
export const createInitialRayState = (): RayState => ({
  config: {
    count: 4,
    fanRays: 1,
    maxBounces: 2,
  },
});

/**
 * Updates ray count in state
 *
 * @param state - Current ray state
 * @param count - New ray count (0-8)
 * @returns New state with updated count
 */
export const updateRayCount = (state: RayState, count: number): RayState => ({
  ...state,
  config: {
    ...state.config,
    count: Math.max(0, Math.min(8, count)),
  },
});

/**
 * Updates max bounces in state
 *
 * @param state - Current ray state
 * @param maxBounces - New max bounces (1-5)
 * @returns New state with updated bounces
 */
export const updateMaxBounces = (
  state: RayState,
  maxBounces: number
): RayState => ({
  ...state,
  config: {
    ...state.config,
    maxBounces: Math.max(1, Math.min(5, maxBounces)),
  },
});
