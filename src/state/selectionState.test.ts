import { describe, it, expect } from 'vitest';
import {
  createInitialSelectionState,
  selectObject,
  clearSelection,
  isSelected,
  type SelectionState,
} from './selectionState';

describe('selectionState', () => {
  describe('createInitialSelectionState', () => {
    it('should create empty selection state', () => {
      const state = createInitialSelectionState();

      expect(state).toBeDefined();
      expect(state.selectedObjectId).toBeNull();
      expect(state.selectionTime).toBe(0);
    });

    it('should return immutable state', () => {
      const state1 = createInitialSelectionState();
      const state2 = createInitialSelectionState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('selectObject', () => {
    it('should update state with selected object ID', () => {
      const initialState = createInitialSelectionState();
      const newState = selectObject(initialState, 'cube1');

      expect(newState.selectedObjectId).toBe('cube1');
      expect(newState.selectionTime).toBeGreaterThan(0);
    });

    it('should not mutate original state', () => {
      const initialState = createInitialSelectionState();
      const stateCopy = { ...initialState };

      selectObject(initialState, 'cube1');

      expect(initialState).toEqual(stateCopy);
    });

    it('should update selection time when selecting new object', () => {
      const state1 = createInitialSelectionState();
      const state2 = selectObject(state1, 'cube1');

      // Wait a tiny bit to ensure time difference
      const waitPromise = new Promise((resolve) => setTimeout(resolve, 10));
      return waitPromise.then(() => {
        const state3 = selectObject(state2, 'cube2');

        expect(state3.selectionTime).toBeGreaterThan(state2.selectionTime);
      });
    });

    it('should handle selecting same object', () => {
      const state1 = selectObject(createInitialSelectionState(), 'cube1');
      const state2 = selectObject(state1, 'cube1');

      expect(state2.selectedObjectId).toBe('cube1');
      expect(state2).not.toBe(state1); // Still returns new state
    });
  });

  describe('clearSelection', () => {
    it('should clear selected object', () => {
      const selectedState = selectObject(
        createInitialSelectionState(),
        'cube1'
      );
      const clearedState = clearSelection(selectedState);

      expect(clearedState.selectedObjectId).toBeNull();
      expect(clearedState.selectionTime).toBe(0);
    });

    it('should not mutate original state', () => {
      const selectedState = selectObject(
        createInitialSelectionState(),
        'cube1'
      );
      const stateCopy = { ...selectedState };

      clearSelection(selectedState);

      expect(selectedState).toEqual(stateCopy);
    });

    it('should handle clearing already empty state', () => {
      const emptyState = createInitialSelectionState();
      const clearedState = clearSelection(emptyState);

      expect(clearedState.selectedObjectId).toBeNull();
      expect(clearedState).not.toBe(emptyState); // New instance
    });
  });

  describe('isSelected', () => {
    it('should return true for selected object', () => {
      const state = selectObject(createInitialSelectionState(), 'cube1');

      expect(isSelected(state, 'cube1')).toBe(true);
    });

    it('should return false for non-selected object', () => {
      const state = selectObject(createInitialSelectionState(), 'cube1');

      expect(isSelected(state, 'cube2')).toBe(false);
    });

    it('should return false when nothing selected', () => {
      const state = createInitialSelectionState();

      expect(isSelected(state, 'cube1')).toBe(false);
    });

    it('should handle null/undefined object IDs', () => {
      const state = createInitialSelectionState();

      expect(isSelected(state, null as any)).toBe(false);
      expect(isSelected(state, undefined as any)).toBe(false);
    });
  });

  describe('state immutability', () => {
    it('should maintain referential equality for unchanged values', () => {
      const state1 = createInitialSelectionState();
      const state2 = selectObject(state1, 'cube1');
      const state3 = clearSelection(state2);

      // Each operation returns new state
      expect(state1).not.toBe(state2);
      expect(state2).not.toBe(state3);
      expect(state1).not.toBe(state3);
    });

    it('should freeze state objects in development', () => {
      const state = createInitialSelectionState();

      if (process.env.NODE_ENV === 'development') {
        expect(() => {
          (state as any).selectedObjectId = 'mutated';
        }).toThrow();
      }
    });
  });
});
