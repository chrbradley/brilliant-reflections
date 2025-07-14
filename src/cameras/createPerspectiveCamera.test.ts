import { describe, it, expect, beforeEach } from 'vitest';
import { createPerspectiveCamera } from './createPerspectiveCamera';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createRenderScene } from '../render/createRenderScene';

describe('createPerspectiveCamera', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  it('should create a perspective camera with correct configuration', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createRenderScene(canvas);
    const camera = createPerspectiveCamera('testCamera', sceneConfig.scene);

    expect(camera).toBeDefined();
    expect(camera.name).toBe('testCamera');
    expect(camera.mode).toBe(BABYLON.Camera.PERSPECTIVE_CAMERA);
    
    sceneConfig.dispose();
  });

  it('should have approximately 60 degree FOV', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createRenderScene(canvas);
    const camera = createPerspectiveCamera('testCamera', sceneConfig.scene);

    // Convert radians to degrees for easier verification
    const fovDegrees = camera.fov * (180 / Math.PI);
    expect(fovDegrees).toBeCloseTo(60, 1);
    
    sceneConfig.dispose();
  });

  it('should position camera at (0, 5, -10)', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createRenderScene(canvas);
    const camera = createPerspectiveCamera('testCamera', sceneConfig.scene);

    expect(camera.position.x).toBe(0);
    expect(camera.position.y).toBe(5);
    expect(camera.position.z).toBe(-10);
    
    sceneConfig.dispose();
  });

  it('should look at the origin', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createRenderScene(canvas);
    const camera = createPerspectiveCamera('testCamera', sceneConfig.scene);

    expect(camera.target.x).toBe(0);
    expect(camera.target.y).toBe(0);
    expect(camera.target.z).toBe(0);
    
    sceneConfig.dispose();
  });

  it('should be a pure function returning new instances', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createRenderScene(canvas);
    
    const camera1 = createPerspectiveCamera('camera1', sceneConfig.scene);
    const camera2 = createPerspectiveCamera('camera2', sceneConfig.scene);

    expect(camera1).not.toBe(camera2);
    expect(camera1.name).not.toBe(camera2.name);
    
    sceneConfig.dispose();
  });

  it('should have proper near and far clipping planes', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createRenderScene(canvas);
    const camera = createPerspectiveCamera('testCamera', sceneConfig.scene);

    // Reasonable values for our room scene
    expect(camera.minZ).toBeGreaterThan(0);
    expect(camera.minZ).toBeLessThan(1);
    expect(camera.maxZ).toBeGreaterThan(50);
    
    sceneConfig.dispose();
  });
});