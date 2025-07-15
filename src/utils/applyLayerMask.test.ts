import { describe, it, expect, vi } from 'vitest';
import { Mesh, Camera } from 'babylonjs';
import {
  applyLayerMaskToMesh,
  markAsEditorOnly,
  markAsRenderable,
  applyLayerMaskToCamera,
} from './applyLayerMask';
import { RENDER_LAYER, EDITOR_LAYER } from '../constants/layerMasks';

describe('applyLayerMask', () => {
  describe('applyLayerMaskToMesh', () => {
    it('should apply layer mask to mesh', () => {
      const mesh = { layerMask: 0, getChildMeshes: vi.fn(() => []) } as unknown as Mesh;
      
      applyLayerMaskToMesh(mesh, RENDER_LAYER);
      
      expect(mesh.layerMask).toBe(RENDER_LAYER);
    });

    it('should apply layer mask to child meshes', () => {
      const childMesh = { layerMask: 0 } as unknown as Mesh;
      const mesh = {
        layerMask: 0,
        getChildMeshes: vi.fn(() => [childMesh]),
      } as unknown as Mesh;
      
      applyLayerMaskToMesh(mesh, EDITOR_LAYER);
      
      expect(mesh.layerMask).toBe(EDITOR_LAYER);
      expect(childMesh.layerMask).toBe(EDITOR_LAYER);
    });

    it('should handle null mesh gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      applyLayerMaskToMesh(null as any, RENDER_LAYER);
      
      expect(consoleSpy).toHaveBeenCalledWith('applyLayerMaskToMesh: mesh is null or undefined');
      consoleSpy.mockRestore();
    });
  });

  describe('markAsEditorOnly', () => {
    it('should mark mesh with editor layer', () => {
      const mesh = { layerMask: 0, getChildMeshes: vi.fn(() => []) } as unknown as Mesh;
      
      markAsEditorOnly(mesh);
      
      expect(mesh.layerMask).toBe(EDITOR_LAYER);
    });
  });

  describe('markAsRenderable', () => {
    it('should mark mesh with render layer', () => {
      const mesh = { layerMask: 0, getChildMeshes: vi.fn(() => []) } as unknown as Mesh;
      
      markAsRenderable(mesh);
      
      expect(mesh.layerMask).toBe(RENDER_LAYER);
    });
  });

  describe('applyLayerMaskToCamera', () => {
    it('should apply layer mask to camera', () => {
      const camera = { layerMask: 0 } as unknown as Camera;
      
      applyLayerMaskToCamera(camera, 3); // Editor camera mask
      
      expect(camera.layerMask).toBe(3);
    });

    it('should handle null camera gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      applyLayerMaskToCamera(null as any, 1);
      
      expect(consoleSpy).toHaveBeenCalledWith('applyLayerMaskToCamera: camera is null or undefined');
      consoleSpy.mockRestore();
    });
  });
});