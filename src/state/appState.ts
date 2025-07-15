// ABOUTME: Unified application state management with Redux-like patterns
// ABOUTME: Combines selection, transform, and UI states with pure reducer functions

import { Vector3 } from 'babylonjs';
import {
  SelectionState,
  createInitialSelectionState,
  selectObject,
  clearSelection,
} from './selectionState';
import {
  TransformState,
  createInitialTransformState,
  updateObjectPosition,
  updateObjectRotation,
} from './transformState';
import {
  UIState,
  createInitialUIState,
  updateRayCount,
  updateMaxBounces,
  updateQuality,
  QualityLevel,
} from './uiState';

/**
 * Unified application state
 */
export interface AppState {
  readonly selection: SelectionState;
  readonly transform: TransformState;
  readonly ui: UIState;
}

/**
 * Action types for state updates
 */
export type AppStateAction =
  | { type: 'SELECT_OBJECT'; payload: { objectId: string } }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'UPDATE_POSITION'; payload: { objectId: string; position: Vector3 } }
  | { type: 'UPDATE_ROTATION'; payload: { objectId: string; rotation: Vector3 } }
  | { type: 'UPDATE_RAY_COUNT'; payload: { count: number } }
  | { type: 'UPDATE_MAX_BOUNCES'; payload: { bounces: number } }
  | { type: 'UPDATE_QUALITY'; payload: { quality: QualityLevel } }
  | { type: 'RESET' };

/**
 * Create initial application state
 */
export const createInitialAppState = (): AppState => {
  return {
    selection: createInitialSelectionState(),
    transform: createInitialTransformState(),
    ui: createInitialUIState(),
  };
};

/**
 * Update application state based on action
 * Pure reducer function that returns new state
 */
export const updateAppState = (
  state: AppState,
  action: AppStateAction
): AppState => {
  switch (action.type) {
    case 'SELECT_OBJECT':
      return {
        ...state,
        selection: selectObject(state.selection, action.payload.objectId),
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selection: clearSelection(state.selection),
      };

    case 'UPDATE_POSITION':
      return {
        ...state,
        transform: updateObjectPosition(
          state.transform,
          action.payload.objectId,
          action.payload.position
        ),
      };

    case 'UPDATE_ROTATION':
      return {
        ...state,
        transform: updateObjectRotation(
          state.transform,
          action.payload.objectId,
          action.payload.rotation
        ),
      };

    case 'UPDATE_RAY_COUNT':
      return {
        ...state,
        ui: updateRayCount(state.ui, action.payload.count),
      };

    case 'UPDATE_MAX_BOUNCES':
      return {
        ...state,
        ui: updateMaxBounces(state.ui, action.payload.bounces),
      };

    case 'UPDATE_QUALITY':
      return {
        ...state,
        ui: updateQuality(state.ui, action.payload.quality),
      };

    case 'RESET':
      return createInitialAppState();

    default:
      return state;
  }
};

// Selectors

/**
 * Select selection state
 */
export const selectSelectionState = (state: AppState): SelectionState =>
  state.selection;

/**
 * Select transform state
 */
export const selectTransformState = (state: AppState): TransformState =>
  state.transform;

/**
 * Select UI state
 */
export const selectUIState = (state: AppState): UIState => state.ui;

/**
 * Select transform for currently selected object
 */
export const selectSelectedObjectTransform = (
  state: AppState
): { position: Vector3; rotation: Vector3 } | null => {
  const selectedId = state.selection.selectedObjectId;
  if (!selectedId) return null;

  const transform = state.transform.objects[selectedId];
  if (!transform) return null;

  return {
    position: transform.position,
    rotation: transform.rotation,
  };
};

/**
 * Select ray configuration from UI state
 */
export const selectRayConfiguration = (
  state: AppState
): { count: number; maxBounces: number } => {
  return {
    count: state.ui.rayCount,
    maxBounces: state.ui.maxBounces,
  };
};