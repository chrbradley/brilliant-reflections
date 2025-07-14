// ABOUTME: Pure functions for managing object transform state immutably
// ABOUTME: Tracks position and rotation for all transformable objects

import { Vector3 } from 'babylonjs';

/**
 * Object transform data
 */
export interface ObjectTransform {
  readonly position: Vector3;
  readonly rotation: Vector3;
}

/**
 * Transform state for all objects
 */
export interface TransformState {
  readonly transforms: Record<string, ObjectTransform>;
}

/**
 * Creates initial empty transform state
 */
export const createInitialTransformState = (): TransformState => {
  const state: TransformState = {
    transforms: {},
  };

  if (process.env.NODE_ENV === 'development') {
    return Object.freeze(state);
  }

  return state;
};

/**
 * Updates object position in state
 * 
 * @param state - Current transform state
 * @param objectId - ID of object to update
 * @param position - New position vector
 * @returns New state with updated position
 */
export const updateObjectPosition = (
  state: TransformState,
  objectId: string,
  position: Vector3
): TransformState => {
  const currentTransform = state.transforms[objectId];
  
  const newTransform: ObjectTransform = {
    position: position.clone(),
    rotation: currentTransform?.rotation.clone() || Vector3.Zero(),
  };

  const newState: TransformState = {
    transforms: {
      ...state.transforms,
      [objectId]: newTransform,
    },
  };

  if (process.env.NODE_ENV === 'development') {
    return Object.freeze(newState);
  }

  return newState;
};

/**
 * Updates object rotation in state
 * 
 * @param state - Current transform state
 * @param objectId - ID of object to update
 * @param rotation - New rotation vector
 * @returns New state with updated rotation
 */
export const updateObjectRotation = (
  state: TransformState,
  objectId: string,
  rotation: Vector3
): TransformState => {
  const currentTransform = state.transforms[objectId];
  
  const newTransform: ObjectTransform = {
    position: currentTransform?.position.clone() || Vector3.Zero(),
    rotation: rotation.clone(),
  };

  const newState: TransformState = {
    transforms: {
      ...state.transforms,
      [objectId]: newTransform,
    },
  };

  if (process.env.NODE_ENV === 'development') {
    return Object.freeze(newState);
  }

  return newState;
};

/**
 * Gets transform for an object
 * 
 * @param state - Current transform state
 * @param objectId - ID of object to get
 * @returns Object transform or null if not found
 */
export const getObjectTransform = (
  state: TransformState,
  objectId: string
): ObjectTransform | null => {
  const transform = state.transforms[objectId];
  
  if (!transform) {
    return null;
  }

  // Return cloned vectors to maintain immutability
  return {
    position: transform.position.clone(),
    rotation: transform.rotation.clone(),
  };
};

/**
 * Clears all transforms from state
 * 
 * @param state - Current transform state
 * @returns New empty transform state
 */
export const clearTransforms = (
  state: TransformState
): TransformState => {
  return createInitialTransformState();
};