import { describe, it, expect } from 'vitest';
import { snapToGrid, clampPosition, applyPositionConstraints } from './positionTransforms';
import { Vector3 } from 'babylonjs';

describe('positionTransforms', () => {
  describe('snapToGrid', () => {
    it('should snap value to nearest grid point', () => {
      expect(snapToGrid(1.2, 1)).toBe(1);
      expect(snapToGrid(1.6, 1)).toBe(2);
      expect(snapToGrid(1.5, 1)).toBe(2); // Round up at halfway
    });

    it('should handle negative values', () => {
      expect(snapToGrid(-1.2, 1)).toBe(-1);
      expect(snapToGrid(-1.6, 1)).toBe(-2);
      expect(snapToGrid(-1.5, 1)).toBe(-1); // Round towards zero at halfway
    });

    it('should work with different grid sizes', () => {
      expect(snapToGrid(3.7, 2)).toBe(4);
      expect(snapToGrid(3.7, 0.5)).toBe(3.5);
      expect(snapToGrid(3.7, 0.25)).toBe(3.75);
    });

    it('should handle zero grid size by returning original value', () => {
      expect(snapToGrid(3.14159, 0)).toBe(3.14159);
    });

    it('should be a pure function', () => {
      const value = 1.234;
      const gridSize = 0.5;
      const result1 = snapToGrid(value, gridSize);
      const result2 = snapToGrid(value, gridSize);
      expect(result1).toBe(result2);
    });
  });

  describe('clampPosition', () => {
    it('should clamp position within limits', () => {
      const position = new Vector3(10, 5, -12);
      const clamped = clampPosition(position, 8);
      
      expect(clamped.x).toBe(8); // Clamped from 10
      expect(clamped.y).toBe(5); // Y unchanged
      expect(clamped.z).toBe(-8); // Clamped from -12
    });

    it('should not modify position within limits', () => {
      const position = new Vector3(5, 3, -7);
      const clamped = clampPosition(position, 8);
      
      expect(clamped.x).toBe(5);
      expect(clamped.y).toBe(3);
      expect(clamped.z).toBe(-7);
    });

    it('should handle Y axis separately', () => {
      const position = new Vector3(0, 100, 0);
      const clamped = clampPosition(position, 8);
      
      expect(clamped.x).toBe(0);
      expect(clamped.y).toBe(100); // Y not clamped
      expect(clamped.z).toBe(0);
    });

    it('should return new Vector3 instance', () => {
      const position = new Vector3(5, 5, 5);
      const clamped = clampPosition(position, 10);
      
      expect(clamped).not.toBe(position);
      expect(clamped).toBeInstanceOf(Vector3);
    });

    it('should handle zero limit', () => {
      const position = new Vector3(5, 3, -7);
      const clamped = clampPosition(position, 0);
      
      expect(clamped.x).toBe(0);
      expect(clamped.y).toBe(3);
      expect(clamped.z).toBe(-0); // -7 clamped to [-0, 0] returns -0
    });
  });

  describe('applyPositionConstraints', () => {
    it('should apply both snap and clamp', () => {
      const position = new Vector3(5.7, 2.3, -9.1);
      const constrained = applyPositionConstraints(position);
      
      // Should snap to grid (1 unit) first
      expect(constrained.x).toBe(6); // 5.7 -> 6
      expect(constrained.y).toBe(2.3); // Y unchanged
      expect(constrained.z).toBe(-8); // -9.1 -> -9 -> -8 (clamped)
    });

    it('should use default grid size of 1', () => {
      const position = new Vector3(1.4, 0, 2.6);
      const constrained = applyPositionConstraints(position);
      
      expect(constrained.x).toBe(1); // Snapped to 1
      expect(constrained.z).toBe(3); // Snapped to 3
    });

    it('should use default limit of 8', () => {
      const position = new Vector3(10, 0, -10);
      const constrained = applyPositionConstraints(position);
      
      expect(constrained.x).toBe(8); // Clamped
      expect(constrained.z).toBe(-8); // Clamped
    });

    it('should accept custom grid size and limit', () => {
      const position = new Vector3(5.3, 0, 7.8);
      const constrained = applyPositionConstraints(position, 0.5, 6);
      
      expect(constrained.x).toBe(5.5); // Snapped to 0.5 grid
      expect(constrained.z).toBe(6); // 7.8 -> 8 -> 6 (clamped)
    });

    it('should be composable and pure', () => {
      const position = new Vector3(3.7, 1, -4.2);
      const result1 = applyPositionConstraints(position);
      const result2 = applyPositionConstraints(position);
      
      expect(result1).not.toBe(position);
      expect(result1.equals(result2)).toBe(true);
    });

    it('should handle edge case at limit boundary', () => {
      const position = new Vector3(7.9, 0, -7.9);
      const constrained = applyPositionConstraints(position);
      
      expect(constrained.x).toBe(8); // Snapped to 8 (at limit)
      expect(constrained.z).toBe(-8); // Snapped to -8 (at limit)
    });
  });
});