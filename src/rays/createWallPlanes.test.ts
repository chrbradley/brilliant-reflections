import { describe, it, expect } from 'vitest';
import { createWallPlanes } from './createWallPlanes';
import { ROOM_HALF } from '../constants';

describe('createWallPlanes', () => {
  it('should create four wall planes', () => {
    const planes = createWallPlanes();
    expect(planes).toHaveLength(4);
  });

  it('should position walls at room boundaries', () => {
    const planes = createWallPlanes();

    // North wall at +Z
    expect(planes[0].position.z).toBe(ROOM_HALF);
    expect(planes[0].position.x).toBe(0);
    expect(planes[0].position.y).toBe(0);

    // South wall at -Z
    expect(planes[1].position.z).toBe(-ROOM_HALF);

    // East wall at +X
    expect(planes[2].position.x).toBe(ROOM_HALF);

    // West wall at -X
    expect(planes[3].position.x).toBe(-ROOM_HALF);
  });

  it('should have correct inward-facing normals', () => {
    const planes = createWallPlanes();

    // North wall normal points -Z (inward)
    expect(planes[0].normal.x).toBe(0);
    expect(planes[0].normal.y).toBe(0);
    expect(planes[0].normal.z).toBe(-1);

    // South wall normal points +Z (inward)
    expect(planes[1].normal.z).toBe(1);

    // East wall normal points -X (inward)
    expect(planes[2].normal.x).toBe(-1);

    // West wall normal points +X (inward)
    expect(planes[3].normal.x).toBe(1);
  });

  it('should mark correct walls as mirrors', () => {
    const planes = createWallPlanes();

    // North, East, and West are mirrors
    expect(planes[0].isMirror).toBe(true); // North
    expect(planes[1].isMirror).toBe(false); // South
    expect(planes[2].isMirror).toBe(true); // East
    expect(planes[3].isMirror).toBe(true); // West
  });

  it('should return immutable plane data', () => {
    const planes1 = createWallPlanes();
    const planes2 = createWallPlanes();

    // Should return new instances each time
    expect(planes1).not.toBe(planes2);
    expect(planes1[0]).not.toBe(planes2[0]);
    expect(planes1[0].position).not.toBe(planes2[0].position);
  });
});
