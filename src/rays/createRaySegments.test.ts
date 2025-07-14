import { describe, it, expect } from 'vitest';
import { createRaySegments } from './createRaySegments';
import { Vector3, Color3 } from 'babylonjs';

describe('createRaySegments', () => {
  it('should return empty array for less than 2 points', () => {
    const color = new Color3(1, 0, 0);
    
    const segments0 = createRaySegments([], color);
    expect(segments0).toHaveLength(0);
    
    const segments1 = createRaySegments([new Vector3(0, 0, 0)], color);
    expect(segments1).toHaveLength(0);
  });

  it('should create segments between consecutive points', () => {
    const points = [
      new Vector3(0, 0, 0),
      new Vector3(5, 0, 0),
      new Vector3(5, 0, 5),
    ];
    const color = new Color3(1, 0, 0);
    
    const segments = createRaySegments(points, color);
    
    expect(segments).toHaveLength(2);
    
    // First segment
    expect(segments[0].startPoint.equals(points[0])).toBe(true);
    expect(segments[0].endPoint.equals(points[1])).toBe(true);
    
    // Second segment
    expect(segments[1].startPoint.equals(points[1])).toBe(true);
    expect(segments[1].endPoint.equals(points[2])).toBe(true);
  });

  it('should calculate correct alpha values for segments', () => {
    const points = [
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(2, 0, 0),
      new Vector3(3, 0, 0),
    ];
    const color = new Color3(1, 0, 0);
    
    const segments = createRaySegments(points, color);
    
    expect(segments).toHaveLength(3);
    
    // First segment: alpha = 1 - 0.333 * (0/2) = 1.0
    expect(segments[0].alpha).toBeCloseTo(1.0);
    
    // Second segment: alpha = 1 - 0.333 * (1/2) = 0.8335
    expect(segments[1].alpha).toBeCloseTo(0.8335);
    
    // Third segment: alpha = 1 - 0.333 * (2/2) = 0.667
    expect(segments[2].alpha).toBeCloseTo(0.667);
  });

  it('should handle single segment correctly', () => {
    const points = [
      new Vector3(0, 0, 0),
      new Vector3(10, 0, 0),
    ];
    const color = new Color3(0, 1, 0);
    
    const segments = createRaySegments(points, color);
    
    expect(segments).toHaveLength(1);
    // Single segment should have alpha = 1 - 0.333 * (0/0) = 1.0
    // (denominator is max(1, 1-1) = 1)
    expect(segments[0].alpha).toBe(1.0);
  });

  it('should create independent copies of points', () => {
    const points = [
      new Vector3(0, 0, 0),
      new Vector3(5, 0, 0),
    ];
    const color = new Color3(1, 0, 0);
    
    const segments = createRaySegments(points, color);
    
    // Modify original points
    points[0].x = 100;
    points[1].x = 200;
    
    // Segments should be unaffected
    expect(segments[0].startPoint.x).toBe(0);
    expect(segments[0].endPoint.x).toBe(5);
  });

  it('should handle many segments with proper alpha fade', () => {
    const points = [];
    for (let i = 0; i <= 5; i++) {
      points.push(new Vector3(i, 0, 0));
    }
    const color = new Color3(0, 0, 1);
    
    const segments = createRaySegments(points, color);
    
    expect(segments).toHaveLength(5);
    
    // Check that alpha decreases monotonically
    for (let i = 1; i < segments.length; i++) {
      expect(segments[i].alpha).toBeLessThan(segments[i - 1].alpha);
    }
    
    // Last segment should have lowest alpha: 1 - 0.333 * (4/4) = 0.667
    expect(segments[4].alpha).toBeCloseTo(0.667);
  });
});