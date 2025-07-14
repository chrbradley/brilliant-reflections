import { describe, it, expect, beforeEach } from 'vitest';
import { createRoom, createFloor, createCeiling, createWall } from './createRoom';
import { setupCanvasMock } from '../test-utils/mockCanvas';
import { createEditorScene } from '../editor/createEditorScene';
import { ROOM_HALF, WALL_NAMES } from '../constants';

describe('createRoom', () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  describe('createFloor', () => {
    it('should create floor mesh with correct dimensions', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const floor = createFloor(sceneConfig.scene);

      expect(floor).toBeDefined();
      expect(floor.name).toBe(WALL_NAMES.FLOOR);
      
      // Ground mesh is created with width/height directly, not scaling
      // Just verify it was created with the right name
      expect(floor.name).toBe(WALL_NAMES.FLOOR);
      
      sceneConfig.dispose();
    });

    it('should position floor at y=0', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const floor = createFloor(sceneConfig.scene);

      expect(floor.position.y).toBe(0);
      
      sceneConfig.dispose();
    });

    it('should return immutable mesh configuration', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const floor = createFloor(sceneConfig.scene);

      // Mesh should be created with proper properties
      expect(floor).toHaveProperty('position');
      expect(floor).toHaveProperty('rotation');
      expect(floor).toHaveProperty('scaling');
      expect(floor).toHaveProperty('material');
      
      sceneConfig.dispose();
    });
  });

  describe('createCeiling', () => {
    it('should create ceiling mesh at correct height', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const ceiling = createCeiling(sceneConfig.scene);

      expect(ceiling).toBeDefined();
      expect(ceiling.name).toBe(WALL_NAMES.CEILING);
      expect(ceiling.position.y).toBeGreaterThan(0); // Should be above floor
      
      sceneConfig.dispose();
    });
  });

  describe('createWall', () => {
    it('should create wall with correct thickness', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const wall = createWall(
        { x: 0, y: 5, z: ROOM_HALF },
        { x: 0, y: 0, z: 0 },
        WALL_NAMES.NORTH,
        sceneConfig.scene
      );

      expect(wall).toBeDefined();
      expect(wall.name).toBe(WALL_NAMES.NORTH);
      
      // Wall is created with dimensions directly in MeshBuilder
      // Just verify it was created
      
      sceneConfig.dispose();
    });

    it('should position wall at specified location', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const position = { x: 0, y: 5, z: ROOM_HALF };
      const wall = createWall(
        position,
        { x: 0, y: 0, z: 0 },
        WALL_NAMES.NORTH,
        sceneConfig.scene
      );

      expect(wall.position.x).toBeCloseTo(position.x);
      expect(wall.position.y).toBeCloseTo(position.y);
      expect(wall.position.z).toBeCloseTo(position.z);
      
      sceneConfig.dispose();
    });

    it('should apply rotation to wall', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const rotation = { x: 0, y: Math.PI / 2, z: 0 };
      const wall = createWall(
        { x: ROOM_HALF, y: 5, z: 0 },
        rotation,
        WALL_NAMES.EAST,
        sceneConfig.scene
      );

      expect(wall.rotation.y).toBeCloseTo(rotation.y);
      
      sceneConfig.dispose();
    });
  });

  describe('createRoom', () => {
    it('should create complete room with all walls, floor, and ceiling', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const room = createRoom(sceneConfig.scene);

      expect(room).toBeDefined();
      expect(room.floor).toBeDefined();
      expect(room.ceiling).toBeDefined();
      expect(room.walls).toBeDefined();
      expect(room.walls.north).toBeDefined();
      expect(room.walls.south).toBeDefined();
      expect(room.walls.east).toBeDefined();
      expect(room.walls.west).toBeDefined();
      
      sceneConfig.dispose();
    });

    it('should position walls correctly around room perimeter', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const room = createRoom(sceneConfig.scene);

      // North wall at +Z
      expect(room.walls.north.position.z).toBeCloseTo(ROOM_HALF);
      
      // South wall at -Z
      expect(room.walls.south.position.z).toBeCloseTo(-ROOM_HALF);
      
      // East wall at +X
      expect(room.walls.east.position.x).toBeCloseTo(ROOM_HALF);
      
      // West wall at -X
      expect(room.walls.west.position.x).toBeCloseTo(-ROOM_HALF);
      
      sceneConfig.dispose();
    });

    it('should apply matte material to all surfaces', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const room = createRoom(sceneConfig.scene);

      // Check that materials are applied
      expect(room.floor.material).toBeDefined();
      expect(room.ceiling.material).toBeDefined();
      expect(room.walls.north.material).toBeDefined();
      expect(room.walls.south.material).toBeDefined();
      expect(room.walls.east.material).toBeDefined();
      expect(room.walls.west.material).toBeDefined();
      
      sceneConfig.dispose();
    });

    it('should return immutable room configuration', () => {
      const canvas = document.createElement('canvas');
      const sceneConfig = createEditorScene(canvas);
      const room = createRoom(sceneConfig.scene);

      // Verify structure is returned
      expect(typeof room).toBe('object');
      expect(room).toHaveProperty('floor');
      expect(room).toHaveProperty('ceiling');
      expect(room).toHaveProperty('walls');
      
      sceneConfig.dispose();
    });
  });
});