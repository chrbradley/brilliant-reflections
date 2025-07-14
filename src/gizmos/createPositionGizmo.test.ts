import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPositionGizmo } from './createPositionGizmo';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';
import { Mesh, Vector3 } from 'babylonjs';

describe('createPositionGizmo', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  it('should create a position gizmo configuration', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);
    
    const gizmoConfig = createPositionGizmo(sceneConfig.scene, mesh);
    
    expect(gizmoConfig).toBeDefined();
    expect(gizmoConfig.gizmoManager).toBeDefined();
    expect(gizmoConfig.attachedMesh).toBe(mesh);
    expect(gizmoConfig.constraints).toBeDefined();
    
    sceneConfig.dispose();
  });

  it('should configure gizmo for X and Z axes only', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);
    
    const gizmoConfig = createPositionGizmo(sceneConfig.scene, mesh);
    
    expect(gizmoConfig.constraints.xEnabled).toBe(true);
    expect(gizmoConfig.constraints.yEnabled).toBe(false); // Y disabled
    expect(gizmoConfig.constraints.zEnabled).toBe(true);
    
    sceneConfig.dispose();
  });

  it('should attach gizmo to provided mesh', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);
    
    const gizmoConfig = createPositionGizmo(sceneConfig.scene, mesh);
    
    expect(gizmoConfig.gizmoManager.attachedMesh).toBe(mesh);
    
    sceneConfig.dispose();
  });

  it('should configure constraint callback', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);
    
    const gizmoConfig = createPositionGizmo(sceneConfig.scene, mesh);
    
    expect(gizmoConfig.constraints.updateCallback).toBeDefined();
    expect(typeof gizmoConfig.constraints.updateCallback).toBe('function');
    
    sceneConfig.dispose();
  });

  it('should apply position constraints through callback', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);
    mesh.position = new Vector3(0, 0, 0);
    
    const gizmoConfig = createPositionGizmo(sceneConfig.scene, mesh);
    
    // Test constraint callback
    const testPosition = new Vector3(5.7, 2, -9.1);
    mesh.position.copyFrom(testPosition);
    
    // Call the constraint callback
    gizmoConfig.constraints.updateCallback();
    
    // Should be snapped to grid and clamped
    expect(mesh.position.x).toBe(6); // 5.7 -> 6
    expect(mesh.position.y).toBe(2); // Y unchanged
    expect(mesh.position.z).toBe(-8); // -9.1 -> -9 -> -8 (clamped)
    
    sceneConfig.dispose();
  });

  it('should accept custom grid size and limit', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);
    
    const gizmoConfig = createPositionGizmo(sceneConfig.scene, mesh, 0.5, 6);
    
    // Test with custom constraints
    mesh.position = new Vector3(5.3, 0, 7.8);
    gizmoConfig.constraints.updateCallback();
    
    expect(mesh.position.x).toBe(5.5); // Snapped to 0.5 grid
    expect(mesh.position.z).toBe(6); // 7.8 -> 8 -> 6 (clamped to 6)
    
    sceneConfig.dispose();
  });

  it('should return immutable configuration', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);
    
    const gizmoConfig = createPositionGizmo(sceneConfig.scene, mesh);
    
    expect(typeof gizmoConfig).toBe('object');
    expect(gizmoConfig).toHaveProperty('gizmoManager');
    expect(gizmoConfig).toHaveProperty('attachedMesh');
    expect(gizmoConfig).toHaveProperty('constraints');
    
    sceneConfig.dispose();
  });

  it('should enable position gizmo on manager', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const mesh = new Mesh('testMesh', sceneConfig.scene);
    
    const gizmoConfig = createPositionGizmo(sceneConfig.scene, mesh);
    
    expect(gizmoConfig.gizmoManager.positionGizmoEnabled).toBe(true);
    
    sceneConfig.dispose();
  });
});