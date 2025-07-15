import { describe, it, expect } from 'vitest';
import { traceRay } from './traceRay';
import { Vector3, Color3 } from 'babylonjs';
import { Ray, WallPlane } from './types';

describe('traceRay', () => {
  const createTestWalls = (): WallPlane[] => [
    // North wall at z=10 (mirror)
    {
      position: new Vector3(0, 0, 10),
      normal: new Vector3(0, 0, -1),
      isMirror: true,
    },
    // South wall at z=-10 (not mirror)
    {
      position: new Vector3(0, 0, -10),
      normal: new Vector3(0, 0, 1),
      isMirror: false,
    },
    // East wall at x=10 (mirror)
    {
      position: new Vector3(10, 0, 0),
      normal: new Vector3(-1, 0, 0),
      isMirror: true,
    },
    // West wall at x=-10 (mirror)
    {
      position: new Vector3(-10, 0, 0),
      normal: new Vector3(1, 0, 0),
      isMirror: true,
    },
  ];

  it('should include ray origin as first point', () => {
    const ray: Ray = {
      origin: new Vector3(5, 0, 5),
      direction: new Vector3(1, 0, 0),
      color: new Color3(1, 0, 0),
    };
    
    const points = traceRay(ray, createTestWalls(), 1);
    
    expect(points[0].x).toBe(5);
    expect(points[0].z).toBe(5);
  });

  it('should trace to wall and stop at non-mirror', () => {
    const ray: Ray = {
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(0, 0, -1), // Toward south wall (non-mirror)
      color: new Color3(1, 0, 0),
    };
    
    const points = traceRay(ray, createTestWalls(), 5);
    
    expect(points).toHaveLength(2); // Origin + hit point
    expect(points[1].z).toBeCloseTo(-10); // Hit south wall
  });

  it('should reflect off mirror walls', () => {
    const ray: Ray = {
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(1, 0, 1).normalize(), // 45 degree to corner
      color: new Color3(1, 0, 0),
    };
    
    const points = traceRay(ray, createTestWalls(), 2);
    
    expect(points.length).toBeGreaterThan(2); // Should have bounces
    // First hit should be at a wall
    const firstHit = points[1];
    expect(Math.abs(firstHit.x)).toBeCloseTo(10) || 
    expect(Math.abs(firstHit.z)).toBeCloseTo(10);
  });

  it('should respect maxBounces limit', () => {
    // Test with a ray going straight to the east wall (mirror)
    const ray: Ray = {
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(1, 0, 0), // Straight to east wall
      color: new Color3(1, 0, 0),
    };
    
    const points1 = traceRay(ray, createTestWalls(), 1);
    const points2 = traceRay(ray, createTestWalls(), 2);
    
    // With maxBounces=1: origin + first hit + second hit = 3 points (2 segments)
    expect(points1.length).toBe(3);
    
    // With maxBounces=2: origin + first hit + second hit + third hit = 4 points (3 segments)
    expect(points2.length).toBe(4);
  });

  it('should clamp maxBounces to valid range', () => {
    const ray: Ray = {
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(1, 0, 0),
      color: new Color3(1, 0, 0),
    };
    
    const pointsNegative = traceRay(ray, createTestWalls(), -5);
    expect(pointsNegative.length).toBeGreaterThanOrEqual(2); // At least 1 bounce
    
    const pointsTooMany = traceRay(ray, createTestWalls(), 10);
    expect(pointsTooMany.length).toBeLessThanOrEqual(7); // Max 5 bounces + origin + final hit = 7 points
  });

  it('should offset points slightly above ground', () => {
    const ray: Ray = {
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(1, 0, 0),
      color: new Color3(1, 0, 0),
    };
    
    const points = traceRay(ray, createTestWalls(), 1);
    
    // Hit points should be slightly elevated
    expect(points[1].y).toBeCloseTo(0.01);
  });

  it('should handle perpendicular wall hits', () => {
    const ray: Ray = {
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(1, 0, 0), // Straight at east wall
      color: new Color3(1, 0, 0),
    };
    
    const points = traceRay(ray, createTestWalls(), 2);
    
    // Should hit east wall and bounce back
    expect(points[1].x).toBeCloseTo(10);
    // After reflection, should head back toward west
    if (points.length > 2) {
      expect(points[2].x).toBeLessThan(0);
    }
  });
});