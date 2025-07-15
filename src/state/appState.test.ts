import { describe, it, expect } from 'vitest';
import {
  createInitialAppState,
  updateAppState,
  selectSelectionState,
  selectTransformState,
  selectUIState,
  selectSelectedObjectTransform,
  selectRayConfiguration,
  type AppState,
  type AppStateAction,
} from './appState';
import { Vector3 } from 'babylonjs';

describe('appState', () => {
  describe('createInitialAppState', () => {
    it('should create initial app state with all substates', () => {
      const state = createInitialAppState();

      expect(state).toBeDefined();
      expect(state.selection).toBeDefined();
      expect(state.transform).toBeDefined();
      expect(state.ui).toBeDefined();
    });

    it('should have no selection initially', () => {
      const state = createInitialAppState();

      expect(state.selection.selectedObjectId).toBeNull();
      expect(state.selection.previousObjectId).toBeNull();
      expect(state.selection.selectionTime).toBe(0);
    });

    it('should have empty transform state initially', () => {
      const state = createInitialAppState();

      expect(state.transform.objects).toEqual({});
    });

    it('should have default UI state', () => {
      const state = createInitialAppState();

      expect(state.ui.rayCount).toBe(4);
      expect(state.ui.maxBounces).toBe(2);
      expect(state.ui.quality).toBe('medium');
    });
  });

  describe('updateAppState', () => {
    it('should update selection state', () => {
      const initial = createInitialAppState();
      const action: AppStateAction = {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      };

      const updated = updateAppState(initial, action);

      expect(updated.selection.selectedObjectId).toBe('colorCube');
      expect(updated.selection.previousObjectId).toBeNull();
      expect(updated).not.toBe(initial); // Immutability
    });

    it('should clear selection', () => {
      const initial = createInitialAppState();
      const selected = updateAppState(initial, {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });

      const cleared = updateAppState(selected, {
        type: 'CLEAR_SELECTION',
      });

      expect(cleared.selection.selectedObjectId).toBeNull();
      expect(cleared.selection.previousObjectId).toBe('colorCube');
    });

    it('should update object position', () => {
      const initial = createInitialAppState();
      const position = new Vector3(1, 2, 3);
      const action: AppStateAction = {
        type: 'UPDATE_POSITION',
        payload: { objectId: 'colorCube', position },
      };

      const updated = updateAppState(initial, action);

      expect(updated.transform.objects.colorCube).toBeDefined();
      expect(updated.transform.objects.colorCube.position).toEqual(position);
    });

    it('should update object rotation', () => {
      const initial = createInitialAppState();
      const rotation = new Vector3(0, Math.PI / 4, 0);
      const action: AppStateAction = {
        type: 'UPDATE_ROTATION',
        payload: { objectId: 'colorCube', rotation },
      };

      const updated = updateAppState(initial, action);

      expect(updated.transform.objects.colorCube).toBeDefined();
      expect(updated.transform.objects.colorCube.rotation).toEqual(rotation);
    });

    it('should update ray count', () => {
      const initial = createInitialAppState();
      const action: AppStateAction = {
        type: 'UPDATE_RAY_COUNT',
        payload: { count: 6 },
      };

      const updated = updateAppState(initial, action);

      expect(updated.ui.rayCount).toBe(6);
    });

    it('should update max bounces', () => {
      const initial = createInitialAppState();
      const action: AppStateAction = {
        type: 'UPDATE_MAX_BOUNCES',
        payload: { bounces: 3 },
      };

      const updated = updateAppState(initial, action);

      expect(updated.ui.maxBounces).toBe(3);
    });

    it('should update quality', () => {
      const initial = createInitialAppState();
      const action: AppStateAction = {
        type: 'UPDATE_QUALITY',
        payload: { quality: 'high' },
      };

      const updated = updateAppState(initial, action);

      expect(updated.ui.quality).toBe('high');
    });

    it('should reset state to initial', () => {
      const initial = createInitialAppState();
      const modified = updateAppState(initial, {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });

      const reset = updateAppState(modified, { type: 'RESET' });

      expect(reset.selection.selectedObjectId).toBeNull();
      expect(reset).toEqual(createInitialAppState());
    });

    it('should return same state for unknown action type', () => {
      const initial = createInitialAppState();
      const action = { type: 'UNKNOWN_ACTION' } as any;

      const updated = updateAppState(initial, action);

      expect(updated).toBe(initial);
    });
  });

  describe('selectors', () => {
    it('should select selection state', () => {
      const state = createInitialAppState();
      const selection = selectSelectionState(state);

      expect(selection).toBe(state.selection);
    });

    it('should select transform state', () => {
      const state = createInitialAppState();
      const transform = selectTransformState(state);

      expect(transform).toBe(state.transform);
    });

    it('should select UI state', () => {
      const state = createInitialAppState();
      const ui = selectUIState(state);

      expect(ui).toBe(state.ui);
    });

    it('should select transform for selected object', () => {
      const state = createInitialAppState();
      const position = new Vector3(1, 2, 3);
      const rotation = new Vector3(0, Math.PI / 2, 0);

      // Update state with object transform
      const withTransform = updateAppState(state, {
        type: 'UPDATE_POSITION',
        payload: { objectId: 'colorCube', position },
      });
      const withRotation = updateAppState(withTransform, {
        type: 'UPDATE_ROTATION',
        payload: { objectId: 'colorCube', rotation },
      });
      const selected = updateAppState(withRotation, {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });

      const transform = selectSelectedObjectTransform(selected);

      expect(transform).toEqual({ position, rotation });
    });

    it('should return null transform when no object selected', () => {
      const state = createInitialAppState();
      const transform = selectSelectedObjectTransform(state);

      expect(transform).toBeNull();
    });

    it('should select ray configuration', () => {
      const state = createInitialAppState();
      const rayConfig = selectRayConfiguration(state);

      expect(rayConfig).toEqual({
        count: 4,
        maxBounces: 2,
      });
    });
  });

  describe('immutability', () => {
    it('should not mutate original state on updates', () => {
      const initial = createInitialAppState();
      const originalSelection = initial.selection;
      const originalTransform = initial.transform;
      const originalUI = initial.ui;

      updateAppState(initial, {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });

      expect(initial.selection).toBe(originalSelection);
      expect(initial.transform).toBe(originalTransform);
      expect(initial.ui).toBe(originalUI);
    });

    it('should preserve unchanged substates', () => {
      const initial = createInitialAppState();
      const updated = updateAppState(initial, {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });

      // Only selection should be new, others should be same reference
      expect(updated.selection).not.toBe(initial.selection);
      expect(updated.transform).toBe(initial.transform);
      expect(updated.ui).toBe(initial.ui);
    });
  });
});