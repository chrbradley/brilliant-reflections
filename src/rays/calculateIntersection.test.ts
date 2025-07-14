import { describe, it, expect } from 'vitest';
import {
  calculateIntersection,
  findNearestIntersection,
  calculateReflection,
} from './calculateIntersection';
import { Vector3 } from 'babylonjs';
import { WallPlane } from './types';

describe('calculateIntersection', () => {
  it('should detect intersection with wall plane', () => {
    const origin = new Vector3(0, 0, 0);
    const direction = new Vector3(0, 0, 1); // Pointing +Z
    const wall: WallPlane = {
      position: new Vector3(0, 0, 5),
      normal: new Vector3(0, 0, -1),
      isMirror: true,
    };
    
    const result = calculateIntersection(origin, direction, wall);
    
    expect(result.hit).toBe(true);
    expect(result.distance).toBeCloseTo(5);
    expect(result.point?.z).toBeCloseTo(5);
    expect(result.isMirror).toBe(true);
  });

  it('should not detect intersection when ray points away', () => {
    const origin = new Vector3(0, 0, 0);
    const direction = new Vector3(0, 0, -1); // Pointing -Z
    const wall: WallPlane = {
      position: new Vector3(0, 0, 5), // Wall is at +Z
      normal: new Vector3(0, 0, -1),
      isMirror: true,
    };
    
    const result = calculateIntersection(origin, direction, wall);
    
    expect(result.hit).toBe(false);
    expect(result.distance).toBe(Infinity);
    expect(result.point).toBeNull();
  });

  it('should ignore very close intersections', () => {
    const origin = new Vector3(0, 0, 4.9999);
    const direction = new Vector3(0, 0, 1);
    const wall: WallPlane = {
      position: new Vector3(0, 0, 5),
      normal: new Vector3(0, 0, -1),
      isMirror: true,
    };
    
    const result = calculateIntersection(origin, direction, wall);
    
    // Should ignore intersection less than 0.001 units away
    expect(result.hit).toBe(false);
  });

  it('should return correct normal from wall plane', () => {
    const origin = new Vector3(0, 0, 0);
    const direction = new Vector3(1, 0, 0);
    const wall: WallPlane = {
      position: new Vector3(5, 0, 0),
      normal: new Vector3(-1, 0, 0),
      isMirror: false,
    };
    
    const result = calculateIntersection(origin, direction, wall);
    
    expect(result.normal?.x).toBe(-1);
    expect(result.normal?.y).toBe(0);
    expect(result.normal?.z).toBe(0);
  });
});

describe('findNearestIntersection', () => {
  it('should find the nearest wall intersection', () => {
    const origin = new Vector3(0, 0, 0);
    const direction = new Vector3(1, 0, 0); // Pointing +X
    const walls: WallPlane[] = [
      {
        position: new Vector3(10, 0, 0), // Far wall
        normal: new Vector3(-1, 0, 0),
        isMirror: true,
      },
      {
        position: new Vector3(5, 0, 0), // Near wall
        normal: new Vector3(-1, 0, 0),
        isMirror: false,
      },
    ];
    
    const result = findNearestIntersection(origin, direction, walls);
    
    expect(result.hit).toBe(true);
    expect(result.distance).toBeCloseTo(5);
    expect(result.isMirror).toBe(false); // Should hit the nearer wall
  });

  it('should return no hit when no walls intersect', () => {
    const origin = new Vector3(0, 0, 0);
    const direction = new Vector3(0, 1, 0); // Pointing up
    const walls: WallPlane[] = [
      {
        position: new Vector3(0, 0, 5),
        normal: new Vector3(0, 0, -1),
        isMirror: true,
      },
    ];
    
    const result = findNearestIntersection(origin, direction, walls);
    
    expect(result.hit).toBe(false);
    expect(result.distance).toBe(Infinity);
  });

  it('should handle multiple wall intersections correctly', () => {
    const origin = new Vector3(0, 0, 0);
    const direction = new Vector3(1, 0, 1).normalize(); // Diagonal
    const walls: WallPlane[] = [
      {
        position: new Vector3(10, 0, 0), // East wall
        normal: new Vector3(-1, 0, 0),
        isMirror: true,
      },
      {
        position: new Vector3(0, 0, 10), // North wall
        normal: new Vector3(0, 0, -1),
        isMirror: true,
      },
    ];
    
    const result = findNearestIntersection(origin, direction, walls);
    
    expect(result.hit).toBe(true);
    // Both walls are at same distance for 45-degree angle
    expect(result.distance).toBeCloseTo(10 * Math.sqrt(2));
  });
});

describe('calculateReflection', () => {
  it('should reflect off a perpendicular surface', () => {
    const incoming = new Vector3(1, 0, 0); // Hitting wall head-on
    const normal = new Vector3(-1, 0, 0); // Wall facing left
    
    const reflected = calculateReflection(incoming, normal);
    
    // Should bounce straight back
    expect(reflected.x).toBeCloseTo(-1);
    expect(reflected.y).toBeCloseTo(0);
    expect(reflected.z).toBeCloseTo(0);
  });

  it('should reflect at correct angle', () => {
    const incoming = new Vector3(1, 0, 1).normalize(); // 45 degree
    const normal = new Vector3(-1, 0, 0); // Wall facing left
    
    const reflected = calculateReflection(incoming, normal);
    
    // Should reflect symmetrically
    expect(reflected.x).toBeCloseTo(-1 / Math.sqrt(2));
    expect(reflected.y).toBeCloseTo(0);
    expect(reflected.z).toBeCloseTo(1 / Math.sqrt(2));
  });

  it('should handle glancing angles', () => {
    const incoming = new Vector3(0.1, 0, 0.99).normalize();
    const normal = new Vector3(-1, 0, 0);
    
    const reflected = calculateReflection(incoming, normal);
    
    // Should mostly continue in Z direction
    expect(Math.abs(reflected.z)).toBeGreaterThan(0.9);
    expect(reflected.x).toBeLessThan(0);
  });

  it('should return normalized vectors', () => {
    const incoming = new Vector3(3, 0, 4); // Length 5
    const normal = new Vector3(-1, 0, 0);
    
    const reflected = calculateReflection(incoming, normal);
    const length = reflected.length();
    
    expect(length).toBeCloseTo(1);
  });
});