import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRayManager,
  showRays,
  hideRays,
  updateRays,
  disposeRayManager,
} from './rayManager';
import { Vector3, Matrix } from 'babylonjs';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';

describe('rayManager', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  describe('createRayManager', () => {
    it('should create a ray manager with parent node', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);

      const manager = createRayManager(sceneConfig.scene);

      expect(manager.parentNode).toBeDefined();
      expect(manager.parentNode.name).toBe('raysParent');
      expect(manager.scene).toBe(sceneConfig.scene);
      expect(manager.isVisible).toBe(false);
      expect(manager.currentConfig).toBeNull();

      sceneConfig.dispose();
    });

    it('should start with rays hidden', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);

      const manager = createRayManager(sceneConfig.scene);

      expect(manager.parentNode.isEnabled()).toBe(false);

      sceneConfig.dispose();
    });
  });

  describe('showRays', () => {
    it('should enable parent node and set visibility', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);

      let manager = createRayManager(sceneConfig.scene);
      manager = showRays(manager);

      expect(manager.parentNode.isEnabled()).toBe(true);
      expect(manager.isVisible).toBe(true);

      sceneConfig.dispose();
    });

    it('should return new manager instance', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);

      const manager1 = createRayManager(sceneConfig.scene);
      const manager2 = showRays(manager1);

      expect(manager2).not.toBe(manager1);

      sceneConfig.dispose();
    });
  });

  describe('hideRays', () => {
    it('should disable parent node and clear visibility', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);

      let manager = createRayManager(sceneConfig.scene);
      manager = showRays(manager);
      manager = hideRays(manager);

      expect(manager.parentNode.isEnabled()).toBe(false);
      expect(manager.isVisible).toBe(false);

      sceneConfig.dispose();
    });
  });

  describe('updateRays', () => {
    it('should update rays with new configuration', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);

      let manager = createRayManager(sceneConfig.scene);

      const origin = new Vector3(5, 0, 5);
      const matrix = Matrix.Identity();
      const config = { count: 4, maxBounces: 2 };

      manager = updateRays(manager, origin, matrix, config);

      expect(manager.currentConfig).toEqual(config);

      sceneConfig.dispose();
    });

    it('should create ray meshes as children', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);

      let manager = createRayManager(sceneConfig.scene);

      const origin = new Vector3(0, 0, 0);
      const matrix = Matrix.Identity();
      const config = { count: 2, maxBounces: 1 };

      manager = updateRays(manager, origin, matrix, config);

      // Should have created some child meshes
      const children = manager.parentNode.getChildren();
      expect(children.length).toBeGreaterThan(0);

      sceneConfig.dispose();
    });
  });

  describe('disposeRayManager', () => {
    it('should dispose parent node and children', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);

      let manager = createRayManager(sceneConfig.scene);

      // Add some rays
      const origin = new Vector3(0, 0, 0);
      const matrix = Matrix.Identity();
      const config = { count: 4, maxBounces: 2 };
      manager = updateRays(manager, origin, matrix, config);

      const parentNode = manager.parentNode;

      disposeRayManager(manager);

      expect(parentNode.isDisposed()).toBe(true);

      sceneConfig.dispose();
    });
  });
});
