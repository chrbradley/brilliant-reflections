// ABOUTME: Pure functions for creating line meshes from ray segments
// ABOUTME: Generates visual representation of rays with proper colors and alpha

import {
  Scene,
  MeshBuilder,
  Mesh,
  Color3,
  TransformNode,
  Vector3,
  Matrix,
} from 'babylonjs';
import { Ray, RaySegment } from './types';
import { createRaySegments } from './createRaySegments';
import { generateRays } from './generateRays';
import { traceRay } from './traceRay';
import { createWallPlanes } from './createWallPlanes';

/**
 * Creates a line mesh for a single ray segment
 *
 * @param segment - Ray segment with start/end points and alpha
 * @param color - Color for the line
 * @param name - Unique name for the mesh
 * @param scene - Scene to add the mesh to
 * @returns Line mesh for the segment
 */
const createSegmentMesh = (
  segment: RaySegment,
  color: Color3,
  name: string,
  scene: Scene
): Mesh => {
  const mesh = MeshBuilder.CreateLines(
    name,
    {
      points: [segment.startPoint, segment.endPoint],
      useVertexAlpha: true,
    },
    scene
  );

  mesh.color = color;
  mesh.alpha = segment.alpha;
  mesh.isPickable = false; // Rays should not interfere with picking

  return mesh;
};

/**
 * Creates all visual meshes for a single ray
 *
 * @param ray - Ray with origin and direction
 * @param rayIndex - Index of this ray (for naming)
 * @param wallPlanes - Wall planes for intersection
 * @param maxBounces - Maximum number of bounces
 * @param scene - Scene to add meshes to
 * @returns Array of line meshes for all segments
 */
export const createRayMeshes = (
  ray: Ray,
  rayIndex: number,
  wallPlanes: ReturnType<typeof createWallPlanes>,
  maxBounces: number,
  scene: Scene
): Mesh[] => {
  // Trace the ray to get all points
  const points = traceRay(ray, wallPlanes, maxBounces);

  // Create segments from points
  const segments = createRaySegments(points, ray.color);

  // Create mesh for each segment
  const meshes: Mesh[] = [];

  segments.forEach((segment, segmentIndex) => {
    const name = `ray${rayIndex}_seg${segmentIndex}`;
    const mesh = createSegmentMesh(segment, ray.color, name, scene);
    meshes.push(mesh);
  });

  return meshes;
};

/**
 * Configuration for ray visualization
 */
export interface RayVisualizationConfig {
  origin: Vector3;
  worldMatrix: Matrix;
  rayCount: number;
  fanRays: number;
  maxBounces: number;
  scene: Scene;
  parentNode: TransformNode;
}

/**
 * Creates all ray visualization meshes
 *
 * @param config - Configuration for ray visualization
 * @returns Parent node containing all ray meshes
 */
export const createAllRayMeshes = (
  config: RayVisualizationConfig
): TransformNode => {
  const { origin, worldMatrix, rayCount, fanRays, maxBounces, scene, parentNode } =
    config;

  // Clear existing children
  parentNode.getChildren().forEach((child) => {
    child.dispose();
  });

  // Generate rays with fan pattern
  const rays = generateRays(origin, worldMatrix, rayCount, fanRays);

  // Get wall planes
  const wallPlanes = createWallPlanes();

  // Create meshes for each ray
  rays.forEach((ray, rayIndex) => {
    const meshes = createRayMeshes(
      ray,
      rayIndex,
      wallPlanes,
      maxBounces,
      scene
    );

    // Parent all meshes to the parent node
    meshes.forEach((mesh) => {
      mesh.parent = parentNode;
    });
  });

  return parentNode;
};
