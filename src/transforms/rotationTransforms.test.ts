import { describe, it, expect } from 'vitest';
import {
  degreesToRadians,
  radiansToDegrees,
  snapToAngle,
  normalizeAngle,
  clampToYAxis,
  applyRotationConstraints
} from './rotationTransforms';
import { Vector3 } from 'babylonjs';

describe('rotationTransforms', () => {
  describe('degreesToRadians', () => {
    it('should convert degrees to radians correctly', () => {
      expect(degreesToRadians(0)).toBe(0);
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
      expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
    });

    it('should handle negative degrees', () => {
      expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2);
      expect(degreesToRadians(-180)).toBeCloseTo(-Math.PI);
    });

    it('should be a pure function', () => {
      const input = 45;
      const result1 = degreesToRadians(input);
      const result2 = degreesToRadians(input);
      expect(result1).toBe(result2);
    });
  });

  describe('radiansToDegrees', () => {
    it('should convert radians to degrees correctly', () => {
      expect(radiansToDegrees(0)).toBe(0);
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
      expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360);
    });

    it('should handle negative radians', () => {
      expect(radiansToDegrees(-Math.PI / 2)).toBeCloseTo(-90);
      expect(radiansToDegrees(-Math.PI)).toBeCloseTo(-180);
    });

    it('should be inverse of degreesToRadians', () => {
      const degrees = 73.5;
      const radians = degreesToRadians(degrees);
      const backToDegrees = radiansToDegrees(radians);
      expect(backToDegrees).toBeCloseTo(degrees);
    });
  });

  describe('snapToAngle', () => {
    it('should snap to 15-degree increments by default', () => {
      expect(radiansToDegrees(snapToAngle(degreesToRadians(7)))).toBeCloseTo(0);
      expect(radiansToDegrees(snapToAngle(degreesToRadians(8)))).toBeCloseTo(15);
      expect(radiansToDegrees(snapToAngle(degreesToRadians(22)))).toBeCloseTo(15);
      expect(radiansToDegrees(snapToAngle(degreesToRadians(23)))).toBeCloseTo(30);
    });

    it('should handle custom snap increments', () => {
      expect(radiansToDegrees(snapToAngle(degreesToRadians(7), 10))).toBeCloseTo(10);
      expect(radiansToDegrees(snapToAngle(degreesToRadians(17), 5))).toBeCloseTo(15);
    });

    it('should handle negative angles', () => {
      expect(radiansToDegrees(snapToAngle(degreesToRadians(-7)))).toBeCloseTo(0);
      expect(radiansToDegrees(snapToAngle(degreesToRadians(-8)))).toBeCloseTo(-15);
    });

    it('should return original angle when snap is 0', () => {
      const angle = degreesToRadians(17.3);
      expect(snapToAngle(angle, 0)).toBe(angle);
    });

    it('should be a pure function', () => {
      const input = degreesToRadians(37);
      const result1 = snapToAngle(input);
      const result2 = snapToAngle(input);
      expect(result1).toBe(result2);
    });
  });

  describe('normalizeAngle', () => {
    it('should normalize angles to [-π, π) range', () => {
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(Math.PI / 2)).toBeCloseTo(Math.PI / 2);
      expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI);
      expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo(-Math.PI / 2);
    });

    it('should wrap angles outside [-π, π) range', () => {
      expect(normalizeAngle(2 * Math.PI)).toBeCloseTo(0);
      expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
      expect(normalizeAngle(-2 * Math.PI)).toBeCloseTo(0);
      expect(normalizeAngle(-3 * Math.PI)).toBeCloseTo(Math.PI);
    });

    it('should handle very large angles', () => {
      expect(normalizeAngle(10 * Math.PI)).toBeCloseTo(0);
      expect(normalizeAngle(-10 * Math.PI)).toBeCloseTo(0);
    });

    it('should be a pure function', () => {
      const input = 5 * Math.PI;
      const result1 = normalizeAngle(input);
      const result2 = normalizeAngle(input);
      expect(result1).toBe(result2);
    });
  });

  describe('clampToYAxis', () => {
    it('should preserve Y rotation and zero X and Z', () => {
      const rotation = new Vector3(0.5, 1.2, -0.8);
      const clamped = clampToYAxis(rotation);
      
      expect(clamped.x).toBe(0);
      expect(clamped.y).toBe(1.2);
      expect(clamped.z).toBe(0);
    });

    it('should return new Vector3 instance', () => {
      const rotation = new Vector3(1, 2, 3);
      const clamped = clampToYAxis(rotation);
      
      expect(clamped).not.toBe(rotation);
      expect(clamped).toBeInstanceOf(Vector3);
    });

    it('should handle zero rotation', () => {
      const rotation = new Vector3(0, 0, 0);
      const clamped = clampToYAxis(rotation);
      
      expect(clamped.x).toBe(0);
      expect(clamped.y).toBe(0);
      expect(clamped.z).toBe(0);
    });

    it('should be a pure function', () => {
      const rotation = new Vector3(1, 2, 3);
      const result1 = clampToYAxis(rotation);
      const result2 = clampToYAxis(rotation);
      
      expect(result1.equals(result2)).toBe(true);
      expect(rotation.x).toBe(1); // Original unchanged
    });
  });

  describe('applyRotationConstraints', () => {
    it('should apply Y-axis clamping, snapping, and normalization', () => {
      const rotation = new Vector3(0.5, degreesToRadians(37), -0.3);
      const constrained = applyRotationConstraints(rotation);
      
      expect(constrained.x).toBe(0);
      expect(constrained.z).toBe(0);
      expect(radiansToDegrees(constrained.y)).toBeCloseTo(30); // 37 -> 30 (15° snap)
    });

    it('should use default 15-degree snapping', () => {
      const rotation = new Vector3(0, degreesToRadians(22), 0);
      const constrained = applyRotationConstraints(rotation);
      
      expect(radiansToDegrees(constrained.y)).toBeCloseTo(15);
    });

    it('should accept custom snap increment', () => {
      const rotation = new Vector3(0, degreesToRadians(22), 0);
      const constrained = applyRotationConstraints(rotation, 10);
      
      expect(radiansToDegrees(constrained.y)).toBeCloseTo(20);
    });

    it('should normalize large angles', () => {
      const rotation = new Vector3(0, 5 * Math.PI, 0); // 900 degrees
      const constrained = applyRotationConstraints(rotation);
      
      // 900° -> 180° (normalized) -> 180° (snapped to 15° grid)
      expect(radiansToDegrees(constrained.y)).toBeCloseTo(180);
    });

    it('should handle negative angles', () => {
      const rotation = new Vector3(0, degreesToRadians(-37), 0);
      const constrained = applyRotationConstraints(rotation);
      
      expect(radiansToDegrees(constrained.y)).toBeCloseTo(-30);
    });

    it('should be composable and pure', () => {
      const rotation = new Vector3(1, degreesToRadians(52), -1);
      const result1 = applyRotationConstraints(rotation);
      const result2 = applyRotationConstraints(rotation);
      
      expect(result1).not.toBe(rotation);
      expect(result1.equals(result2)).toBe(true);
    });

    it('should handle edge case at ±180 degrees', () => {
      const rotation = new Vector3(0, Math.PI, 0); // 180°
      const constrained = applyRotationConstraints(rotation);
      
      expect(radiansToDegrees(constrained.y)).toBeCloseTo(180);
    });
  });
});