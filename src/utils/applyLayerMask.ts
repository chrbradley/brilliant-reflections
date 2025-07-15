// ABOUTME: Utility functions for applying layer masks to meshes and cameras
// ABOUTME: Enables selective visibility control between editor and render views

import { Mesh, Camera } from 'babylonjs';
import { RENDER_LAYER, EDITOR_LAYER } from '../constants/layerMasks';

/**
 * Apply a layer mask to a mesh
 * @param mesh - The mesh to apply the layer mask to
 * @param layer - The layer mask to apply
 */
export const applyLayerMaskToMesh = (mesh: Mesh, layer: number): void => {
  if (!mesh) {
    console.warn('applyLayerMaskToMesh: mesh is null or undefined');
    return;
  }
  
  mesh.layerMask = layer;
  
  // Also apply to child meshes
  mesh.getChildMeshes().forEach((child) => {
    child.layerMask = layer;
  });
};

/**
 * Mark a mesh as editor-only (won't appear in render view)
 * @param mesh - The mesh to mark as editor-only
 */
export const markAsEditorOnly = (mesh: Mesh): void => {
  applyLayerMaskToMesh(mesh, EDITOR_LAYER);
};

/**
 * Mark a mesh as renderable (will appear in both views)
 * @param mesh - The mesh to mark as renderable
 */
export const markAsRenderable = (mesh: Mesh): void => {
  applyLayerMaskToMesh(mesh, RENDER_LAYER);
};

/**
 * Apply layer mask to a camera
 * @param camera - The camera to configure
 * @param mask - The layer mask for the camera
 */
export const applyLayerMaskToCamera = (camera: Camera, mask: number): void => {
  if (!camera) {
    console.warn('applyLayerMaskToCamera: camera is null or undefined');
    return;
  }
  
  camera.layerMask = mask;
};