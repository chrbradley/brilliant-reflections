import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applyHighlight, removeHighlight } from './highlightEffect';
import { Mesh, StandardMaterial, Color3 } from 'babylonjs';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';

describe('highlightEffect', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  describe('applyHighlight', () => {
    it('should enable edge rendering on mesh', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const mesh = new Mesh('testMesh', sceneConfig.scene);
      mesh.enableEdgesRendering = vi.fn();
      
      applyHighlight(sceneConfig.scene, 'testMesh');
      
      expect(mesh.enableEdgesRendering).toHaveBeenCalled();
      
      sceneConfig.dispose();
    });

    it('should set highlight edge properties', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const mesh = new Mesh('testMesh', sceneConfig.scene);
      
      applyHighlight(sceneConfig.scene, 'testMesh');
      
      expect(mesh.edgesWidth).toBeGreaterThan(0);
      expect(mesh.edgesColor).toBeDefined();
      
      sceneConfig.dispose();
    });

    it('should store original material emissive color', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const mesh = new Mesh('testMesh', sceneConfig.scene);
      const material = new StandardMaterial('testMat', sceneConfig.scene);
      material.emissiveColor = new Color3(0.1, 0.2, 0.3);
      mesh.material = material;
      
      applyHighlight(sceneConfig.scene, 'testMesh');
      
      // Should modify emissive color
      expect(material.emissiveColor.r).toBeGreaterThan(0.1);
      
      sceneConfig.dispose();
    });

    it('should handle mesh without material', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const mesh = new Mesh('testMesh', sceneConfig.scene);
      mesh.material = null;
      
      // Should not throw
      expect(() => {
        applyHighlight(sceneConfig.scene, 'testMesh');
      }).not.toThrow();
      
      sceneConfig.dispose();
    });

    it('should handle non-existent mesh', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      // Should not throw
      expect(() => {
        applyHighlight(sceneConfig.scene, 'nonExistentMesh');
      }).not.toThrow();
      
      sceneConfig.dispose();
    });

    it('should not affect other meshes', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const mesh1 = new Mesh('mesh1', sceneConfig.scene);
      const mesh2 = new Mesh('mesh2', sceneConfig.scene);
      
      mesh2.enableEdgesRendering = vi.fn();
      
      applyHighlight(sceneConfig.scene, 'mesh1');
      
      expect(mesh2.enableEdgesRendering).not.toHaveBeenCalled();
      
      sceneConfig.dispose();
    });
  });

  describe('removeHighlight', () => {
    it('should disable edge rendering on mesh', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const mesh = new Mesh('testMesh', sceneConfig.scene);
      mesh.disableEdgesRendering = vi.fn();
      
      // First apply, then remove
      applyHighlight(sceneConfig.scene, 'testMesh');
      removeHighlight(sceneConfig.scene, 'testMesh');
      
      expect(mesh.disableEdgesRendering).toHaveBeenCalled();
      
      sceneConfig.dispose();
    });

    it('should restore original emissive color', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const mesh = new Mesh('testMesh', sceneConfig.scene);
      const material = new StandardMaterial('testMat', sceneConfig.scene);
      const originalColor = new Color3(0.1, 0.2, 0.3);
      material.emissiveColor = originalColor.clone();
      mesh.material = material;
      
      applyHighlight(sceneConfig.scene, 'testMesh');
      removeHighlight(sceneConfig.scene, 'testMesh');
      
      expect(material.emissiveColor.equals(originalColor)).toBe(true);
      
      sceneConfig.dispose();
    });

    it('should handle mesh without material', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const mesh = new Mesh('testMesh', sceneConfig.scene);
      mesh.material = null;
      
      // Should not throw
      expect(() => {
        removeHighlight(sceneConfig.scene, 'testMesh');
      }).not.toThrow();
      
      sceneConfig.dispose();
    });

    it('should handle non-existent mesh', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      // Should not throw
      expect(() => {
        removeHighlight(sceneConfig.scene, 'nonExistentMesh');
      }).not.toThrow();
      
      sceneConfig.dispose();
    });

    it('should handle removing highlight that was never applied', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const mesh = new Mesh('testMesh', sceneConfig.scene);
      
      // Should not throw
      expect(() => {
        removeHighlight(sceneConfig.scene, 'testMesh');
      }).not.toThrow();
      
      sceneConfig.dispose();
    });
  });
});