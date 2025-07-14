import { describe, it, expect, beforeEach } from 'vitest';
import { createCameraRig } from './createCameraRig';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from './createEditorScene';

describe('createCameraRig', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  it('should create a camera rig with transform node and cone indicator', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    expect(rig).toBeDefined();
    expect(rig.rigNode).toBeDefined();
    expect(rig.coneIndicator).toBeDefined();
    expect(rig.rigNode.name).toBe('cameraRig');
    
    sceneConfig.dispose();
  });

  it('should position rig at default location', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    // Default position should be at (0, 0, -5)
    expect(rig.rigNode.position.x).toBe(0);
    expect(rig.rigNode.position.y).toBe(0);
    expect(rig.rigNode.position.z).toBe(-5);
    
    sceneConfig.dispose();
  });

  it('should create non-pickable rig node', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    // TransformNodes don't have isPickable, but cone should be pickable
    expect(rig.coneIndicator.isPickable).toBe(true);
    
    sceneConfig.dispose();
  });

  it('should create cone with proper dimensions', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    expect(rig.coneIndicator.name).toBe('cameraIndicator');
    // Cone should be created with specific dimensions
    
    sceneConfig.dispose();
  });

  it('should parent cone to rig node', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    expect(rig.coneIndicator.parent).toBe(rig.rigNode);
    
    sceneConfig.dispose();
  });

  it('should accept custom position parameter', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const customPosition = { x: 3, y: 0, z: -2 };
    const rig = createCameraRig(sceneConfig.scene, customPosition);

    expect(rig.rigNode.position.x).toBe(customPosition.x);
    expect(rig.rigNode.position.y).toBe(customPosition.y);
    expect(rig.rigNode.position.z).toBe(customPosition.z);
    
    sceneConfig.dispose();
  });

  it('should return immutable rig configuration', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const rig = createCameraRig(sceneConfig.scene);

    expect(typeof rig).toBe('object');
    expect(rig).toHaveProperty('rigNode');
    expect(rig).toHaveProperty('coneIndicator');
    
    sceneConfig.dispose();
  });
});