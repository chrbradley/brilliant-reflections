// ABOUTME: Entry point for the Mirror Room Reflection Interactive application
// ABOUTME: Initializes canvases and confirms they are accessible

import './style.css';
import { createEditorScene } from './editor/createEditorScene';
import { createRenderScene } from './render/createRenderScene';
import { createOrthographicCamera } from './cameras/createOrthographicCamera';
import { createPerspectiveCamera } from './cameras/createPerspectiveCamera';
import { attachCamera } from './cameras/attachCamera';
import { createRoom } from './geometry/createRoom';
import { createCube } from './geometry/createCube';
import { createCameraRig } from './editor/createCameraRig';
import { syncCameraWithRig } from './render/syncCameraWithRig';
import { createAmbientLight } from './lighting/createLighting';
import {
  createInitialSelectionState,
  selectObject,
  clearSelection,
} from './state/selectionState';
import { createMirrorConfig } from './mirrors/createMirrorTexture';
import { applyMirrorToWall, getMirrorWalls } from './mirrors/applyMirrors';
import { createPickHandler } from './editor/handlePicking';
import { applyHighlight, removeHighlight } from './effects/highlightEffect';
import {
  createInitialTransformState,
  updateObjectPosition,
  updateObjectRotation,
} from './state/transformState';
import { applyPositionConstraints } from './transforms/positionTransforms';
import { applyRotationConstraints } from './transforms/rotationTransforms';
import {
  GizmoManager,
  UtilityLayerRenderer,
  Vector3,
  TransformNode,
} from 'babylonjs';
import * as BABYLON from 'babylonjs';
import type { SceneConfig } from './types';
import type { SelectionState } from './state/selectionState';
import type { TransformState } from './state/transformState';
import {
  createRayManager,
  showRays,
  hideRays,
  updateRays,
  disposeRayManager,
  type RayManager,
} from './rays';
import {
  createInitialUIState,
  updateRayCount,
  updateMaxBounces,
  updateQuality,
  type UIState,
  type QualityLevel,
} from './state/uiState';
import { bindSliderToState, bindDropdownToState } from './ui/bindControls';

/**
 * Get canvas element by ID with type safety
 */
const getCanvas = (id: string): HTMLCanvasElement => {
  const canvas = document.getElementById(id);
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error(`Canvas element with id "${id}" not found`);
  }
  return canvas;
};

/**
 * Application state
 */
let editorConfig: SceneConfig | null = null;
let renderConfig: SceneConfig | null = null;
let selectionState: SelectionState = createInitialSelectionState();
let transformState: TransformState = createInitialTransformState();
let uiState: UIState = createInitialUIState();
let gizmoManager: GizmoManager | null = null;
let rayManager: RayManager | null = null;
let unbindFunctions: Array<() => void> = [];

/**
 * Cleanup function for disposing resources
 */
const cleanup = (): void => {
  // Unbind UI controls
  unbindFunctions.forEach((unbind) => unbind());
  unbindFunctions = [];

  if (rayManager) {
    disposeRayManager(rayManager);
    rayManager = null;
  }
  if (gizmoManager) {
    gizmoManager.dispose();
    gizmoManager = null;
  }
  if (editorConfig) {
    editorConfig.dispose();
    editorConfig = null;
  }
  if (renderConfig) {
    renderConfig.dispose();
    renderConfig = null;
  }
};

/**
 * Initialize the application
 */
