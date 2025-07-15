import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RenderPassManager } from './RenderPassManager';

describe('RenderPassManager', () => {
  let mockScene: any;
  let mockMirrorTexture1: any;
  let mockMirrorTexture2: any;
  let mockWall1: any;
  let mockWall2: any;
  let mockCube: any;

  beforeEach(() => {
    // Create mock mirror textures
    mockMirrorTexture1 = {
      renderList: [],
      render: vi.fn(),
      constructor: { name: 'MirrorTexture' },
    };
    
    mockMirrorTexture2 = {
      renderList: [],
      render: vi.fn(),
      constructor: { name: 'MirrorTexture' },
    };

    // Create mock materials
    const mockMaterial1 = {
      reflectionTexture: mockMirrorTexture1,
      constructor: { name: 'StandardMaterial' },
    };
    
    const mockMaterial2 = {
      reflectionTexture: mockMirrorTexture2,
      constructor: { name: 'StandardMaterial' },
    };

    // Create mock meshes
    mockWall1 = {
      name: 'northWall',
      material: mockMaterial1,
      isVisible: true,
      isEnabled: () => true,
    };
    
    mockWall2 = {
      name: 'eastWall',
      material: mockMaterial2,
      isVisible: true,
      isEnabled: () => true,
    };
    
    mockCube = {
      name: 'colorCube',
      isVisible: true,
      isEnabled: () => true,
    };

    // Create mock scene
    mockScene = {
      getMeshByName: vi.fn((name: string) => {
        if (name === 'northWall') return mockWall1;
        if (name === 'eastWall') return mockWall2;
        return null;
      }),
      meshes: [mockWall1, mockWall2, mockCube],
    };
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      const config = {
        scene: mockScene,
        maxBounces: 2,
        mirrorWalls: ['northWall', 'eastWall'],
      };

      const manager = new RenderPassManager(config);

      expect(manager.getBounceCount()).toBe(2);
    });

    it('should collect mirror textures from scene', () => {
      const config = {
        scene: mockScene,
        maxBounces: 2,
        mirrorWalls: ['northWall', 'eastWall'],
      };

      new RenderPassManager(config);

      expect(mockScene.getMeshByName).toHaveBeenCalledWith('northWall');
      expect(mockScene.getMeshByName).toHaveBeenCalledWith('eastWall');
    });
  });

  describe('executeRenderPasses', () => {
    it('should execute passes based on bounce count', () => {
      const config = {
        scene: mockScene,
        maxBounces: 2,
        mirrorWalls: ['northWall', 'eastWall'],
      };

      const manager = new RenderPassManager(config);
      manager.executeRenderPasses();

      // Should render each mirror texture for each pass
      expect(mockMirrorTexture1.render).toHaveBeenCalledTimes(2);
      expect(mockMirrorTexture2.render).toHaveBeenCalledTimes(2);
    });

    it('should not execute if maxBounces is 0', () => {
      const config = {
        scene: mockScene,
        maxBounces: 0,
        mirrorWalls: ['northWall', 'eastWall'],
      };

      const manager = new RenderPassManager(config);
      manager.executeRenderPasses();

      expect(mockMirrorTexture1.render).not.toHaveBeenCalled();
      expect(mockMirrorTexture2.render).not.toHaveBeenCalled();
    });

    it('should exclude mirror from its own render list in first pass', () => {
      const config = {
        scene: mockScene,
        maxBounces: 1,
        mirrorWalls: ['northWall', 'eastWall'],
      };

      const manager = new RenderPassManager(config);
      manager.executeRenderPasses();

      // North wall's mirror should not include itself
      expect(mockMirrorTexture1.renderList).not.toContain(mockWall1);
      // But should include the cube
      expect(mockMirrorTexture1.renderList).toContain(mockCube);
    });

    it('should include other mirrors in subsequent passes', () => {
      const config = {
        scene: mockScene,
        maxBounces: 2,
        mirrorWalls: ['northWall', 'eastWall'],
      };

      const manager = new RenderPassManager(config);
      manager.executeRenderPasses();

      // After second pass, mirrors should see each other
      expect(mockMirrorTexture1.renderList).toContain(mockWall2);
      expect(mockMirrorTexture2.renderList).toContain(mockWall1);
    });
  });

  describe('setBounceCount', () => {
    it('should update bounce count and re-execute passes', () => {
      const config = {
        scene: mockScene,
        maxBounces: 1,
        mirrorWalls: ['northWall', 'eastWall'],
      };

      const manager = new RenderPassManager(config);
      
      // Clear previous calls
      mockMirrorTexture1.render.mockClear();
      mockMirrorTexture2.render.mockClear();

      manager.setBounceCount(3);

      expect(manager.getBounceCount()).toBe(3);
      // Should execute 3 passes
      expect(mockMirrorTexture1.render).toHaveBeenCalledTimes(3);
    });

    it('should clamp bounce count between 1 and 5', () => {
      const config = {
        scene: mockScene,
        maxBounces: 2,
        mirrorWalls: ['northWall'],
      };

      const manager = new RenderPassManager(config);

      manager.setBounceCount(0);
      expect(manager.getBounceCount()).toBe(1);

      manager.setBounceCount(10);
      expect(manager.getBounceCount()).toBe(5);
    });
  });

  describe('reset', () => {
    it('should restore original render lists', () => {
      const originalList = [mockCube];
      mockMirrorTexture1.renderList = [...originalList];

      const config = {
        scene: mockScene,
        maxBounces: 2,
        mirrorWalls: ['northWall'],
      };

      const manager = new RenderPassManager(config);
      
      // Execute passes (which modifies render lists)
      manager.executeRenderPasses();
      
      // Reset
      manager.reset();

      expect(mockMirrorTexture1.renderList).toEqual(originalList);
    });
  });

  describe('dispose', () => {
    it('should clear internal maps', () => {
      const config = {
        scene: mockScene,
        maxBounces: 2,
        mirrorWalls: ['northWall', 'eastWall'],
      };

      const manager = new RenderPassManager(config);
      manager.dispose();

      // After dispose, operations should not throw
      expect(() => manager.reset()).not.toThrow();
    });
  });
});