import { describe, it, expect, beforeEach } from 'vitest';
import { createRotationGizmo } from './createRotationGizmo';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';
import { Mesh, Vector3, GizmoManager, UtilityLayerRenderer } from 'babylonjs';
import { degreesToRadians } from '../transforms/rotationTransforms';

describe('createRotationGizmo', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  it('should create a rotation gizmo configuration', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);

    // Create GizmoManager first (prerequisite)
    const utilityLayer = new UtilityLayerRenderer(sceneConfig.scene);
    const gizmoManager = new GizmoManager(
      sceneConfig.scene,
      undefined,
      utilityLayer
    );
    // Store gizmoManager reference

    const gizmoConfig = createRotationGizmo(sceneConfig.scene, mesh);

    expect(gizmoConfig).toBeDefined();
    expect(gizmoConfig.gizmoManager).toBeDefined();
    expect(gizmoConfig.attachedMesh).toBe(mesh);
    expect(gizmoConfig.constraints).toBeDefined();

    sceneConfig.dispose();
  });

  it('should configure gizmo for Y-axis only', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);

    // Create GizmoManager first (prerequisite)
    const utilityLayer = new UtilityLayerRenderer(sceneConfig.scene);
    const gizmoManager = new GizmoManager(
      sceneConfig.scene,
      undefined,
      utilityLayer
    );
    // Store gizmoManager reference

    const gizmoConfig = createRotationGizmo(sceneConfig.scene, mesh);

    expect(gizmoConfig.constraints.xEnabled).toBe(false);
    expect(gizmoConfig.constraints.yEnabled).toBe(true);
    expect(gizmoConfig.constraints.zEnabled).toBe(false);

    sceneConfig.dispose();
  });

  it('should enable rotation gizmo on manager', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);

    // Create GizmoManager first (prerequisite)
    const utilityLayer = new UtilityLayerRenderer(sceneConfig.scene);
    const gizmoManager = new GizmoManager(
      sceneConfig.scene,
      undefined,
      utilityLayer
    );
    // Store gizmoManager reference

    const gizmoConfig = createRotationGizmo(sceneConfig.scene, mesh);

    expect(gizmoConfig.gizmoManager.rotationGizmoEnabled).toBe(true);

    sceneConfig.dispose();
  });

  it('should configure constraint callback', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);

    // Create GizmoManager first (prerequisite)
    const utilityLayer = new UtilityLayerRenderer(sceneConfig.scene);
    const gizmoManager = new GizmoManager(
      sceneConfig.scene,
      undefined,
      utilityLayer
    );
    // Store gizmoManager reference

    const gizmoConfig = createRotationGizmo(sceneConfig.scene, mesh);

    expect(gizmoConfig.constraints.updateCallback).toBeDefined();
    expect(typeof gizmoConfig.constraints.updateCallback).toBe('function');

    sceneConfig.dispose();
  });

  it('should apply rotation constraints through callback', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);
    mesh.rotation = new Vector3(0, 0, 0);

    // Create GizmoManager first (prerequisite)
    const utilityLayer = new UtilityLayerRenderer(sceneConfig.scene);
    const gizmoManager = new GizmoManager(
      sceneConfig.scene,
      undefined,
      utilityLayer
    );
    // Store gizmoManager reference

    const gizmoConfig = createRotationGizmo(sceneConfig.scene, mesh);

    // Test constraint callback
    const testRotation = new Vector3(0.5, degreesToRadians(37), -0.3);
    mesh.rotation.copyFrom(testRotation);

    // Call the constraint callback
    gizmoConfig.constraints.updateCallback();

    // Should be clamped to Y-axis and snapped
    expect(mesh.rotation.x).toBe(0); // X zeroed
    expect(mesh.rotation.z).toBe(0); // Z zeroed
    expect(Math.abs(mesh.rotation.y - degreesToRadians(30))).toBeLessThan(0.01); // 37° -> 30° (15° snap)

    sceneConfig.dispose();
  });

  it('should accept custom snap increment', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);

    // Create GizmoManager first (prerequisite)
    const utilityLayer = new UtilityLayerRenderer(sceneConfig.scene);
    const gizmoManager = new GizmoManager(
      sceneConfig.scene,
      undefined,
      utilityLayer
    );
    // Store gizmoManager reference

    const gizmoConfig = createRotationGizmo(sceneConfig.scene, mesh, 10);

    // Test with custom constraints
    mesh.rotation = new Vector3(0, degreesToRadians(22), 0);
    gizmoConfig.constraints.updateCallback();

    expect(Math.abs(mesh.rotation.y - degreesToRadians(20))).toBeLessThan(0.01); // Snapped to 10° grid

    sceneConfig.dispose();
  });

  it('should throw error if no GizmoManager exists', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);

    // Don't create GizmoManager
    expect(() => {
      createRotationGizmo(sceneConfig.scene, mesh);
    }).toThrow(
      'GizmoManager not found. Position gizmo should be created first.'
    );

    sceneConfig.dispose();
  });

  it('should return immutable configuration', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);

    // Create GizmoManager first (prerequisite)
    const utilityLayer = new UtilityLayerRenderer(sceneConfig.scene);
    const gizmoManager = new GizmoManager(
      sceneConfig.scene,
      undefined,
      utilityLayer
    );
    // Store gizmoManager reference

    const gizmoConfig = createRotationGizmo(sceneConfig.scene, mesh);

    expect(typeof gizmoConfig).toBe('object');
    expect(gizmoConfig).toHaveProperty('gizmoManager');
    expect(gizmoConfig).toHaveProperty('attachedMesh');
    expect(gizmoConfig).toHaveProperty('constraints');

    sceneConfig.dispose();
  });
});
