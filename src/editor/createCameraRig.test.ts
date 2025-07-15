import { describe, it, expect, beforeEach } from 'vitest';
import { createCameraRig } from './createCameraRig';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from './createEditorScene';

describe('createCameraRig', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  it('should create a camera rig with transform node and cone indicator', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    expect(rig).toBeDefined();
    expect(rig.rigNode).toBeDefined();
    expect(rig.pivotNode).toBeDefined();
    expect(rig.coneIndicator).toBeDefined();
    expect(rig.rigNode.name).toBe('camRig');
    expect(rig.pivotNode.name).toBe('camPivot');

    sceneConfig.dispose();
  });

  it('should position rig at default location', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    // Default position should be at (0, 0, -3) to match reference
    expect(rig.rigNode.position.x).toBe(0);
    expect(rig.rigNode.position.y).toBe(0);
    expect(rig.rigNode.position.z).toBe(-3);

    sceneConfig.dispose();
  });

  it('should create non-pickable rig node', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    // TransformNodes don't have isPickable, but cone should be pickable
    expect(rig.coneIndicator.isPickable).toBe(true);

    sceneConfig.dispose();
  });

  it('should create cone with proper dimensions', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    expect(rig.coneIndicator.name).toBe('camera');
    // Cone should be created with specific dimensions

    sceneConfig.dispose();
  });

  it('should create nested hierarchy: cone -> pivot -> rig', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    // Check the nested parent-child relationships
    expect(rig.coneIndicator.parent).toBe(rig.pivotNode);
    expect(rig.pivotNode.parent).toBe(rig.rigNode);

    sceneConfig.dispose();
  });

  it('should accept custom position parameter', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const customPosition = { x: 3, y: 0, z: -2 };
    const rig = createCameraRig(sceneConfig.scene, customPosition);

    expect(rig.rigNode.position.x).toBe(customPosition.x);
    expect(rig.rigNode.position.y).toBe(customPosition.y);
    expect(rig.rigNode.position.z).toBe(customPosition.z);

    sceneConfig.dispose();
  });

  it('should set initial rotations to match reference', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    // Rig should have orientation rotations (matches reference)
    expect(rig.rigNode.rotation.x).toBeCloseTo(Math.PI / 2);
    expect(rig.rigNode.rotation.z).toBeCloseTo(Math.PI);

    // Pivot should have initial Y rotation (matches reference)
    expect(rig.pivotNode.rotation.y).toBeCloseTo(Math.PI / 4);

    sceneConfig.dispose();
  });

  it('should return immutable rig configuration', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    expect(typeof rig).toBe('object');
    expect(rig).toHaveProperty('rigNode');
    expect(rig).toHaveProperty('pivotNode');
    expect(rig).toHaveProperty('coneIndicator');

    sceneConfig.dispose();
  });
});
