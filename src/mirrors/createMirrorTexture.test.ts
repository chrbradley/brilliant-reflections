import { describe, it, expect, beforeEach } from 'vitest';
import { createMirrorConfig, calculateReflectionPlane } from './createMirrorTexture';
import { Vector3, Plane } from 'babylonjs';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';

describe('createMirrorTexture', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  describe('calculateReflectionPlane', () => {
    it('should calculate north wall reflection plane', () => {
      const position = new Vector3(0, 0, 10);
      const normal = new Vector3(0, 0, -1);
      
      const plane = calculateReflectionPlane(position, normal);
      
      expect(plane).toBeInstanceOf(Plane);
      expect(plane.normal).toEqual(normal);
      expect(plane.d).toBe(10); // Babylon's d = -dot(normal, position) = -(0*0 + 0*0 + (-1)*10) = -(-10) = 10
    });

    it('should calculate east wall reflection plane', () => {
      const position = new Vector3(10, 0, 0);
      const normal = new Vector3(-1, 0, 0);
      
      const plane = calculateReflectionPlane(position, normal);
      
      expect(plane).toBeInstanceOf(Plane);
      expect(plane.normal).toEqual(normal);
      expect(plane.d).toBe(10); // d = -((-1)*10 + 0*0 + 0*0) = -(-10) = 10
    });

    it('should calculate west wall reflection plane', () => {
      const position = new Vector3(-10, 0, 0);
      const normal = new Vector3(1, 0, 0);
      
      const plane = calculateReflectionPlane(position, normal);
      
      expect(plane).toBeInstanceOf(Plane);
      expect(plane.normal).toEqual(normal);
      expect(plane.d).toBe(10); // d = -(1*(-10) + 0*0 + 0*0) = -(-10) = 10
    });

    it('should handle arbitrary positions and normals', () => {
      const position = new Vector3(5, 3, -7);
      const normal = new Vector3(0.6, 0, 0.8);
      
      const plane = calculateReflectionPlane(position, normal);
      
      expect(plane.normal).toEqual(normal);
      const expectedD = -(normal.x * position.x + normal.y * position.y + normal.z * position.z);
      expect(plane.d).toBeCloseTo(expectedD);
    });
  });

  describe('createMirrorConfig', () => {
    it('should create mirror configuration for a wall', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const wallName = 'north_wall';
      const position = new Vector3(0, 0, 10);
      const normal = new Vector3(0, 0, -1);
      
      const config = createMirrorConfig(wallName, position, normal, sceneConfig.scene);
      
      expect(config.name).toBe(`${wallName}_mirror`);
      expect(config.textureSize).toBe(512);
      expect(config.reflectionPlane).toBeInstanceOf(Plane);
      expect(config.scene).toBe(sceneConfig.scene);
      
      sceneConfig.dispose();
    });

    it('should create unique names for different walls', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const config1 = createMirrorConfig('north_wall', new Vector3(0, 0, 10), new Vector3(0, 0, -1), sceneConfig.scene);
      const config2 = createMirrorConfig('east_wall', new Vector3(10, 0, 0), new Vector3(-1, 0, 0), sceneConfig.scene);
      
      expect(config1.name).toBe('north_wall_mirror');
      expect(config2.name).toBe('east_wall_mirror');
      expect(config1.name).not.toBe(config2.name);
      
      sceneConfig.dispose();
    });

    it('should use consistent texture size', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const config = createMirrorConfig('test_wall', new Vector3(0, 0, 0), new Vector3(1, 0, 0), sceneConfig.scene);
      
      expect(config.textureSize).toBe(512);
      
      sceneConfig.dispose();
    });

    it('should calculate reflection plane based on position and normal', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      
      const position = new Vector3(8, 0, 0);
      const normal = new Vector3(-1, 0, 0);
      
      const config = createMirrorConfig('east_wall', position, normal, sceneConfig.scene);
      
      expect(config.reflectionPlane.normal).toEqual(normal);
      expect(config.reflectionPlane.d).toBe(8); // d = -((-1)*8 + 0*0 + 0*0) = 8
      
      sceneConfig.dispose();
    });
  });
});