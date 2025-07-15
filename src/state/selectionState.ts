// ABOUTME: Pure functions for managing selection state in an immutable way
// ABOUTME: Provides Redux-like state management for object selection

/**
 * Immutable selection state
 */
export interface SelectionState {
  readonly selectedObjectId: string | null;
  readonly selectionTime: number;
}

/**
 * Creates initial empty selection state
 */
export const createInitialSelectionState = (): SelectionState => {
  const state: SelectionState = {
    selectedObjectId: null,
    selectionTime: 0,
  };

  // Freeze in development to ensure immutability
  if (process.env.NODE_ENV === 'development') {
    return Object.freeze(state);
  }

  return state;
};

/**
 * Selects an object, returning new state
 *
 * @param state - Current selection state
 * @param objectId - ID of object to select
 * @returns New selection state
 */
export const selectObject = (
  state: SelectionState,
  objectId: string
): SelectionState => {
  const newState: SelectionState = {
    selectedObjectId: objectId,
    selectionTime: Date.now(),
  };

  if (process.env.NODE_ENV === 'development') {
    return Object.freeze(newState);
  }

  return newState;
};

/**
 * Clears selection, returning new state
 *
 * @param state - Current selection state
 * @returns New empty selection state
 */
export const clearSelection = (state: SelectionState): SelectionState => {
  return createInitialSelectionState();
};

/**
 * Checks if an object is selected
 *
 * @param state - Current selection state
 * @param objectId - ID of object to check
 * @returns True if object is selected
 */
export const isSelected = (
  state: SelectionState,
  objectId: string | null | undefined
): boolean => {
  if (!objectId || !state.selectedObjectId) {
    return false;
  }

  return state.selectedObjectId === objectId;
};
