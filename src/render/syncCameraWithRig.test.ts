import { describe, it, expect } from 'vitest';
import { syncCameraWithRig } from './syncCameraWithRig';
import { Vector3 } from 'babylonjs';

describe('syncCameraWithRig', () => {
  it('should calculate camera transform from rig position', () => {
    const rigPosition = new Vector3(5, 0, -3);
    const pivotRotation = new Vector3(0, Math.PI / 4, 0); // 45 degrees

    const transform = syncCameraWithRig(rigPosition, pivotRotation);

    expect(transform).toBeDefined();
    expect(transform.position).toBeDefined();
    expect(transform.rotation).toBeDefined();
  });

  it('should position camera behind and above rig when facing forward', () => {
    const rigPosition = new Vector3(2, 0, -4);
    const pivotRotation = new Vector3(0, 0, 0); // Facing +Z

    const transform = syncCameraWithRig(rigPosition, pivotRotation);

    // Camera should be 4 units behind (-Z) and 1 unit above
    expect(transform.position.x).toBe(2);
    expect(transform.position.y).toBe(1);
    expect(transform.position.z).toBe(-8); // -4 + -4 = -8
  });

  it('should rotate camera position based on pivot Y rotation', () => {
    const rigPosition = new Vector3(0, 0, 0);
    const pivotRotation = new Vector3(0, Math.PI / 2, 0); // 90 degrees yaw (facing +X)

    const transform = syncCameraWithRig(rigPosition, pivotRotation);

    // Camera should be 4 units to the left (-X) when rig faces right
    expect(transform.position.x).toBeCloseTo(-4);
    expect(transform.position.y).toBe(1);
    expect(transform.position.z).toBeCloseTo(0);
  });

  it('should apply yaw rotation only', () => {
    const rigPosition = new Vector3(0, 0, 0);
    const pivotRotation = new Vector3(Math.PI / 6, Math.PI / 2, Math.PI / 3); // Mixed rotations

    const transform = syncCameraWithRig(rigPosition, pivotRotation);

    expect(transform.rotation.x).toBe(0); // No pitch
    expect(transform.rotation.y).toBe(Math.PI / 2); // Same yaw as pivot
    expect(transform.rotation.z).toBe(0); // No roll
  });

  it('should be a pure function with consistent output', () => {
    const rigPosition = new Vector3(1, 0, -1);
    const pivotRotation = new Vector3(0, 0.5, 0);

    const transform1 = syncCameraWithRig(rigPosition, pivotRotation);
    const transform2 = syncCameraWithRig(rigPosition, pivotRotation);

    expect(transform1.position.equals(transform2.position)).toBe(true);
    expect(transform1.rotation.equals(transform2.rotation)).toBe(true);
  });

  it('should handle 180 degree rotation', () => {
    const rigPosition = new Vector3(0, 0, 0);
    const pivotRotation = new Vector3(0, Math.PI, 0); // Facing -Z

    const transform = syncCameraWithRig(rigPosition, pivotRotation);

    // Camera should be 4 units forward (+Z) when rig faces backward
    expect(transform.position.x).toBeCloseTo(0);
    expect(transform.position.y).toBe(1);
    expect(transform.position.z).toBeCloseTo(4);
  });

  it('should return new vector instances', () => {
    const rigPosition = new Vector3(1, 0, 1);
    const pivotRotation = new Vector3(0, 0, 0);

    const transform = syncCameraWithRig(rigPosition, pivotRotation);

    // Modifying input should not affect output
    rigPosition.x = 999;
    expect(transform.position.x).toBe(1);

    // Output vectors are new instances
    expect(transform.position).not.toBe(rigPosition);
    expect(transform.rotation).not.toBe(pivotRotation);
  });
});
