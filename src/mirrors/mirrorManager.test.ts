import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMirrorState,
  updateMirrorLevel,
  getMirrorLevel,
  isMirrorEnabled,
  applyMirrorState,
} from './mirrorManager';

describe('mirrorManager', () => {
  describe('createMirrorState', () => {
    it('should create initial state with level 1', () => {
      const state = createMirrorState();
      
      expect(state.currentLevel).toBe(1);
      expect(state.enabled).toBe(true);
      expect(state.maxLevel).toBe(4);
    });
  });

  describe('updateMirrorLevel', () => {
    it('should update level within valid range', () => {
      const state = createMirrorState();
      
      const newState = updateMirrorLevel(state, 3);
      
      expect(newState.currentLevel).toBe(3);
      expect(newState.enabled).toBe(true);
      expect(newState).not.toBe(state); // Immutable
    });

    it('should clamp level to maximum', () => {
      const state = createMirrorState();
      
      const newState = updateMirrorLevel(state, 10);
      
      expect(newState.currentLevel).toBe(4);
    });

    it('should clamp level to minimum', () => {
      const state = createMirrorState();
      
      const newState = updateMirrorLevel(state, -5);
      
      expect(newState.currentLevel).toBe(0);
    });

    it('should disable mirrors when level is 0', () => {
      const state = createMirrorState();
      
      const newState = updateMirrorLevel(state, 0);
      
      expect(newState.currentLevel).toBe(0);
      expect(newState.enabled).toBe(false);
    });

    it('should enable mirrors when level is greater than 0', () => {
      const state = { ...createMirrorState(), currentLevel: 0, enabled: false };
      
      const newState = updateMirrorLevel(state, 2);
      
      expect(newState.currentLevel).toBe(2);
      expect(newState.enabled).toBe(true);
    });
  });

  describe('getMirrorLevel', () => {
    it('should return current level from state', () => {
      const state = { ...createMirrorState(), currentLevel: 3 };
      
      const level = getMirrorLevel(state);
      
      expect(level).toBe(3);
    });
  });

  describe('isMirrorEnabled', () => {
    it('should return true when enabled', () => {
      const state = createMirrorState();
      
      const enabled = isMirrorEnabled(state);
      
      expect(enabled).toBe(true);
    });

    it('should return false when disabled', () => {
      const state = { ...createMirrorState(), enabled: false };
      
      const enabled = isMirrorEnabled(state);
      
      expect(enabled).toBe(false);
    });
  });

  describe('applyMirrorState', () => {
    it('should create effect description for state change', () => {
      const state = { ...createMirrorState(), currentLevel: 2 };
      const mirrors = [
        { name: 'mirror1' },
        { name: 'mirror2' },
      ];
      
      const effect = applyMirrorState(state, mirrors as any);
      
      expect(effect.type).toBe('UPDATE_MIRRORS');
      expect(effect.level).toBe(2);
      expect(effect.mirrors).toBe(mirrors);
      expect(effect.enabled).toBe(true);
    });

    it('should include disabled state in effect', () => {
      const state = { ...createMirrorState(), currentLevel: 0, enabled: false };
      const mirrors = [];
      
      const effect = applyMirrorState(state, mirrors);
      
      expect(effect.type).toBe('UPDATE_MIRRORS');
      expect(effect.level).toBe(0);
      expect(effect.enabled).toBe(false);
    });
  });
});