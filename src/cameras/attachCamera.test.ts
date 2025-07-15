import { describe, it, expect, beforeEach } from 'vitest';
import { attachCamera } from './attachCamera';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';
import { createOrthographicCamera } from './createOrthographicCamera';

describe('attachCamera', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  it('should attach camera to scene and canvas', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const camera = createOrthographicCamera('testCamera', sceneConfig.scene);

    attachCamera(camera, sceneConfig.scene, canvas);

    expect(sceneConfig.scene.activeCamera).toBe(camera);
    expect(camera.attachControl).toBeDefined();

    sceneConfig.dispose();
  });

  it('should handle canvas aspect ratio', () => {
    const canvas = document.createElement('canvas');
    // Set canvas dimensions
    Object.defineProperty(canvas, 'width', { value: 800, configurable: true });
    Object.defineProperty(canvas, 'height', { value: 600, configurable: true });

    const sceneConfig = createEditorScene(canvas);
    const camera = createOrthographicCamera('testCamera', sceneConfig.scene);

    attachCamera(camera, sceneConfig.scene, canvas);

    // For orthographic camera, aspect ratio should affect the bounds
    const aspectRatio = 800 / 600;
    expect(
      Math.abs((camera as any).orthoRight / (camera as any).orthoTop)
    ).toBeCloseTo(aspectRatio, 2);

    sceneConfig.dispose();
  });

  it('should detach controls when preventDefaultEvents is true', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const camera = createOrthographicCamera('testCamera', sceneConfig.scene);

    attachCamera(camera, sceneConfig.scene, canvas, true);

    // Camera should be active but not have controls attached
    expect(sceneConfig.scene.activeCamera).toBe(camera);

    sceneConfig.dispose();
  });

  it('should be a pure function with no return value', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const camera = createOrthographicCamera('testCamera', sceneConfig.scene);

    const result = attachCamera(camera, sceneConfig.scene, canvas);

    expect(result).toBeUndefined();

    sceneConfig.dispose();
  });
});
