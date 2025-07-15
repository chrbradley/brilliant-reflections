import { describe, it, expect } from 'vitest';
import { generateRays } from './generateRays';
import { Vector3, Matrix } from 'babylonjs';
import { FACE_COLORS } from './types';

describe('generateRays', () => {
  it('should generate the correct number of rays', () => {
    const origin = new Vector3(0, 0, 0);
    const matrix = Matrix.Identity();

    const rays0 = generateRays(origin, matrix, 0);
    expect(rays0).toHaveLength(0);

    const rays4 = generateRays(origin, matrix, 4);
    expect(rays4).toHaveLength(4);

    const rays8 = generateRays(origin, matrix, 8);
    expect(rays8).toHaveLength(8);
  });

  it('should clamp ray count to valid range', () => {
    const origin = new Vector3(0, 0, 0);
    const matrix = Matrix.Identity();

    const raysNegative = generateRays(origin, matrix, -5);
    expect(raysNegative).toHaveLength(0);

    const raysTooMany = generateRays(origin, matrix, 20);
    expect(raysTooMany).toHaveLength(8);
  });

  it('should offset origin slightly above ground', () => {
    const origin = new Vector3(5, 0, 5);
    const matrix = Matrix.Identity();

    const rays = generateRays(origin, matrix, 1);
    expect(rays[0].origin.y).toBeCloseTo(0.01);
    expect(rays[0].origin.x).toBe(5);
    expect(rays[0].origin.z).toBe(5);
  });

  it('should generate rays in circular pattern', () => {
    const origin = new Vector3(0, 0, 0);
    const matrix = Matrix.Identity();

    const rays = generateRays(origin, matrix, 4);

    // With identity matrix, rays should point in cardinal directions
    // Ray 0: angle 0 = +X direction
    expect(rays[0].direction.x).toBeCloseTo(1);
    expect(rays[0].direction.z).toBeCloseTo(0);

    // Ray 1: angle π/2 = +Z direction
    expect(rays[1].direction.x).toBeCloseTo(0);
    expect(rays[1].direction.z).toBeCloseTo(1);

    // Ray 2: angle π = -X direction
    expect(rays[2].direction.x).toBeCloseTo(-1);
    expect(rays[2].direction.z).toBeCloseTo(0);

    // Ray 3: angle 3π/2 = -Z direction
    expect(rays[3].direction.x).toBeCloseTo(0);
    expect(rays[3].direction.z).toBeCloseTo(-1);
  });

  it('should assign colors based on exit face', () => {
    const origin = new Vector3(0, 0, 0);
    const matrix = Matrix.Identity();

    const rays = generateRays(origin, matrix, 4);

    // Ray 0 exits +X face (right) = red
    expect(rays[0].color.r).toBe(FACE_COLORS.right.r);
    expect(rays[0].color.g).toBe(FACE_COLORS.right.g);
    expect(rays[0].color.b).toBe(FACE_COLORS.right.b);

    // Ray 1 exits +Z face (front) = green
    expect(rays[1].color.r).toBe(FACE_COLORS.front.r);
    expect(rays[1].color.g).toBe(FACE_COLORS.front.g);
    expect(rays[1].color.b).toBe(FACE_COLORS.front.b);

    // Ray 2 exits -X face (left) = orange
    expect(rays[2].color.r).toBe(FACE_COLORS.left.r);
    expect(rays[2].color.g).toBe(FACE_COLORS.left.g);
    expect(rays[2].color.b).toBe(FACE_COLORS.left.b);

    // Ray 3 exits -Z face (back) = blue
    expect(rays[3].color.r).toBe(FACE_COLORS.back.r);
    expect(rays[3].color.g).toBe(FACE_COLORS.back.g);
    expect(rays[3].color.b).toBe(FACE_COLORS.back.b);
  });

  it('should transform rays by rotation matrix', () => {
    const origin = new Vector3(0, 0, 0);
    // 90 degree Y rotation matrix (counter-clockwise when looking down Y axis)
    const matrix = Matrix.RotationY(Math.PI / 2);

    const rays = generateRays(origin, matrix, 4);

    // Original +X direction should now point in -Z after 90° CCW rotation
    expect(rays[0].direction.x).toBeCloseTo(0);
    expect(rays[0].direction.z).toBeCloseTo(-1);

    // Original +Z direction should now point in +X after 90° CCW rotation
    expect(rays[1].direction.x).toBeCloseTo(1);
    expect(rays[1].direction.z).toBeCloseTo(0);
  });

  it('should return immutable ray objects', () => {
    const origin = new Vector3(0, 0, 0);
    const matrix = Matrix.Identity();

    const rays = generateRays(origin, matrix, 2);

    // Each ray should have its own Vector3 instances
    rays[0].origin.x = 100;
    expect(rays[1].origin.x).toBe(0);

    rays[0].direction.x = 100;
    expect(rays[1].direction.x).not.toBe(100);
  });
});
