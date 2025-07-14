import { describe, it, expect } from 'vitest';
import {
  createInitialRayState,
  updateRayCount,
  updateMaxBounces,
} from './rayState';

describe('rayState', () => {
  describe('createInitialRayState', () => {
    it('should create initial state with default values', () => {
      const state = createInitialRayState();
      
      expect(state.config.count).toBe(4);
      expect(state.config.maxBounces).toBe(2);
    });

    it('should create new instances on each call', () => {
      const state1 = createInitialRayState();
      const state2 = createInitialRayState();
      
      expect(state1).not.toBe(state2);
      expect(state1.config).not.toBe(state2.config);
    });
  });

  describe('updateRayCount', () => {
    it('should update ray count', () => {
      const initial = createInitialRayState();
      const updated = updateRayCount(initial, 6);
      
      expect(updated.config.count).toBe(6);
      expect(initial.config.count).toBe(4); // Original unchanged
    });

    it('should clamp count to valid range', () => {
      const initial = createInitialRayState();
      
      const tooLow = updateRayCount(initial, -5);
      expect(tooLow.config.count).toBe(0);
      
      const tooHigh = updateRayCount(initial, 20);
      expect(tooHigh.config.count).toBe(8);
    });

    it('should preserve other state properties', () => {
      const initial = createInitialRayState();
      const updated = updateRayCount(initial, 7);
      
      expect(updated.config.maxBounces).toBe(initial.config.maxBounces);
    });

    it('should return new state object', () => {
      const initial = createInitialRayState();
      const updated = updateRayCount(initial, 5);
      
      expect(updated).not.toBe(initial);
      expect(updated.config).not.toBe(initial.config);
    });
  });

  describe('updateMaxBounces', () => {
    it('should update max bounces', () => {
      const initial = createInitialRayState();
      const updated = updateMaxBounces(initial, 4);
      
      expect(updated.config.maxBounces).toBe(4);
      expect(initial.config.maxBounces).toBe(2); // Original unchanged
    });

    it('should clamp bounces to valid range', () => {
      const initial = createInitialRayState();
      
      const tooLow = updateMaxBounces(initial, 0);
      expect(tooLow.config.maxBounces).toBe(1);
      
      const tooHigh = updateMaxBounces(initial, 10);
      expect(tooHigh.config.maxBounces).toBe(5);
    });

    it('should preserve other state properties', () => {
      const initial = createInitialRayState();
      const updated = updateMaxBounces(initial, 3);
      
      expect(updated.config.count).toBe(initial.config.count);
    });

    it('should return new state object', () => {
      const initial = createInitialRayState();
      const updated = updateMaxBounces(initial, 3);
      
      expect(updated).not.toBe(initial);
      expect(updated.config).not.toBe(initial.config);
    });
  });
});