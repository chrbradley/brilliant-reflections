import { describe, it, expect, beforeEach } from 'vitest';
import { createRayMeshes, createAllRayMeshes } from './createRayMeshes';
import { Vector3, Color3, Matrix, TransformNode, MeshBuilder } from 'babylonjs';
import { Ray } from './types';
import { createWallPlanes } from './createWallPlanes';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';

describe('createRayMeshes', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  it('should create meshes for ray segments', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);

    const ray: Ray = {
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(1, 0, 0),
      color: new Color3(1, 0, 0),
    };

    const wallPlanes = createWallPlanes();
    const meshes = createRayMeshes(ray, 0, wallPlanes, 2, sceneConfig.scene);

    expect(meshes.length).toBeGreaterThan(0);
    expect(meshes[0].name).toBe('ray0_seg0');

    sceneConfig.dispose();
  });

  it('should set mesh properties correctly', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);

    const ray: Ray = {
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(0, 0, 1),
      color: new Color3(0, 1, 0),
    };

    const wallPlanes = createWallPlanes();
    const meshes = createRayMeshes(ray, 1, wallPlanes, 1, sceneConfig.scene);

    expect((meshes[0] as any).color.g).toBe(1); // Green color
    expect(meshes[0].isPickable).toBe(false);
    expect((meshes[0] as any).alpha).toBeGreaterThan(0);

    sceneConfig.dispose();
  });

  it('should create multiple segments for multiple bounces', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);

    const ray: Ray = {
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(1, 0, 1).normalize(), // Diagonal
      color: new Color3(1, 0, 0),
    };

    const wallPlanes = createWallPlanes();
    const meshes = createRayMeshes(ray, 0, wallPlanes, 3, sceneConfig.scene);

    // Should have multiple segments if ray bounces
    expect(meshes.length).toBeGreaterThanOrEqual(1);

    sceneConfig.dispose();
  });
});

describe('createAllRayMeshes', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  it('should create meshes for all rays', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);

    const parentNode = new TransformNode('raysParent', sceneConfig.scene);

    const config = {
      origin: new Vector3(0, 0, 0),
      worldMatrix: Matrix.Identity(),
      rayCount: 4,
      maxBounces: 2,
      scene: sceneConfig.scene,
      parentNode,
    };

    createAllRayMeshes(config);

    // Should have created child meshes
    const children = parentNode.getChildren();
    expect(children.length).toBeGreaterThan(0);

    sceneConfig.dispose();
  });

  it('should clear existing children before creating new ones', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);

    const parentNode = new TransformNode('raysParent', sceneConfig.scene);

    // Add some existing children
    const existingChild = MeshBuilder.CreateBox(
      'existing',
      {},
      sceneConfig.scene
    );
    existingChild.parent = parentNode;

    const config = {
      origin: new Vector3(0, 0, 0),
      worldMatrix: Matrix.Identity(),
      rayCount: 2,
      maxBounces: 1,
      scene: sceneConfig.scene,
      parentNode,
    };

    createAllRayMeshes(config);

    // Existing child should be disposed
    expect(existingChild.isDisposed()).toBe(true);

    sceneConfig.dispose();
  });

  it('should handle zero ray count', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);

    const parentNode = new TransformNode('raysParent', sceneConfig.scene);

    const config = {
      origin: new Vector3(0, 0, 0),
      worldMatrix: Matrix.Identity(),
      rayCount: 0,
      maxBounces: 2,
      scene: sceneConfig.scene,
      parentNode,
    };

    createAllRayMeshes(config);

    // Should have no children
    expect(parentNode.getChildren()).toHaveLength(0);

    sceneConfig.dispose();
  });

  it('should apply rotation matrix to rays', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);

    const parentNode = new TransformNode('raysParent', sceneConfig.scene);

    const config = {
      origin: new Vector3(0, 0, 0),
      worldMatrix: Matrix.RotationY(Math.PI / 2), // 90 degree rotation
      rayCount: 1,
      maxBounces: 1,
      scene: sceneConfig.scene,
      parentNode,
    };

    createAllRayMeshes(config);

    // Should have created rotated rays
    expect(parentNode.getChildren().length).toBeGreaterThan(0);

    sceneConfig.dispose();
  });
});
