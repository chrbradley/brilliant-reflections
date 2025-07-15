// ABOUTME: Pure effect descriptions for state changes following functional patterns
// ABOUTME: Effects are data structures that describe side effects without executing them

import { Vector3, Scene, Mesh, StandardMaterial, MirrorTexture } from 'babylonjs';
import type { AppState } from './appState';
import type { InitialStateConfig } from '../config/initialState';

/**
 * Effect context containing scene objects and functions
 */
export interface EffectContext {
  editorScene: Scene;
  renderScene: Scene;
  gizmoManager: any; // Avoiding circular dependency
  rayManager: any; // Avoiding circular dependency
  applyHighlight: (scene: Scene, objectId: string) => void;
  removeHighlight: (scene: Scene, objectId: string) => void;
  getInitialConfig?: () => InitialStateConfig;
}

/**
 * Effect types
 */
export type EffectType = 'selection' | 'transform' | 'rayUpdate' | 'quality' | 'reset';

/**
 * Effect description - pure data structure
 */
export interface StateEffect {
  type: EffectType;
  execute: (context: EffectContext) => void;
}

/**
 * Create selection effect
 */
export const createSelectionEffect = (
  oldState: AppState,
  newState: AppState
): StateEffect => {
  const oldSelection = oldState.selection.selectedObjectId;
  const newSelection = newState.selection.selectedObjectId;

  return {
    type: 'selection',
    execute: (context: EffectContext) => {
      // Remove highlight from previous selection
      if (oldSelection) {
        context.removeHighlight(context.editorScene, oldSelection);
        context.removeHighlight(context.renderScene, oldSelection);
      }

      // Apply highlight to new selection
      if (newSelection) {
        context.applyHighlight(context.editorScene, newSelection);
        context.applyHighlight(context.renderScene, newSelection);

        // Attach gizmo
        const mesh = context.editorScene.getMeshByName(newSelection);
        if (mesh && context.gizmoManager) {
          context.gizmoManager.attachToMesh(mesh);
        }

        // Show rays if cube selected
        if (newSelection === 'colorCube' && context.rayManager) {
          context.rayManager.showRays();
        }
      } else {
        // Clear gizmo
        if (context.gizmoManager) {
          context.gizmoManager.attachToMesh(null);
        }

        // Hide rays
        if (context.rayManager) {
          context.rayManager.hideRays();
        }
      }
    },
  };
};

/**
 * Create transform effect
 */
export const createTransformEffect = (
  oldState: AppState,
  newState: AppState
): StateEffect => {
  const changedObjects = Object.keys(newState.transform.objects).filter(
    (objectId) => {
      const oldTransform = oldState.transform.objects[objectId];
      const newTransform = newState.transform.objects[objectId];
      
      if (!oldTransform) return true;
      
      return !oldTransform.position.equals(newTransform.position) ||
             !oldTransform.rotation.equals(newTransform.rotation);
    }
  );

  return {
    type: 'transform',
    execute: (context: EffectContext) => {
      changedObjects.forEach((objectId) => {
        const transform = newState.transform.objects[objectId];
        
        // Update editor scene
        const editorMesh = context.editorScene.getMeshByName(objectId);
        if (editorMesh && editorMesh instanceof Mesh) {
          editorMesh.position.copyFrom(transform.position);
          editorMesh.rotation.copyFrom(transform.rotation);
        }

        // Update render scene
        const renderMesh = context.renderScene.getMeshByName(objectId);
        if (renderMesh && renderMesh instanceof Mesh) {
          renderMesh.position.copyFrom(transform.position);
          renderMesh.rotation.copyFrom(transform.rotation);
        }
      });
    },
  };
};

/**
 * Create ray update effect
 */
export const createRayUpdateEffect = (
  oldState: AppState,
  newState: AppState
): StateEffect => {
  const rayConfigChanged =
    oldState.ui.rayCount !== newState.ui.rayCount ||
    oldState.ui.maxBounces !== newState.ui.maxBounces;

  const selectedObject = newState.selection.selectedObjectId;

  return {
    type: 'rayUpdate',
    execute: (context: EffectContext) => {
      if (rayConfigChanged && selectedObject === 'colorCube' && context.rayManager) {
        const mesh = context.editorScene.getMeshByName(selectedObject);
        if (mesh && mesh instanceof Mesh) {
          context.rayManager.updateRays({
            position: mesh.position,
            worldMatrix: mesh.getWorldMatrix(),
            config: {
              count: newState.ui.rayCount,
              maxBounces: newState.ui.maxBounces,
            },
          });
        }
      }
    },
  };
};

