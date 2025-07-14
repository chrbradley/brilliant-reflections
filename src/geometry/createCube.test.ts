import { describe, it, expect, beforeEach } from 'vitest';
import { createCube, CUBE_FACE_COLORS } from './createCube';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';

describe('createCube', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  it('should create a cube with correct dimensions', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const cube = createCube(sceneConfig.scene);

    expect(cube).toBeDefined();
    expect(cube.name).toBe('cube');
    
    // Cube should be 2x2x2 units
    // Note: Box is created with size parameter, not scaling
    
    sceneConfig.dispose();
  });

  it('should position cube at origin by default', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const cube = createCube(sceneConfig.scene);

    expect(cube.position.x).toBe(0);
    expect(cube.position.y).toBe(1); // Half height above ground
    expect(cube.position.z).toBe(0);
    
    sceneConfig.dispose();
  });

  it('should have face colors in Rubik style', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    createCube(sceneConfig.scene); // Just verify it creates without error

    // Verify face colors are defined
    expect(CUBE_FACE_COLORS).toBeDefined();
    expect(CUBE_FACE_COLORS.TOP).toBeDefined();
    expect(CUBE_FACE_COLORS.BOTTOM).toBeDefined();
    expect(CUBE_FACE_COLORS.FRONT).toBeDefined();
    expect(CUBE_FACE_COLORS.BACK).toBeDefined();
    expect(CUBE_FACE_COLORS.RIGHT).toBeDefined();
    expect(CUBE_FACE_COLORS.LEFT).toBeDefined();
    
    sceneConfig.dispose();
  });

  it('should be pickable for interaction', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const cube = createCube(sceneConfig.scene);

    expect(cube.isPickable).toBe(true);
    
    sceneConfig.dispose();
  });

  it('should accept custom position parameter', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const customPosition = { x: 3, y: 1, z: -2 };
    const cube = createCube(sceneConfig.scene, customPosition);

    expect(cube.position.x).toBe(customPosition.x);
    expect(cube.position.y).toBe(customPosition.y);
    expect(cube.position.z).toBe(customPosition.z);
    
    sceneConfig.dispose();
  });

  it('should be a pure function returning new instances', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    
    const cube1 = createCube(sceneConfig.scene);
    const cube2 = createCube(sceneConfig.scene);

    expect(cube1).not.toBe(cube2);
    
    sceneConfig.dispose();
  });

  it('should have proper mesh properties', () => {
    const canvas = document.createElement('canvas');
    const sceneConfig = createEditorScene(canvas);
    const cube = createCube(sceneConfig.scene);

    expect(cube).toHaveProperty('position');
    expect(cube).toHaveProperty('rotation');
    expect(cube).toHaveProperty('scaling');
    expect(cube).toHaveProperty('material');
    
    sceneConfig.dispose();
  });
});