import { describe, it, expect } from 'vitest';
import {
  createInitialTransformState,
  updateObjectPosition,
  updateObjectRotation,
  getObjectTransform,
  clearTransforms,
  type TransformState,
} from './transformState';
import { Vector3 } from 'babylonjs';

describe('transformState', () => {
  describe('createInitialTransformState', () => {
    it('should create empty transform state', () => {
      const state = createInitialTransformState();

      expect(state).toBeDefined();
      expect(state.transforms).toBeDefined();
      expect(Object.keys(state.transforms).length).toBe(0);
    });

    it('should return immutable state', () => {
      const state1 = createInitialTransformState();
      const state2 = createInitialTransformState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('updateObjectPosition', () => {
    it('should add new object transform', () => {
      const state = createInitialTransformState();
      const position = new Vector3(5, 0, -3);

      const newState = updateObjectPosition(state, 'cube1', position);

      expect(newState.transforms['cube1']).toBeDefined();
      expect(newState.transforms['cube1'].position.equals(position)).toBe(true);
    });

    it('should update existing object position', () => {
      let state = createInitialTransformState();
      const pos1 = new Vector3(1, 0, 1);
      const pos2 = new Vector3(5, 0, -3);

      state = updateObjectPosition(state, 'cube1', pos1);
      const newState = updateObjectPosition(state, 'cube1', pos2);

      expect(newState.transforms['cube1'].position.equals(pos2)).toBe(true);
    });

    it('should preserve rotation when updating position', () => {
      let state = createInitialTransformState();
      const position = new Vector3(1, 0, 1);
      const rotation = new Vector3(0, Math.PI / 4, 0);

      state = updateObjectPosition(state, 'cube1', position);
      state = updateObjectRotation(state, 'cube1', rotation);

      const newState = updateObjectPosition(
        state,
        'cube1',
        new Vector3(2, 0, 2)
      );

      expect(newState.transforms['cube1'].rotation.equals(rotation)).toBe(true);
    });

    it('should not mutate original state', () => {
      const state = createInitialTransformState();
      const position = new Vector3(5, 0, -3);
      const originalKeys = Object.keys(state.transforms).length;

      updateObjectPosition(state, 'cube1', position);

      expect(Object.keys(state.transforms).length).toBe(originalKeys);
    });

    it('should create new vector instances', () => {
      const state = createInitialTransformState();
      const position = new Vector3(5, 0, -3);

      const newState = updateObjectPosition(state, 'cube1', position);

      expect(newState.transforms['cube1'].position).not.toBe(position);
      position.x = 999; // Mutate original
      expect(newState.transforms['cube1'].position.x).toBe(5);
    });
  });

  describe('updateObjectRotation', () => {
    it('should add new object with rotation', () => {
      const state = createInitialTransformState();
      const rotation = new Vector3(0, Math.PI / 2, 0);

      const newState = updateObjectRotation(state, 'cube1', rotation);

      expect(newState.transforms['cube1']).toBeDefined();
      expect(newState.transforms['cube1'].rotation.equals(rotation)).toBe(true);
    });

    it('should update existing object rotation', () => {
      let state = createInitialTransformState();
      const rot1 = new Vector3(0, 0, 0);
      const rot2 = new Vector3(0, Math.PI / 2, 0);

      state = updateObjectRotation(state, 'cube1', rot1);
      const newState = updateObjectRotation(state, 'cube1', rot2);

      expect(newState.transforms['cube1'].rotation.equals(rot2)).toBe(true);
    });

    it('should initialize position to zero if not set', () => {
      const state = createInitialTransformState();
      const rotation = new Vector3(0, Math.PI / 4, 0);

      const newState = updateObjectRotation(state, 'cube1', rotation);

      expect(newState.transforms['cube1'].position.equals(Vector3.Zero())).toBe(
        true
      );
    });

    it('should create new vector instances', () => {
      const state = createInitialTransformState();
      const rotation = new Vector3(0, Math.PI, 0);

      const newState = updateObjectRotation(state, 'cube1', rotation);

      expect(newState.transforms['cube1'].rotation).not.toBe(rotation);
    });
  });

  describe('getObjectTransform', () => {
    it('should return transform for existing object', () => {
      let state = createInitialTransformState();
      const position = new Vector3(3, 0, 4);
      const rotation = new Vector3(0, Math.PI / 6, 0);

      state = updateObjectPosition(state, 'cube1', position);
      state = updateObjectRotation(state, 'cube1', rotation);

      const transform = getObjectTransform(state, 'cube1');

      expect(transform).toBeDefined();
      expect(transform?.position.equals(position)).toBe(true);
      expect(transform?.rotation.equals(rotation)).toBe(true);
    });

    it('should return null for non-existent object', () => {
      const state = createInitialTransformState();

      const transform = getObjectTransform(state, 'nonExistent');

      expect(transform).toBeNull();
    });

    it('should return cloned vectors', () => {
      let state = createInitialTransformState();
      const position = new Vector3(1, 2, 3);

      state = updateObjectPosition(state, 'cube1', position);
      const transform = getObjectTransform(state, 'cube1');

      if (transform) {
        transform.position.x = 999; // Try to mutate
        const transform2 = getObjectTransform(state, 'cube1');
        expect(transform2?.position.x).toBe(1); // Original unchanged
      }
    });
  });

  describe('clearTransforms', () => {
    it('should remove all transforms', () => {
      let state = createInitialTransformState();

      state = updateObjectPosition(state, 'cube1', new Vector3(1, 0, 1));
      state = updateObjectPosition(state, 'cube2', new Vector3(2, 0, 2));
      state = updateObjectPosition(state, 'cube3', new Vector3(3, 0, 3));

      const clearedState = clearTransforms(state);

      expect(Object.keys(clearedState.transforms).length).toBe(0);
    });

    it('should not mutate original state', () => {
      let state = createInitialTransformState();
      state = updateObjectPosition(state, 'cube1', new Vector3(1, 0, 1));
      const originalCount = Object.keys(state.transforms).length;

      clearTransforms(state);

      expect(Object.keys(state.transforms).length).toBe(originalCount);
    });

    it('should return new state instance', () => {
      const state = createInitialTransformState();
      const clearedState = clearTransforms(state);

      expect(clearedState).not.toBe(state);
    });
  });

  describe('state immutability', () => {
    it('should maintain immutability through operations', () => {
      const state1 = createInitialTransformState();
      const state2 = updateObjectPosition(state1, 'obj1', Vector3.Zero());
      const state3 = updateObjectRotation(state2, 'obj1', Vector3.Zero());
      const state4 = clearTransforms(state3);

      expect(state1).not.toBe(state2);
      expect(state2).not.toBe(state3);
      expect(state3).not.toBe(state4);
    });

    it('should freeze state objects in development', () => {
      const state = createInitialTransformState();

      if (process.env.NODE_ENV === 'development') {
        expect(() => {
          (state as any).transforms = {};
        }).toThrow();
      }
    });
  });
});
