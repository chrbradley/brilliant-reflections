import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPickHandler } from './handlePicking';
import { Scene, Mesh, PointerEventTypes } from 'babylonjs';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from './createEditorScene';

describe('handlePicking', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  describe('createPickHandler', () => {
    it('should return a pick handler function', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const onPick = vi.fn();

      const handler = createPickHandler(sceneConfig.scene, onPick);

      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');

      sceneConfig.dispose();
    });

    it('should call onPick when pickable mesh is clicked', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const onPick = vi.fn();

      // Create a pickable mesh
      const mesh = new Mesh('testMesh', sceneConfig.scene);
      mesh.isPickable = true;

      const handler = createPickHandler(sceneConfig.scene, onPick);

      // Simulate pointer event
      const pointerInfo = {
        type: PointerEventTypes.POINTERPICK,
        pickInfo: {
          hit: true,
          pickedMesh: mesh,
        },
      };

      handler(pointerInfo as any);

      expect(onPick).toHaveBeenCalledWith('testMesh');

      sceneConfig.dispose();
    });

    it('should not call onPick when clicking empty space', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const onPick = vi.fn();

      const handler = createPickHandler(sceneConfig.scene, onPick);

      // Simulate pointer event with no hit
      const pointerInfo = {
        type: PointerEventTypes.POINTERPICK,
        pickInfo: {
          hit: false,
          pickedMesh: null,
        },
      };

      handler(pointerInfo as any);

      expect(onPick).not.toHaveBeenCalled();

      sceneConfig.dispose();
    });

    it('should call onPick with null when clicking empty space with clearOnEmpty', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const onPick = vi.fn();

      const handler = createPickHandler(sceneConfig.scene, onPick, true);

      // Simulate pointer event with no hit
      const pointerInfo = {
        type: PointerEventTypes.POINTERPICK,
        pickInfo: {
          hit: false,
          pickedMesh: null,
        },
      };

      handler(pointerInfo as any);

      expect(onPick).toHaveBeenCalledWith(null);

      sceneConfig.dispose();
    });

    it('should ignore non-pickable meshes', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const onPick = vi.fn();

      // Create a non-pickable mesh
      const mesh = new Mesh('testMesh', sceneConfig.scene);
      mesh.isPickable = false;

      const handler = createPickHandler(sceneConfig.scene, onPick);

      // Simulate pointer event
      const pointerInfo = {
        type: PointerEventTypes.POINTERPICK,
        pickInfo: {
          hit: true,
          pickedMesh: mesh,
        },
      };

      handler(pointerInfo as any);

      expect(onPick).not.toHaveBeenCalled();

      sceneConfig.dispose();
    });

    it('should only handle POINTERPICK events', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const onPick = vi.fn();

      const mesh = new Mesh('testMesh', sceneConfig.scene);
      mesh.isPickable = true;

      const handler = createPickHandler(sceneConfig.scene, onPick);

      // Try other event types
      const moveEvent = {
        type: PointerEventTypes.POINTERMOVE,
        pickInfo: {
          hit: true,
          pickedMesh: mesh,
        },
      };

      handler(moveEvent as any);

      expect(onPick).not.toHaveBeenCalled();

      sceneConfig.dispose();
    });

    it('should handle meshes without names', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const onPick = vi.fn();

      // Create a mesh without name
      const mesh = new Mesh('', sceneConfig.scene);
      mesh.isPickable = true;

      const handler = createPickHandler(sceneConfig.scene, onPick);

      const pointerInfo = {
        type: PointerEventTypes.POINTERPICK,
        pickInfo: {
          hit: true,
          pickedMesh: mesh,
        },
      };

      handler(pointerInfo as any);

      expect(onPick).toHaveBeenCalledWith('');

      sceneConfig.dispose();
    });
  });
});
