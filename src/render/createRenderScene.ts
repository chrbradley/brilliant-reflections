// ABOUTME: Pure function to create and configure the render scene with Babylon.js
// ABOUTME: Returns immutable scene configuration with disposal capability

import { Engine, Scene, Color4 } from 'babylonjs';
import type { SceneConfig } from '../types';

/**
 * Creates an engine instance for the given canvas
 */
const createEngine = (canvas: HTMLCanvasElement): Engine => {
  if (!canvas) {
    throw new Error('Canvas element is required to create engine');
  }

  return new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    doNotHandleContextLost: true,
  });
};

/**
 * Creates a scene instance with the given engine
 */
const createScene = (engine: Engine): Scene => {
  const scene = new Scene(engine);

  // Set background color for render view (slightly different from editor)
  scene.clearColor = new Color4(0.05, 0.05, 0.05, 1.0);

  return scene;
};

/**
 * Creates a disposal function that cleans up all resources
 */
const createDisposer = (engine: Engine, scene: Scene): (() => void) => {
  return (): void => {
    scene.dispose();
    engine.dispose();
  };
};

/**
 * Creates and configures a render scene with Babylon.js
 *
 * @param canvas - The HTML canvas element to render to
 * @returns Immutable scene configuration with engine, scene, and dispose function
 */
export const createRenderScene = (canvas: HTMLCanvasElement): SceneConfig => {
  const engine = createEngine(canvas);
  const scene = createScene(engine);
  const dispose = createDisposer(engine, scene);

  // Return immutable configuration
  return Object.freeze({
    engine,
    scene,
    dispose,
  });
};
