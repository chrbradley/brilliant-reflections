// ABOUTME: Type definitions for scene configuration and state management
// ABOUTME: Defines interfaces for functional scene handling

import type { Engine, Scene } from 'babylonjs';

/**
 * Configuration for a Babylon.js scene with disposal capability
 */
export interface SceneConfig {
  readonly engine: Engine;
  readonly scene: Scene;
  readonly dispose: () => void;
}

/**
 * Immutable state representation of a scene
 */
export interface SceneState {
  readonly isInitialized: boolean;
  readonly canvasId: string;
  readonly width: number;
  readonly height: number;
  readonly renderMode: 'editor' | 'render';
}