/**
 * Create quality effect
 */
export const createQualityEffect = (
  oldState: AppState,
  newState: AppState
): StateEffect => {
  const qualityChanged = oldState.ui.quality !== newState.ui.quality;

  return {
    type: 'quality',
    execute: (context: EffectContext) => {
      if (qualityChanged) {
        const mirrorSize =
          newState.ui.quality === 'low' ? 256 :
          newState.ui.quality === 'medium' ? 512 : 1024;

        // Update all mirror textures
        context.renderScene.materials.forEach((material) => {
          if (
            material instanceof StandardMaterial &&
            material.reflectionTexture instanceof MirrorTexture
          ) {
            const oldTexture = material.reflectionTexture;
            const newTexture = new MirrorTexture(
              oldTexture.name,
              mirrorSize,
              context.renderScene,
              true
            );
            newTexture.mirrorPlane = oldTexture.mirrorPlane;
            newTexture.renderList = oldTexture.renderList;
            material.reflectionTexture = newTexture;
            oldTexture.dispose();
          }
        });
      }
    },
  };
};

/**
 * Create reset effect
 */
export const createResetEffect = (
  oldState: AppState,
  newState: AppState
): StateEffect => {
  // Check if this is a reset by comparing to initial state
  const isReset = 
    newState.selection.selectedObjectId === null &&
    Object.keys(newState.transform.objects).length === 0 &&
    newState.ui.rayCount === 4 &&
    newState.ui.maxBounces === 2 &&
    newState.ui.quality === 'medium';

  return {
    type: 'reset',
    execute: (context: EffectContext) => {
      if (isReset && context.getInitialConfig) {
        const config = context.getInitialConfig();

        // Reset cube position and rotation
        const editorCube = context.editorScene.getMeshByName('colorCube');
        const renderCube = context.renderScene.getMeshByName('colorCube');
        if (editorCube && editorCube instanceof Mesh) {
          editorCube.position.copyFrom(config.cube.position);
          editorCube.rotation.copyFrom(config.cube.rotation);
        }
        if (renderCube && renderCube instanceof Mesh) {
          renderCube.position.copyFrom(config.cube.position);
          renderCube.rotation.copyFrom(config.cube.rotation);
        }

        // Reset camera indicator
        const cameraIndicator = context.editorScene.getMeshByName('cameraIndicator');
        if (cameraIndicator && cameraIndicator instanceof Mesh) {
          cameraIndicator.position.copyFrom(config.cameraIndicator.position);
          cameraIndicator.rotation.copyFrom(config.cameraIndicator.rotation);
          
          // Look at cube
          cameraIndicator.lookAt(config.cube.position);
        }

        // Clear gizmo
        if (context.gizmoManager) {
          context.gizmoManager.attachToMesh(null);
        }

        // Hide rays
        if (context.rayManager) {
          context.rayManager.hideRays();
        }
      }
    },
  };
};

/**
 * Apply state effects based on state changes
 * Returns array of effects that were executed
 */
export const applyStateEffects = (
  oldState: AppState,
  newState: AppState,
  context: EffectContext
): StateEffect[] => {
  const effects: StateEffect[] = [];

  // Check for selection changes
  if (oldState.selection !== newState.selection) {
    const effect = createSelectionEffect(oldState, newState);
    effect.execute(context);
    effects.push(effect);
  }

  // Check for transform changes
  if (oldState.transform !== newState.transform) {
    const effect = createTransformEffect(oldState, newState);
    effect.execute(context);
    effects.push(effect);
  }

  // Check for ray config changes
  if (
    oldState.ui.rayCount !== newState.ui.rayCount ||
    oldState.ui.maxBounces !== newState.ui.maxBounces
  ) {
    const effect = createRayUpdateEffect(oldState, newState);
    effect.execute(context);
    effects.push(effect);
  }

  // Check for quality changes
  if (oldState.ui.quality !== newState.ui.quality) {
    const effect = createQualityEffect(oldState, newState);
    effect.execute(context);
    effects.push(effect);
  }

  // Check for reset
  const resetEffect = createResetEffect(oldState, newState);
  if (resetEffect.type === 'reset') {
    resetEffect.execute(context);
    effects.push(resetEffect);
  }

  return effects;
};