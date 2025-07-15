// ABOUTME: Tests for UI state management with pure update functions
// ABOUTME: Verifies immutable state updates and value validation

import { describe, it, expect } from 'vitest';
import {
  UIState,
  createInitialUIState,
  updateRayCount,
  updateMaxBounces,
  updateQuality,
  validateRayCount,
  validateMaxBounces,
  QualityLevel,
} from './uiState';

describe('uiState', () => {
  describe('createInitialUIState', () => {
    it('should create initial state with default values', () => {
      const state = createInitialUIState();

      expect(state).toEqual({
        rayCount: 4,
        maxBounces: 2,
        quality: 'medium',
      });
    });

    it('should return frozen immutable state', () => {
      const state = createInitialUIState();

      expect(() => {
        (state as any).rayCount = 10;
      }).toThrow();
    });
  });

  describe('updateRayCount', () => {
    it('should update ray count and return new state', () => {
      const oldState = createInitialUIState();
      const newState = updateRayCount(oldState, 6);

      expect(newState.rayCount).toBe(6);
      expect(newState.maxBounces).toBe(oldState.maxBounces);
      expect(newState.quality).toBe(oldState.quality);
      expect(newState).not.toBe(oldState); // New object
    });

    it('should clamp values to valid range', () => {
      const state = createInitialUIState();

      const tooLow = updateRayCount(state, -1);
      expect(tooLow.rayCount).toBe(0);

      const tooHigh = updateRayCount(state, 10);
      expect(tooHigh.rayCount).toBe(8);
    });

    it('should return same state if value unchanged', () => {
      const state = createInitialUIState();
      const newState = updateRayCount(state, 4);

      expect(newState).toBe(state); // Same reference
    });
  });

  describe('updateMaxBounces', () => {
    it('should update max bounces and return new state', () => {
      const oldState = createInitialUIState();
      const newState = updateMaxBounces(oldState, 4);

      expect(newState.maxBounces).toBe(4);
      expect(newState.rayCount).toBe(oldState.rayCount);
      expect(newState.quality).toBe(oldState.quality);
      expect(newState).not.toBe(oldState);
    });

    it('should clamp values to valid range', () => {
      const state = createInitialUIState();

      const tooLow = updateMaxBounces(state, 0);
      expect(tooLow.maxBounces).toBe(1);

      const tooHigh = updateMaxBounces(state, 10);
      expect(tooHigh.maxBounces).toBe(5);
    });

    it('should return same state if value unchanged', () => {
      const state = createInitialUIState();
      const newState = updateMaxBounces(state, 2);

      expect(newState).toBe(state);
    });
  });

  describe('updateQuality', () => {
    it('should update quality and return new state', () => {
      const oldState = createInitialUIState();
      const newState = updateQuality(oldState, 'high');

      expect(newState.quality).toBe('high');
      expect(newState.rayCount).toBe(oldState.rayCount);
      expect(newState.maxBounces).toBe(oldState.maxBounces);
      expect(newState).not.toBe(oldState);
    });

    it('should return same state if value unchanged', () => {
      const state = createInitialUIState();
      const newState = updateQuality(state, 'medium');

      expect(newState).toBe(state);
    });

    it('should accept all valid quality levels', () => {
      const state = createInitialUIState();

      const low = updateQuality(state, 'low');
      expect(low.quality).toBe('low');

      const medium = updateQuality(low, 'medium');
      expect(medium.quality).toBe('medium');

      const high = updateQuality(medium, 'high');
      expect(high.quality).toBe('high');
    });
  });

  describe('validateRayCount', () => {
    it('should return value within valid range', () => {
      expect(validateRayCount(4)).toBe(4);
      expect(validateRayCount(0)).toBe(0);
      expect(validateRayCount(8)).toBe(8);
    });

    it('should clamp values outside range', () => {
      expect(validateRayCount(-5)).toBe(0);
      expect(validateRayCount(15)).toBe(8);
    });

    it('should round fractional values', () => {
      expect(validateRayCount(3.7)).toBe(4);
      expect(validateRayCount(3.2)).toBe(3);
    });
  });

  describe('validateMaxBounces', () => {
    it('should return value within valid range', () => {
      expect(validateMaxBounces(3)).toBe(3);
      expect(validateMaxBounces(1)).toBe(1);
      expect(validateMaxBounces(5)).toBe(5);
    });

    it('should clamp values outside range', () => {
      expect(validateMaxBounces(0)).toBe(1);
      expect(validateMaxBounces(10)).toBe(5);
    });

    it('should round fractional values', () => {
      expect(validateMaxBounces(2.8)).toBe(3);
      expect(validateMaxBounces(2.3)).toBe(2);
    });
  });
});
