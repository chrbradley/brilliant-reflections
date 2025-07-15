// ABOUTME: Functions for creating recursive mirror chains
// ABOUTME: Manages mirror-in-mirror reflections up to 4 levels

import { MirrorTexture } from 'babylonjs';

/**
 * Configuration for mirror chaining
 */
export interface MirrorChainConfig {
  level: number;
  maxLevel: number;
  enabled: boolean;
}

/**
 * Maximum number of mirror recursion levels
 */
const MAX_MIRROR_LEVELS = 4;

/**
 * Gets the current chain level of a mirror
 *
 * @param mirror - Mirror texture to check
 * @returns Current chain level (0-4)
 */
export const getChainLevel = (mirror: MirrorTexture): number => {
  let level = 0;
  let current = mirror;

  // Count nested mirrors in render list
  while (
    current.renderList &&
    current.renderList.length > 0 &&
    level < MAX_MIRROR_LEVELS
  ) {
    // In tests, we can't use instanceof, so check for renderList property
    const nextMirror = current.renderList.find(
      (item) => item && typeof item === 'object' && 'renderList' in item
    ) as MirrorTexture | undefined;

    if (!nextMirror) break;

    current = nextMirror;
    level++;
  }

  return Math.min(level, MAX_MIRROR_LEVELS);
};

/**
 * Links two mirrors in a chain
 *
 * @param parent - Parent mirror
 * @param child - Child mirror to add
 * @returns Updated parent mirror
 */
export const linkMirrors = (
  parent: MirrorTexture,
  child: MirrorTexture
): MirrorTexture => {
  const currentLevel = getChainLevel(parent);

  // Don't exceed maximum chain level
  // Level 3 means we have 4 mirrors total (0-indexed), so no more children
  if (currentLevel >= MAX_MIRROR_LEVELS - 1) {
    return parent;
  }

  // Add child to parent's render list
  if (!parent.renderList.includes(child)) {
    parent.renderList = [...parent.renderList, child];
  }

  return parent;
};

/**
 * Creates a mirror chain configuration
 *
 * @param level - Desired chain level
 * @returns Chain configuration
 */
export const createMirrorChain = (level: number): MirrorChainConfig => {
  const clampedLevel = Math.max(0, Math.min(level, MAX_MIRROR_LEVELS));

  return {
    level: clampedLevel,
    maxLevel: MAX_MIRROR_LEVELS,
    enabled: level >= 0,
  };
};
