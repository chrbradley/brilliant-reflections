import { describe, it, expect } from 'vitest';
import { createMirrorChain, linkMirrors, getChainLevel } from './chainMirrors';
import { MirrorTexture } from 'babylonjs';

describe('chainMirrors', () => {
  describe('getChainLevel', () => {
    it('should return 0 for unchained mirror', () => {
      const mirror = { renderList: [] } as any as MirrorTexture;
      
      const level = getChainLevel(mirror);
      
      expect(level).toBe(0);
    });

    it('should return 1 for mirror with one child', () => {
      const child = { renderList: [] } as any as MirrorTexture;
      const parent = { renderList: [child] } as any as MirrorTexture;
      
      const level = getChainLevel(parent);
      
      expect(level).toBe(1);
    });

    it('should return 2 for mirror with nested chain', () => {
      const grandchild = { renderList: [] } as any as MirrorTexture;
      const child = { renderList: [grandchild] } as any as MirrorTexture;
      const parent = { renderList: [child] } as any as MirrorTexture;
      
      const level = getChainLevel(parent);
      
      expect(level).toBe(2);
    });

    it('should cap at 4 levels maximum', () => {
      // Create deep chain
      let current = { renderList: [] } as any as MirrorTexture;
      for (let i = 0; i < 10; i++) {
        current = { renderList: [current] } as any as MirrorTexture;
      }
      
      const level = getChainLevel(current);
      
      expect(level).toBe(4);
    });
  });

  describe('linkMirrors', () => {
    it('should add child to parent render list', () => {
      const parent = { renderList: [] } as any as MirrorTexture;
      const child = {} as any as MirrorTexture;
      
      const result = linkMirrors(parent, child);
      
      expect(result.renderList).toContain(child);
    });

    it('should not exceed maximum chain level', () => {
      // Create chain at max level
      let current = { renderList: [] } as any as MirrorTexture;
      for (let i = 0; i < 4; i++) {
        current = { renderList: [current] } as any as MirrorTexture;
      }
      
      const newChild = {} as any as MirrorTexture;
      const result = linkMirrors(current, newChild);
      
      // Should not add child when at max level
      expect(result.renderList).not.toContain(newChild);
    });

    it('should preserve existing render list items', () => {
      const existingItem = {} as any;
      const parent = { renderList: [existingItem] } as any as MirrorTexture;
      const child = {} as any as MirrorTexture;
      
      const result = linkMirrors(parent, child);
      
      expect(result.renderList).toContain(existingItem);
      expect(result.renderList).toContain(child);
    });
  });

  describe('createMirrorChain', () => {
    it('should create chain configuration for level 0', () => {
      const config = createMirrorChain(0);
      
      expect(config.level).toBe(0);
      expect(config.maxLevel).toBe(4);
      expect(config.enabled).toBe(true);
    });

    it('should create chain configuration for level 2', () => {
      const config = createMirrorChain(2);
      
      expect(config.level).toBe(2);
      expect(config.maxLevel).toBe(4);
      expect(config.enabled).toBe(true);
    });

    it('should cap level at maximum', () => {
      const config = createMirrorChain(10);
      
      expect(config.level).toBe(4);
      expect(config.maxLevel).toBe(4);
      expect(config.enabled).toBe(true);
    });

    it('should disable chain when level is negative', () => {
      const config = createMirrorChain(-1);
      
      expect(config.level).toBe(0);
      expect(config.enabled).toBe(false);
    });
  });
});