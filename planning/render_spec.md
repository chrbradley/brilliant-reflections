# Render View Specification

## Overview
The render view provides a physically-based visualization of reflections that corresponds to the ray indicators shown in the editor view. This allows learners to build intuition about how ray paths translate to actual reflections.

**Note**: This is a feature enhancement to the existing Brilliant Reflections application. The implementation should reuse existing components including the cube geometry, room creation system, camera synchronization, and basic mirror textures.

## Core Requirements

### Camera System
- Render camera position and rotation are controlled by the existing camera indicator in the editor view
- Perfect alignment between camera indicator transform and render camera transform using existing sync system
- Camera indicator geometry itself is NOT rendered in the render view (use layer masking)

### Room Geometry

#### Walls
- North, East, and West walls are perfect mirrors (100% reflective)
- South wall is standard matte (non-reflective) 
- Implemented using reflection textures for accurate planar reflections
- Each wall has its own reflection texture to enable multi-bounce reflections

#### Ceiling
- Uniform emissive material for even illumination
- Provides consistent lighting without shadow computation overhead

#### Floor
- Non-reflective matte gray material
- Provides visual contrast with reflective walls

### Cube
- Uses existing cube from createCube() with colored faces:
  - Top (+Y): White
  - Bottom (-Y): Yellow  
  - Front (+Z): Green
  - Back (-Z): Blue
  - Right (+X): Red
  - Left (-X): Orange
- Essential for users to identify face orientation in reflections

### Reflection System

#### Multi-Bounce Implementation
- Uses multiple rendering passes to achieve nested reflections
- Pass 1: Each wall renders direct view
- Pass 2: Each wall updates to include other walls' reflections
- Pass N: Continue until reaching max bounce count
- Number of passes matches the bounce parameter (initially static at 2-3)

#### Performance Optimization
- Initial implementation uses 256x256 reflection textures
- Will later connect to quality dropdown (Low: 256, Medium: 512, High: 1024)

### Visibility Control
- Implement Babylon.js layerMask system
- Editor-only objects (ground plane, camera indicator) assigned to separate layer
- Render camera excludes editor-only layer
- Build on existing render scene structure

### Learning Flow
1. User positions cube and camera in editor view
2. Ray indicators show predicted reflection paths
3. Render view displays actual reflections matching those paths
4. Multiple reflection bounces visible (up to max bounce setting)

## Implementation Priority
1. Add layer masking to hide editor-only objects
2. Enhance existing single-bounce reflections to multi-bounce
3. Implement multi-pass system for multiple bounces
4. Connect bounce count to existing UI parameter
5. Connect quality settings to existing UI dropdown

## Success Criteria
- Reflections in render view accurately match ray paths shown in editor
- Users can clearly see and understand multi-bounce reflections
- Performance remains interactive (target 30+ FPS)
- Clear visual distinction between direct view and reflections