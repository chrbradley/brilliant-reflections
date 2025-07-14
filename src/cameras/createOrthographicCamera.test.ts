import { describe, it, expect, beforeEach } from 'vitest';
import { createOrthographicCamera } from './createOrthographicCamera';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';

describe('createOrthographicCamera', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  it('should create an orthographic camera with correct configuration', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const camera = createOrthographicCamera('testCamera', sceneConfig.scene);

    expect(camera).toBeDefined();
    expect(camera.name).toBe('testCamera');
    expect(camera.mode).toBe(BABYLON.Camera.ORTHOGRAPHIC_CAMERA);
  });

  it('should position camera at (0, 20, 0) looking at origin', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const camera = createOrthographicCamera('testCamera', sceneConfig.scene);

    expect(camera.position.x).toBeCloseTo(0);
    expect(camera.position.y).toBeCloseTo(20);
    expect(camera.position.z).toBeCloseTo(0);
    
    expect(camera.target.x).toBeCloseTo(0);
    expect(camera.target.y).toBeCloseTo(0);
    expect(camera.target.z).toBeCloseTo(0);
    
    sceneConfig.dispose();
  });

  it('should configure projection to show 20x20 unit area', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const camera = createOrthographicCamera('testCamera', sceneConfig.scene);

    // Check orthographic bounds
    expect(camera.orthoLeft).toBe(-10);
    expect(camera.orthoRight).toBe(10);
    expect(camera.orthoTop).toBe(10);
    expect(camera.orthoBottom).toBe(-10);
    
    sceneConfig.dispose();
  });

  it('should flip X axis so +X points right in view', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const camera = createOrthographicCamera('testCamera', sceneConfig.scene);

    // When looking down -Y axis, we need to verify X axis orientation
    // The up vector should be along +Z to achieve the correct orientation
    expect(camera.upVector.x).toBeCloseTo(0);
    expect(camera.upVector.y).toBeCloseTo(0);
    expect(camera.upVector.z).toBeCloseTo(1);
    
    sceneConfig.dispose();
  });

  it('should be a pure function returning new instances', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    
    const camera1 = createOrthographicCamera('camera1', sceneConfig.scene);
    const camera2 = createOrthographicCamera('camera2', sceneConfig.scene);

    expect(camera1).not.toBe(camera2);
    expect(camera1.name).not.toBe(camera2.name);
    
    sceneConfig.dispose();
  });

  it('should return camera configuration object', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const camera = createOrthographicCamera('testCamera', sceneConfig.scene);

    // Verify it's a Babylon.js UniversalCamera (check for camera properties instead of constructor name due to minification)
    expect(camera).toHaveProperty('position');
    expect(camera).toHaveProperty('rotation');
    expect(camera).toHaveProperty('fov');
    expect(camera).toHaveProperty('mode');
    
    sceneConfig.dispose();
  });
});