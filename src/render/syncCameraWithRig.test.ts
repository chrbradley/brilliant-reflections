import { describe, it, expect } from 'vitest';
import { syncCameraWithRig } from './syncCameraWithRig';
import { Vector3 } from 'babylonjs';

describe('syncCameraWithRig', () => {
  it('should calculate camera transform from rig position', () => {
    const rigPosition = new Vector3(5, 0, -3);
    const rigRotation = new Vector3(0, Math.PI / 4, 0); // 45 degrees

    const transform = syncCameraWithRig(rigPosition, rigRotation);

    expect(transform).toBeDefined();
    expect(transform.position).toBeDefined();
    expect(transform.rotation).toBeDefined();
  });

  it('should return camera position at rig location', () => {
    const rigPosition = new Vector3(2, 0, -4);
    const rigRotation = new Vector3(0, 0, 0);

    const transform = syncCameraWithRig(rigPosition, rigRotation);

    // Camera should be at same XZ position but elevated
    expect(transform.position.x).toBe(rigPosition.x);
    expect(transform.position.y).toBeGreaterThan(rigPosition.y); // Elevated
    expect(transform.position.z).toBe(rigPosition.z);
  });

  it('should apply yaw rotation only', () => {
    const rigPosition = new Vector3(0, 0, 0);
    const rigRotation = new Vector3(0, Math.PI / 2, 0); // 90 degrees yaw

    const transform = syncCameraWithRig(rigPosition, rigRotation);

    expect(transform.rotation.x).toBe(0); // No pitch
    expect(transform.rotation.y).toBe(rigRotation.y); // Same yaw
    expect(transform.rotation.z).toBe(0); // No roll
  });

  it('should be a pure function with consistent output', () => {
    const rigPosition = new Vector3(1, 0, -1);
    const rigRotation = new Vector3(0, 0.5, 0);

    const transform1 = syncCameraWithRig(rigPosition, rigRotation);
    const transform2 = syncCameraWithRig(rigPosition, rigRotation);

    expect(transform1.position.equals(transform2.position)).toBe(true);
    expect(transform1.rotation.equals(transform2.rotation)).toBe(true);
  });

  it('should handle zero position and rotation', () => {
    const rigPosition = new Vector3(0, 0, 0);
    const rigRotation = new Vector3(0, 0, 0);

    const transform = syncCameraWithRig(rigPosition, rigRotation);

    expect(transform.position.x).toBe(0);
    expect(transform.position.z).toBe(0);
    expect(transform.rotation.y).toBe(0);
  });

  it('should return new vector instances', () => {
    const rigPosition = new Vector3(1, 0, 1);
    const rigRotation = new Vector3(0, 0, 0);

    const transform = syncCameraWithRig(rigPosition, rigRotation);

    // Modifying input should not affect output
    rigPosition.x = 999;
    expect(transform.position.x).toBe(1);

    // Output vectors are new instances
    expect(transform.position).not.toBe(rigPosition);
    expect(transform.rotation).not.toBe(rigRotation);
  });
});