const initialize = (): void => {
  try {
    // Get canvas elements
    const editorCanvas = getCanvas('editorCanvas');
    const renderCanvas = getCanvas('renderCanvas');

    // Create scene configurations
    editorConfig = createEditorScene(editorCanvas);
    renderConfig = createRenderScene(renderCanvas);

    // Create and attach cameras
    const editorCamera = createOrthographicCamera(
      'editorCamera',
      editorConfig.scene
    );
    attachCamera(editorCamera, editorConfig.scene, editorCanvas, true); // Lock editor camera

    const renderCamera = createPerspectiveCamera(
      'renderCamera',
      renderConfig.scene
    );
    attachCamera(renderCamera, renderConfig.scene, renderCanvas);

    // Create lighting for both scenes
    createAmbientLight('editorLight', editorConfig.scene);
    createAmbientLight('renderLight', renderConfig.scene);

    // Create room geometry in both scenes
    createRoom(editorConfig.scene);
    createRoom(renderConfig.scene);

    // Apply mirrors to render scene walls
    const mirrorWalls = getMirrorWalls();
    for (const wallName of mirrorWalls) {
      const wall = renderConfig.scene.getMeshByName(wallName);
      if (wall && wall instanceof BABYLON.Mesh) {
        let position: Vector3;
        let normal: Vector3;

        switch (wallName) {
          case 'northWall':
            position = new Vector3(0, 0, 10);
            normal = new Vector3(0, 0, -1);
            break;
          case 'eastWall':
            position = new Vector3(10, 0, 0);
            normal = new Vector3(-1, 0, 0);
            break;
          case 'westWall':
            position = new Vector3(-10, 0, 0);
            normal = new Vector3(1, 0, 0);
            break;
          default:
            continue;
        }

        const mirrorConfig = createMirrorConfig(
          wallName,
          position,
          normal,
          renderConfig.scene
        );
        applyMirrorToWall(wall, mirrorConfig);
      }
    }

    // Create the interactive cube in both scenes
    const editorCube = createCube(editorConfig.scene);
    const renderCube = createCube(renderConfig.scene);

    // Create camera rig in editor scene only (shows render camera position)
    const cameraRig = createCameraRig(editorConfig.scene);

    // Create and configure gizmo manager following reference pattern
    console.log('🔧 Creating GizmoManager...');

    // CRITICAL FIX: Create utility layer explicitly with editor scene
    const utilityLayer = new UtilityLayerRenderer(editorConfig.scene);
    gizmoManager = new GizmoManager(
      editorConfig.scene,
      undefined,
      utilityLayer
    );

    console.log(
      '✅ GizmoManager created with editor scene utility layer:',
      gizmoManager
    );
    console.log(
      '🎯 Utility layer scene engine canvas:',
      gizmoManager.utilityLayer.utilityLayerScene
        .getEngine()
        .getRenderingCanvas().id
    );

    gizmoManager.attachableMeshes = [editorCube, cameraRig.coneIndicator]; // Cube and camera rig cone are draggable
    gizmoManager.clearGizmoOnEmptyPointerEvent = true; // Auto-clear on empty click
    console.log('📦 EditorCube for gizmo:', editorCube);

    // Bootstrap once so gizmo sub-objects exist
    console.log('🔗 Attaching to editorCube...');
    gizmoManager.attachToMesh(editorCube);
    console.log('✅ Attached mesh:', gizmoManager.attachedMesh);

    // ── TRANSLATE ── (following exact reference pattern)
    console.log('⚡ Enabling position gizmo...');
    gizmoManager.positionGizmoEnabled = true; // arrows visible
    console.log(
      '✅ Position gizmo enabled:',
      gizmoManager.positionGizmoEnabled
    );

    // ── ROTATE ── (Y-axis only)
    console.log('⚡ Enabling rotation gizmo...');
    gizmoManager.rotationGizmoEnabled = true; // Y-ring visible
    console.log(
      '✅ Rotation gizmo enabled:',
      gizmoManager.rotationGizmoEnabled
    );

    // Wait for gizmo to be ready then configure
    setTimeout(() => {
      if (gizmoManager.gizmos.positionGizmo) {
        console.log('🔧 Configuring position gizmo after delay...');
        gizmoManager.gizmos.positionGizmo.snapDistance = 1; // 1-unit grid
        gizmoManager.gizmos.positionGizmo.yGizmo.isEnabled = false; // lock Y-move
        gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh = false; // world-aligned
        console.log('✅ Position gizmo configured with delay');

        console.log('✅ Position gizmo ready for manipulation');
      } else {
        console.error('❌ Position gizmo still null after delay!');
      }

      // Configure rotation gizmo
      if (gizmoManager.gizmos.rotationGizmo) {
        console.log('🔧 Configuring rotation gizmo...');
        const rotGizmo = gizmoManager.gizmos.rotationGizmo;
        rotGizmo.snapDistance = Math.PI / 12; // 15 degrees in radians
        rotGizmo.updateGizmoRotationToMatchAttachedMesh = false; // world-aligned
        rotGizmo.xGizmo.isEnabled = false; // hide X ring
        rotGizmo.zGizmo.isEnabled = false; // hide Z ring
        console.log('✅ Rotation gizmo configured (Y-axis only)');
      } else {
        console.error('❌ Rotation gizmo is null or undefined!');
      }
    }, 100);

    // Add constraint callbacks for position and rotation
    const limitToRoom = (): void => {
      if (gizmoManager?.attachedMesh) {
        const attachedMesh = gizmoManager.attachedMesh;

        if (attachedMesh === editorCube && editorCube.position) {
          // Handle cube position constraints
          const constrained = applyPositionConstraints(
            editorCube.position,
            1,
            8
          );
          editorCube.position.copyFrom(constrained);

          // Update transform state
          transformState = updateObjectPosition(
            transformState,
            'colorCube',
            editorCube.position
          );

          // Sync to render scene
          if (renderCube.position) {
            renderCube.position.copyFrom(editorCube.position);
          }

          // Update rays if cube is selected
          if (rayManager && selectionState.selectedObjectId === 'colorCube') {
            rayManager = updateRays(
              rayManager,
              editorCube.position,
              editorCube.getWorldMatrix(),
              { count: uiState.rayCount, maxBounces: uiState.maxBounces }
            );
          }
        } else if (
          attachedMesh === cameraRig.rigNode &&
          cameraRig.rigNode.position
        ) {
          // Handle camera rig position constraints (rig selected directly)
          const constrained = applyPositionConstraints(
            cameraRig.rigNode.position,
            1,
            8
          );
          cameraRig.rigNode.position.copyFrom(constrained);

          // Update transform state
          transformState = updateObjectPosition(
            transformState,
            'cameraRig',
            cameraRig.rigNode.position
          );
          
          // Sync render camera
          syncRenderCamera();
        }
      }
    };

    const constrainRotation = (): void => {
      if (gizmoManager?.attachedMesh) {
        const attachedMesh = gizmoManager.attachedMesh;

        if (attachedMesh === editorCube && editorCube.rotation) {
          // Handle cube rotation constraints
          const constrained = applyRotationConstraints(editorCube.rotation, 15);
          editorCube.rotation.copyFrom(constrained);

          // Update transform state
          transformState = updateObjectRotation(
            transformState,
            'colorCube',
            editorCube.rotation
          );

          // Sync to render scene
          if (renderCube.rotation) {
            renderCube.rotation.copyFrom(editorCube.rotation);
          }

          // Update rays if cube is selected
          if (rayManager && selectionState.selectedObjectId === 'colorCube') {
            rayManager = updateRays(
              rayManager,
              editorCube.position,
              editorCube.getWorldMatrix(),
              { count: uiState.rayCount, maxBounces: uiState.maxBounces }
            );
          }
        } else if (
          attachedMesh === cameraRig.rigNode &&
          cameraRig.rigNode.rotation &&
          cameraRig.pivotNode.rotation
        ) {
          // Handle camera rig rotation constraints (Y-axis only)
          // The gizmo rotates the rigNode, but we need to transfer Y rotation to pivotNode
          
          // Get the Y rotation that was applied to rigNode
          const yRotationDelta = cameraRig.rigNode.rotation.y;
          
          // Add it to the pivotNode's current Y rotation
          const newPivotRotation = new Vector3(
            cameraRig.pivotNode.rotation.x,
            cameraRig.pivotNode.rotation.y + yRotationDelta,
            cameraRig.pivotNode.rotation.z
          );
          
          // Apply constraints
          const constrained = applyRotationConstraints(newPivotRotation, 15);
          cameraRig.pivotNode.rotation.copyFrom(constrained);
          
          // Reset rigNode to its fixed rotation (keep cone pointing forward)
          cameraRig.rigNode.rotation.set(Math.PI / 2, 0, Math.PI);

          // Update transform state
          transformState = updateObjectRotation(
            transformState,
            'cameraRig',
            cameraRig.pivotNode.rotation
          );
          
          // Sync render camera
          syncRenderCamera();
        }
      }
    };

    // Apply constraints on drag (delayed to ensure gizmos are ready)
    setTimeout(() => {
      if (gizmoManager.gizmos.positionGizmo) {
        // Hide rays on drag start, show on drag end (for cube only)
        gizmoManager.gizmos.positionGizmo.xGizmo.dragBehavior.onDragStartObservable.add(
          () => {
            if (gizmoManager.attachedMesh === editorCube && rayManager) {
              rayManager = hideRays(rayManager);
            }
          }
        );
        gizmoManager.gizmos.positionGizmo.zGizmo.dragBehavior.onDragStartObservable.add(
          () => {
            if (gizmoManager.attachedMesh === editorCube && rayManager) {
              rayManager = hideRays(rayManager);
            }
          }
        );

        gizmoManager.gizmos.positionGizmo.xGizmo.dragBehavior.onDragEndObservable.add(
          () => {
            if (gizmoManager.attachedMesh === editorCube && rayManager) {
              rayManager = showRays(rayManager);
              rayManager = updateRays(
                rayManager,
                editorCube.position,
                editorCube.getWorldMatrix(),
                { count: uiState.rayCount, maxBounces: uiState.maxBounces }
              );
            }
          }
        );
        gizmoManager.gizmos.positionGizmo.zGizmo.dragBehavior.onDragEndObservable.add(
          () => {
            if (gizmoManager.attachedMesh === editorCube && rayManager) {
              rayManager = showRays(rayManager);
              rayManager = updateRays(
                rayManager,
                editorCube.position,
                editorCube.getWorldMatrix(),
                { count: uiState.rayCount, maxBounces: uiState.maxBounces }
              );
            }
          }
        );

        gizmoManager.gizmos.positionGizmo.xGizmo.dragBehavior.onDragObservable.add(
          limitToRoom
        );
        gizmoManager.gizmos.positionGizmo.zGizmo.dragBehavior.onDragObservable.add(
          limitToRoom
        );
        console.log('✅ Position drag constraints attached');
      }

      if (gizmoManager.gizmos.rotationGizmo) {
        gizmoManager.gizmos.rotationGizmo.yGizmo.dragBehavior.onDragObservable.add(
          constrainRotation
        );

        // Hide rays during rotation drag
        gizmoManager.gizmos.rotationGizmo.yGizmo.dragBehavior.onDragStartObservable.add(
          () => {
            if (gizmoManager.attachedMesh === editorCube && rayManager) {
              rayManager = hideRays(rayManager);
            }
          }
        );

        // Show and update rays after rotation
        gizmoManager.gizmos.rotationGizmo.yGizmo.dragBehavior.onDragEndObservable.add(
          () => {
            if (gizmoManager.attachedMesh === editorCube && rayManager) {
              rayManager = showRays(rayManager);
              rayManager = updateRays(
                rayManager,
                editorCube.position,
                editorCube.getWorldMatrix(),
                { count: uiState.rayCount, maxBounces: uiState.maxBounces }
              );
            }
          }
        );

        console.log('✅ Rotation drag constraints attached');
      }
    }, 150);

    // Following reference pattern: start with nothing selected
    setTimeout(() => {
      console.log('🔄 Starting with nothing selected...');
      gizmoManager.attachToMesh(null);
    }, 200);

    // Create ray visualization manager
    rayManager = createRayManager(editorConfig.scene);
    console.log('✅ Ray manager created');

    // Set up selection handling
    const handleSelection = (objectId: string | null): void => {
      if (editorConfig && renderConfig) {
        // Remove highlight from previously selected object
        if (selectionState.selectedObjectId) {
          removeHighlight(editorConfig.scene, selectionState.selectedObjectId);
          removeHighlight(renderConfig.scene, selectionState.selectedObjectId);
        }

        // Update selection state
        if (objectId) {
          selectionState = selectObject(selectionState, objectId);
          // Apply highlight to newly selected object
          applyHighlight(editorConfig.scene, objectId);
          applyHighlight(renderConfig.scene, objectId);

          // Attach gizmo to selected object
          const editorMesh = editorConfig.scene.getMeshByName(objectId);
          if (editorMesh && gizmoManager) {
            // If camera cone clicked, attach gizmo to the rig instead (matches reference)
            if (editorMesh === cameraRig.coneIndicator) {
              gizmoManager.attachToMesh(cameraRig.rigNode as any);
            } else {
              gizmoManager.attachToMesh(editorMesh);
            }
          }
        } else {
          selectionState = clearSelection(selectionState);
          // Detach gizmo
          if (gizmoManager) {
            gizmoManager.attachToMesh(null);
          }
        }
      }
    };

    // Create pick handler for editor scene
    const pickHandler = createPickHandler(
      editorConfig.scene,
      handleSelection,
      true // Clear selection when clicking empty space
    );

    // Register pick handler
    editorConfig.scene.onPointerObservable.add(pickHandler);

    // Also handle gizmo attachment changes (matches reference pattern)
    gizmoManager.onAttachedToMeshObservable.add((mesh) => {
      if (mesh === editorCube) {
        if (rayManager) {
          rayManager = showRays(rayManager);
          rayManager = updateRays(
            rayManager,
            editorCube.position,
            editorCube.getWorldMatrix(),
            { count: uiState.rayCount, maxBounces: uiState.maxBounces }
          );
        }
      } else if (mesh === null || mesh === cameraRig.rigNode) {
        if (rayManager) {
          rayManager = hideRays(rayManager);
        }
      }
    });

    // Sync render camera with rig position
    const syncRenderCamera = (): void => {
      const transform = syncCameraWithRig(
        cameraRig.rigNode.position,
        cameraRig.pivotNode.rotation
      );
      renderCamera.position.copyFrom(transform.position);
      renderCamera.rotation.copyFrom(transform.rotation);
    };

    // Keep Y positions locked (matches reference behavior)
    const lockYPositions = (): void => {
      if (editorCube) {
        editorCube.position.y = 1; // Keep cube 1 unit above ground
      }
      if (renderCube) {
        renderCube.position.y = 1; // Keep render cube synced
      }
      if (cameraRig.rigNode) {
        cameraRig.rigNode.position.y = 0; // Keep rig base on ground
      }
    };

    // Initial sync
    syncRenderCamera();

    // Set up UI control bindings
    const setupUIBindings = (): void => {
      // Get UI elements
      const raysSlider = document.getElementById(
        'raysSlider'
      ) as HTMLInputElement;
      const raysValue = document.getElementById('raysValue');
      const bouncesSlider = document.getElementById(
        'bouncesSlider'
      ) as HTMLInputElement;
      const bouncesValue = document.getElementById('bouncesValue');
      const qualitySelect = document.getElementById(
        'qualitySelect'
      ) as HTMLSelectElement;
      const resetButton = document.getElementById(
        'resetButton'
      ) as HTMLButtonElement;

      if (!raysSlider || !bouncesSlider || !qualitySelect || !resetButton) {
        console.error('UI controls not found');
        return;
      }

      // Bind ray count slider
      const unbindRays = bindSliderToState(raysSlider, (value) => {
        uiState = updateRayCount(uiState, value);
        if (raysValue) raysValue.textContent = value.toString();

        // Update rays if cube is selected
        if (
          rayManager &&
          selectionState.selectedObjectId === 'colorCube' &&
          editorCube
        ) {
          rayManager = updateRays(
            rayManager,
            editorCube.position,
            editorCube.getWorldMatrix(),
            { count: uiState.rayCount, maxBounces: uiState.maxBounces }
          );
        }
      });
      unbindFunctions.push(unbindRays);

      // Bind bounces slider
      const unbindBounces = bindSliderToState(bouncesSlider, (value) => {
        uiState = updateMaxBounces(uiState, value);
        if (bouncesValue) bouncesValue.textContent = value.toString();

        // Update rays if cube is selected
        if (
          rayManager &&
          selectionState.selectedObjectId === 'colorCube' &&
          editorCube
        ) {
          rayManager = updateRays(
            rayManager,
            editorCube.position,
            editorCube.getWorldMatrix(),
            { count: uiState.rayCount, maxBounces: uiState.maxBounces }
          );
        }
      });
      unbindFunctions.push(unbindBounces);

      // Bind quality dropdown
      const unbindQuality = bindDropdownToState(qualitySelect, (value) => {
        uiState = updateQuality(uiState, value as QualityLevel);

        // Apply quality settings to mirror textures
        if (renderConfig) {
          const mirrorSize = value === 'low' ? 256 : value === 'medium' ? 512 : 1024;
          
          // Update all mirror texture sizes
          renderConfig.scene.materials.forEach(material => {
            if (material instanceof BABYLON.StandardMaterial && 
                material.reflectionTexture instanceof BABYLON.MirrorTexture) {
              const oldTexture = material.reflectionTexture;
              const newTexture = new BABYLON.MirrorTexture(
                oldTexture.name,
                mirrorSize,
                renderConfig.scene,
                true
              );
              newTexture.mirrorPlane = oldTexture.mirrorPlane;
              newTexture.renderList = oldTexture.renderList;
              material.reflectionTexture = newTexture;
              oldTexture.dispose();
            }
          });
        }
      });
      unbindFunctions.push(unbindQuality);

      // Bind reset button
      const handleReset = (): void => {
        // Reset UI state
        uiState = createInitialUIState();

        // Update UI controls
        raysSlider.value = uiState.rayCount.toString();
        if (raysValue) raysValue.textContent = uiState.rayCount.toString();
        bouncesSlider.value = uiState.maxBounces.toString();
        if (bouncesValue)
          bouncesValue.textContent = uiState.maxBounces.toString();
        qualitySelect.value = uiState.quality;

        // Reset cube position and rotation
        if (editorCube && renderCube) {
          editorCube.position.set(0, 1, 0);
          editorCube.rotation.set(0, 0, 0);
          renderCube.position.copyFrom(editorCube.position);
          renderCube.rotation.copyFrom(editorCube.rotation);

          // Update transform state
          transformState = updateObjectPosition(
            transformState,
            'colorCube',
            editorCube.position
          );
          transformState = updateObjectRotation(
            transformState,
            'colorCube',
            editorCube.rotation
          );
        }

        // Reset camera rig
        if (cameraRig) {
          cameraRig.rigNode.position.set(0, 0, -5);
          cameraRig.pivotNode.rotation.set(0, 0, 0);

          // Update transform state
          transformState = updateObjectPosition(
            transformState,
            'cameraRig',
            cameraRig.rigNode.position
          );
          transformState = updateObjectRotation(
            transformState,
            'cameraRig',
            cameraRig.pivotNode.rotation
          );

          // Sync render camera
          syncRenderCamera();
        }

        // Clear selection
        handleSelection(null);

        // Update rays if needed
        if (rayManager && editorCube) {
          rayManager = hideRays(rayManager);
        }

        // Apply quality settings to mirror textures
        if (renderConfig) {
          const mirrorSize = uiState.quality === 'low' ? 256 : 
                            uiState.quality === 'medium' ? 512 : 1024;
          
          // Update all mirror texture sizes
          renderConfig.scene.materials.forEach(material => {
            if (material instanceof BABYLON.StandardMaterial && 
                material.reflectionTexture instanceof BABYLON.MirrorTexture) {
              const oldTexture = material.reflectionTexture;
              const newTexture = new BABYLON.MirrorTexture(
                oldTexture.name,
                mirrorSize,
                renderConfig.scene,
                true
              );
              newTexture.mirrorPlane = oldTexture.mirrorPlane;
              newTexture.renderList = oldTexture.renderList;
              material.reflectionTexture = newTexture;
              oldTexture.dispose();
            }
          });
        }
      };

      resetButton.addEventListener('click', handleReset);
      unbindFunctions.push(() =>
        resetButton.removeEventListener('click', handleReset)
      );
    };

    setupUIBindings();

    // Set up render loops
    editorConfig.engine.runRenderLoop(() => {
      // Keep Y positions locked before each render
      lockYPositions();
      
      // Sync render camera with rig position
      syncRenderCamera();

      // Only render if scene has active cameras
      if (editorConfig?.scene.activeCamera) {
        editorConfig.scene.render();
      }
    });

    renderConfig.engine.runRenderLoop(() => {
      // Only render if scene has active cameras
      if (renderConfig?.scene.activeCamera) {
        renderConfig.scene.render();
      }
    });

    // Handle window resize
    const handleResize = (): void => {
      editorConfig?.engine.resize();
      renderConfig?.engine.resize();
    };

    window.addEventListener('resize', handleResize);

    // Handle cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

    // Add Babylon.js scene inspector for debugging
    if (window.location.search.includes('inspector')) {
      import('@babylonjs/inspector').then(() => {
        editorConfig.scene.debugLayer.show({
          embedMode: true,
        });
      });
    }

    // Log successful initialization
    console.log('Application initialized successfully');
    console.log('Cameras attached. Ready for rendering.');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    cleanup();
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
