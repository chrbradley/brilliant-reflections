// ABOUTME: Layer mask constants for controlling object visibility between editor and render views
// ABOUTME: Simple numeric constants for better code readability

/**
 * Layer mask for objects that should appear in the render view
 * This includes the room, cube, and other rendered objects
 */
export const RENDER_LAYER = 1;

/**
 * Layer mask for editor-only objects
 * This includes camera indicator, gizmos, ground plane, etc.
 */
export const EDITOR_LAYER = 2;

/**
 * Combined layer mask for editor view camera
 * Editor camera sees both render and editor objects
 */
export const EDITOR_CAMERA_MASK = 3; // Sees layers 1 and 2

/**
 * Layer mask for render view camera
 * Render camera only sees render layer objects
 */
export const RENDER_CAMERA_MASK = RENDER_LAYER;