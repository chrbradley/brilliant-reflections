import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createEmissiveMaterial } from './createEmissiveMaterial';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';
import { Color3 } from 'babylonjs';
import type { SceneConfig } from '../types';

describe('createEmissiveMaterial', () => {
  let sceneConfig: SceneConfig;

  beforeEach(() => {
    setupCanvasMock();
    const canvas = document.createElement('canvas');
    sceneConfig = createEditorScene(canvas);
  });

  it('should create a material with emissive properties', () => {
    const material = createEmissiveMaterial('testEmissive', sceneConfig.scene);

    expect(material).toBeDefined();
    expect(material.name).toBe('testEmissive');
    expect(material.emissiveColor.equals(new Color3(1, 1, 1))).toBe(true);
    expect(material.diffuseColor.equals(new Color3(1, 1, 1))).toBe(true);
  });

  it('should disable lighting for full brightness', () => {
    const material = createEmissiveMaterial('testEmissive', sceneConfig.scene);

    expect(material.disableLighting).toBe(true);
  });

  it('should accept custom emissive color', () => {
    const customColor = new Color3(0.5, 0.7, 0.9);
    const material = createEmissiveMaterial(
      'testEmissive',
      sceneConfig.scene,
      customColor
    );

    expect(material.emissiveColor.equals(customColor)).toBe(true);
    expect(material.diffuseColor.equals(customColor)).toBe(true);
  });

  afterEach(() => {
    sceneConfig.dispose();
  });
});