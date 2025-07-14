import { describe, it, expect, beforeEach } from 'vitest';
import { createMatteMaterial } from './createMatteMaterial';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';

describe('createMatteMaterial', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  it('should create a standard material with given name', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const material = createMatteMaterial('testMaterial', sceneConfig.scene);

    expect(material).toBeDefined();
    expect(material.name).toBe('testMaterial');
    
    sceneConfig.dispose();
  });

  it('should have matte (non-reflective) properties', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const material = createMatteMaterial('matteMaterial', sceneConfig.scene);

    // Matte materials should have low or no specular reflection
    expect(material.specularColor.r).toBeLessThanOrEqual(0.1);
    expect(material.specularColor.g).toBeLessThanOrEqual(0.1);
    expect(material.specularColor.b).toBeLessThanOrEqual(0.1);
    
    sceneConfig.dispose();
  });

  it('should have a neutral gray diffuse color by default', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const material = createMatteMaterial('grayMaterial', sceneConfig.scene);

    // Should be a neutral gray
    expect(material.diffuseColor.r).toBeGreaterThan(0);
    expect(material.diffuseColor.r).toBeLessThan(1);
    expect(material.diffuseColor.r).toBeCloseTo(material.diffuseColor.g);
    expect(material.diffuseColor.g).toBeCloseTo(material.diffuseColor.b);
    
    sceneConfig.dispose();
  });

  it('should support custom color parameter', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const customColor = { r: 0.8, g: 0.2, b: 0.2 };
    const material = createMatteMaterial('redMaterial', sceneConfig.scene, customColor);

    expect(material.diffuseColor.r).toBeCloseTo(customColor.r);
    expect(material.diffuseColor.g).toBeCloseTo(customColor.g);
    expect(material.diffuseColor.b).toBeCloseTo(customColor.b);
    
    sceneConfig.dispose();
  });

  it('should be a pure function returning new instances', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    
    const material1 = createMatteMaterial('mat1', sceneConfig.scene);
    const material2 = createMatteMaterial('mat2', sceneConfig.scene);

    expect(material1).not.toBe(material2);
    expect(material1.name).not.toBe(material2.name);
    
    sceneConfig.dispose();
  });
});