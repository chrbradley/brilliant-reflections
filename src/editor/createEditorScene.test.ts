import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createEditorScene } from './createEditorScene';
import type { SceneConfig } from '../types';
import { setupCanvasMock } from '../test-utils/mockCanvas';

describe('createEditorScene', () => {
  let canvas: HTMLCanvasElement;
  let sceneConfig: SceneConfig | null;

  beforeEach(() => {
    // Setup WebGL mock
    setupCanvasMock();
    
    // Create a test canvas
    canvas = document.createElement('canvas');
    canvas.id = 'test-editor-canvas';
    document.body.appendChild(canvas);
  });

  afterEach(() => {
    // Clean up
    if (sceneConfig) {
      sceneConfig.dispose();
      sceneConfig = null;
    }
    document.body.removeChild(canvas);
  });

  it('should create a scene configuration with engine and scene', () => {
    sceneConfig = createEditorScene(canvas);
    
    expect(sceneConfig).toBeDefined();
    expect(sceneConfig.engine).toBeDefined();
    expect(sceneConfig.scene).toBeDefined();
    expect(sceneConfig.dispose).toBeDefined();
    expect(typeof sceneConfig.dispose).toBe('function');
  });

  it('should bind the engine to the provided canvas', () => {
    sceneConfig = createEditorScene(canvas);
    
    const engineCanvas = sceneConfig.engine.getRenderingCanvas();
    expect(engineCanvas).toBe(canvas);
  });

  it('should dispose of resources when dispose is called', () => {
    sceneConfig = createEditorScene(canvas);
    const engine = sceneConfig.engine;
    const scene = sceneConfig.scene;
    
    // Spy on dispose methods
    const engineDisposeSpy = vi.spyOn(engine, 'dispose');
    const sceneDisposeSpy = vi.spyOn(scene, 'dispose');
    
    sceneConfig.dispose();
    
    expect(engineDisposeSpy).toHaveBeenCalled();
    expect(sceneDisposeSpy).toHaveBeenCalled();
  });

  it('should throw an error if canvas is null', () => {
    expect(() => createEditorScene(null as any)).toThrow();
  });

  it('should return immutable configuration', () => {
    sceneConfig = createEditorScene(canvas);
    const originalEngine = sceneConfig.engine;
    const originalScene = sceneConfig.scene;
    
    // Attempt to modify (TypeScript will prevent this at compile time)
    // This test verifies runtime immutability
    expect(() => {
      (sceneConfig as any).engine = null;
    }).toThrow();
    
    expect(sceneConfig.engine).toBe(originalEngine);
    expect(sceneConfig.scene).toBe(originalScene);
  });

  it('should be a pure function returning new instances', () => {
    const config1 = createEditorScene(canvas);
    const config2 = createEditorScene(canvas);
    
    expect(config1).not.toBe(config2);
    expect(config1.engine).not.toBe(config2.engine);
    expect(config1.scene).not.toBe(config2.scene);
    
    // Clean up both
    config1.dispose();
    config2.dispose();
  });
});