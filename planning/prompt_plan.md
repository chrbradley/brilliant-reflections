# Mirror Room Reflection Interactive - Implementation Prompt Plan (Functional Approach)

This document contains a series of TDD-focused prompts for implementing the mirror room reflection interactive project using functional programming principles. Each prompt builds on previous ones, ensuring no orphaned code and continuous integration.

## Overview

The project will be built incrementally through 24 main implementation steps, each with comprehensive tests written first. The architecture follows functional programming principles with immutable state, pure functions, and declarative composition.

## Implementation Prompts

### Step 1: Project Foundation

```text
Set up a new Vite project with TypeScript for a Babylon.js mirror room interactive following functional programming principles.

Requirements:
1. Initialize project with Vite and TypeScript (strict mode)
2. Configure ESLint and Prettier with functional programming rules
3. Add Babylon.js as a dependency
4. Create basic HTML structure with two canvas elements side-by-side
5. Add responsive CSS to ensure canvases are square and scale appropriately
6. Create a simple main.ts entry point that confirms both canvases are accessible

Write tests first for:
- Canvas element creation and sizing
- TypeScript compilation with strict mode
- Basic module loading

The HTML should have:
- A container div with two canvas elements (id="editorCanvas" and id="renderCanvas")
- A controls section above the canvases for future UI elements

CSS should ensure:
- Canvases maintain 1:1 aspect ratio
- Responsive sizing that works on different screen sizes
- Side-by-side layout on desktop, stacked on mobile

Avoid classes - use functional composition for all logic.
```

### Step 2: Scene Initialization Functions

```text
Create pure functions for scene initialization with proper setup and disposal.

Requirements:
1. Create src/editor/createEditorScene.ts with:
   - createEditorScene(canvas: HTMLCanvasElement) function
   - Returns scene configuration object with engine, scene, and dispose function
   - Uses functional composition for setup steps

2. Create src/render/createRenderScene.ts with similar structure

3. Create src/types/index.ts with shared interfaces:
   - SceneConfig interface
   - SceneState interface

4. Update main.ts to use these functions

Write tests first for:
- Scene creation function purity
- Engine creation and binding to canvas
- Proper cleanup via dispose function
- Error handling for missing canvas
- Immutable scene configuration

Functions should be pure where possible, with side effects isolated to setup/dispose.
```

### Step 3: Camera Setup Functions

```text
Implement pure functions for camera creation and configuration.

Requirements:
1. Create src/cameras/createOrthographicCamera.ts:
   - Pure function returning camera configuration
   - Position at (0, 20, 0) looking at origin
   - Configure projection to show 20x20 unit area
   - Flip X axis so +X points right in view

2. Create src/cameras/createPerspectiveCamera.ts:
   - Pure function for render view camera
   - ~60° FOV
   - Initial position at (0, 5, -10)
   - Look at origin

3. Create src/cameras/attachCamera.ts:
   - Function to attach camera to scene
   - Handle canvas aspect ratio

Write tests first for:
- Camera configuration objects
- Pure function behavior (same input = same output)
- Camera position and target calculations
- Orthographic projection parameters
- FOV and aspect ratio for perspective camera

Use functional composition to build camera configurations.
```

### Step 4: Room Creation Functions

```text
Create pure functions for room geometry generation.

Requirements:
1. Create src/constants.ts with:
   - ROOM_SIZE = 20
   - WALL_THICKNESS = 0.2
   - ROOM_HALF = 10

2. Create src/geometry/createRoom.ts with:
   - createFloor() function returning mesh configuration
   - createCeiling() function
   - createWall(position, rotation, name) function
   - createRoom() function composing all parts
   - Each returns immutable mesh configuration objects

3. Create src/materials/createMatteMaterial.ts

Write tests first for:
- Room dimension calculations
- Wall positioning and orientation
- Material creation
- Mesh configuration immutability
- Function composition

Use functional programming patterns - no mutation, pure functions where possible.
```

### Step 5: Cube Creation

```text
Create pure functions for the interactive cube with face coloring.

Requirements:
1. Create src/geometry/createCube.ts with:
   - Face color mapping constants
   - createCubeFaces() function for geometry
   - applyCubeColors() function for materials
   - createCube() composition function
   - Returns immutable cube configuration

2. Face colors (Rubik's style):
   - Top (+Y): White
   - Bottom (-Y): Yellow  
   - Front (+Z): Green
   - Back (-Z): Blue
   - Right (+X): Red
   - Left (-X): Orange

Write tests first for:
- Cube dimensions (2x2x2)
- Face color mapping
- Mesh configuration immutability
- Pickable flag in configuration
- Initial position at origin

Use functional composition, avoid classes and mutation.
```

### Step 6: Camera Rig Functions

```text
Create functional camera rig system with visual indicator.

Requirements:
1. Create src/editor/createCameraRig.ts with:
   - createRigNode() function returning TransformNode config
   - createConeIndicator() function for visual
   - composeCameraRig() function combining both
   - Initial position at (0, 0, -5)
   - Non-pickable configuration

2. Create src/render/syncCameraWithRig.ts:
   - Pure function to calculate camera transform from rig
   - Returns new camera position/rotation

Write tests first for:
- TransformNode configuration
- Initial position and rotation
- Cone indicator properties
- Non-pickable configuration
- Camera transform calculations

Maintain immutability - functions return new configurations.
```

### Step 7: Selection State Management

```text
Implement functional selection state management.

Requirements:
1. Create src/state/selectionState.ts with:
   - SelectionState interface (immutable)
   - createInitialSelectionState() function
   - selectObject(state, objectId) pure function
   - clearSelection(state) pure function
   - isSelected(state, objectId) selector

2. Create src/editor/handlePicking.ts:
   - createPickHandler(scene) returns event handler
   - Uses functional composition for pick logic

3. Create src/effects/highlightEffect.ts:
   - applyHighlight(scene, objectId) function
   - removeHighlight(scene, objectId) function

Write tests first for:
- Immutable state updates
- Pure function behavior
- Selection state transitions
- Highlight effect application
- Event handler composition

Use Redux-like patterns for state management.
```

### Step 8: Position Transform Functions

```text
Add functional position transformation with constraints.

Requirements:
1. Create src/transforms/positionTransforms.ts:
   - snapToGrid(value: number, gridSize: number) pure function
   - clampPosition(position: Vector3, limit: number) pure function
   - applyPositionConstraints() composition function

2. Create src/gizmos/createPositionGizmo.ts:
   - Returns gizmo configuration
   - X and Z axes only
   - Integrates constraint functions

3. Create src/state/transformState.ts:
   - Transform state management functions
   - Pure state updaters

Write tests first for:
- Grid snapping calculations (1 unit)
- Position clamping (±8 units)
- Constraint composition
- State immutability
- Gizmo configuration

All functions must be pure with no side effects.
```

### Step 9: Rotation Transform Functions

```text
Add functional rotation transformation with angle snapping.

Requirements:
1. Create src/transforms/rotationTransforms.ts:
   - snapToAngle(radians: number, snapDegrees: number) pure function
   - wrapAngle(radians: number) pure function
   - applyRotationConstraints() composition

2. Extend gizmo functions:
   - createRotationGizmo() function
   - Y-axis only configuration
   - 15-degree snapping

3. Create src/gizmos/gizmoSwitcher.ts:
   - Functional gizmo mode switching

Write tests first for:
- Angle snapping calculations (15°)
- Angle wrapping (±180°)
- Pure function behavior
- Gizmo configuration
- Mode switching logic

Maintain functional purity throughout.
```

### Step 10: Ray Data Types and Generators

```text
Create immutable ray data structures and generation functions.

Requirements:
1. Create src/types/ray.ts with:
   - RaySegment interface (immutable)
   - Ray interface with segments array
   - CubeFace enum
   - Color mapping types

2. Create src/rays/generateRayOrigins.ts:
   - calculateFaceCenter(cube, face) pure function
   - generateOmniDirections() returns 8 directions
   - composeRayOrigins() combines calculations

3. Create src/rays/createInitialRays.ts:
   - Pure ray generation functions

Write tests first for:
- Immutable data structures
- 8-direction generation (45° apart)
- Face center calculations
- Direction vector normalization
- Pure function behavior

Use functional composition and immutable data.
```

### Step 11: Ray-Plane Intersection Functions

```text
Implement pure mathematical functions for ray-wall intersections.

Requirements:
1. Create src/math/rayIntersection.ts:
   - rayPlaneIntersection(ray, plane) pure function
   - Returns intersection point or null
   - No side effects

2. Create src/geometry/wallPlanes.ts:
   - createWallPlane(position, normal) function
   - getRoomPlanes() returns all planes

3. Create src/rays/findIntersection.ts:
   - findNearestIntersection() pure function
   - Returns intersection and wall data

Write tests first for:
- Ray-plane intersection mathematics
- Edge cases (parallel rays, behind origin)
- Nearest intersection selection
- Pure function properties
- Immutable return values

All math functions must be pure with no dependencies.
```

### Step 12: Ray Visualization Functions

```text
Create functional ray visualization system.

Requirements:
1. Create src/visualization/createRayMesh.ts:
   - raySegmentToLine(segment) returns line configuration
   - applySegmentColor(config, color) pure function
   - calculateSegmentAlpha(index, total) pure function

2. Create src/visualization/rayVisualizer.ts:
   - createRayVisualization(rays, scene) function
   - Returns visualization configuration
   - Handles visibility state

3. Alpha fade formula: α = 1 - 0.333 * t

Write tests first for:
- Line mesh configuration
- Color application
- Alpha calculations
- Visibility state handling
- Configuration immutability

Use functional composition for visualization pipeline.
```

### Step 13: Ray Reflection Functions

```text
Implement pure reflection mathematics and bounce logic.

Requirements:
1. Create src/math/reflection.ts:
   - calculateReflection(incident, normal) pure function
   - Returns reflected direction vector

2. Create src/rays/traceRay.ts:
   - traceRayWithBounces(origin, direction, maxBounces) function
   - Returns array of ray segments
   - Handles mirror vs matte surfaces

3. Create src/rays/rayTracer.ts:
   - Compose full ray tracing pipeline
   - Pure functional approach

Write tests first for:
- Reflection vector mathematics
- Bounce counting logic
- Mirror detection
- Ray termination conditions
- Segment array generation

Maintain mathematical purity - no side effects.
```

### Step 14: Mirror Configuration Functions

```text
Create functional mirror setup for walls.

Requirements:
1. Create src/mirrors/createMirrorTexture.ts:
   - createMirrorConfig(wall, scene) function
   - Returns mirror texture configuration
   - Calculates reflection plane

2. Create src/mirrors/applyMirrors.ts:
   - applyMirrorToWall(wall, mirrorConfig) function
   - Functional material application

3. Configure north, east, west walls only

Write tests first for:
- Mirror texture configuration
- Reflection plane calculations
- Material application
- Wall identification
- Configuration immutability

Use declarative configuration approach.
```

### Step 15: Recursive Mirror Functions

```text
Implement functional recursive mirror reflections.

Requirements:
1. Create src/mirrors/chainMirrors.ts:
   - createMirrorChain(level) pure function
   - Returns chained configuration
   - Maximum 4 levels

2. Create src/mirrors/mirrorManager.ts:
   - Functional mirror state management
   - updateMirrorLevel(state, level) function
   - Pure state transitions

3. Dynamic level adjustment functions

Write tests first for:
- Chained configuration generation
- Level capping at 4
- State immutability
- Performance characteristics
- Memory efficiency

Use functional recursion patterns.
```

### Step 16: UI Component Functions

```text
Create functional UI components.

Requirements:
1. Create src/ui/createControls.ts:
   - createSlider(id, min, max, value) function
   - createDropdown(id, options, value) function
   - createButton(id, text) function
   - Each returns DOM configuration

2. Create control panel:
   - Rays slider (0-8, default 4)
   - Bounces slider (1-5, default 2)
   - Quality dropdown (Low/Medium/High)
   - Reset button

Write tests first for:
- Control creation functions
- Initial value setting
- DOM structure
- Event handler attachments
- Accessibility attributes

Use functional DOM manipulation patterns.
```

### Step 17: UI State Binding

```text
Create functional UI-to-state binding system.

Requirements:
1. Create src/ui/bindControls.ts:
   - bindSliderToState(slider, updater) function
   - bindDropdownToState(dropdown, updater) function
   - Returns unbind functions

2. Create src/state/uiState.ts:
   - UI state interface
   - Pure state update functions
   - State-to-scene synchronization

3. Implement reactive updates

Write tests first for:
- Event binding functions
- State update propagation
- Unbind cleanup
- Value validation
- Pure update functions

Use functional reactive patterns.
```

### Step 18: Application State Composition

```text
Create unified state management system.

Requirements:
1. Create src/state/appState.ts:
   - AppState interface combining all states
   - createInitialState() function
   - State reducer functions
   - Selector functions

2. Create src/state/stateEffects.ts:
   - Effect functions for state changes
   - Scene synchronization
   - Pure effect descriptions

3. State includes:
   - Object transforms
   - Ray configuration
   - UI settings
   - Selection state

Write tests first for:
- State shape and initialization
- Reducer purity
- Selector functions
- Effect isolation
- State immutability

Follow Redux-like patterns functionally.
```

### Step 19: Scene File Loading

```text
Implement functional .babylon file loading.

Requirements:
1. Create src/loaders/babylonLoader.ts:
   - loadBabylonFile(path) async function
   - parseBabylonData(data) pure function
   - extractSceneState(sceneData) function

2. Create src/loaders/stateMapper.ts:
   - mapLoadedToAppState(loaded) function
   - Pure state transformation

3. Load from assets/lesson-1.babylon

Write tests first for:
- Async loading function
- Data parsing logic
- State extraction
- Error handling
- Pure mapping functions

Use functional error handling patterns.
```

### Step 20: Reset Function Composition

```text
Create functional reset system.

Requirements:
1. Create src/actions/reset.ts:
   - createResetAction() function
   - Composes all reset steps
   - Returns new initial state

2. Create src/effects/resetEffects.ts:
   - Scene reset effects
   - UI reset effects
   - File reload trigger

3. Handle loading states functionally

Write tests first for:
- Reset action creation
- State restoration
- Effect coordination
- Loading state handling
- Error recovery

Use functional action patterns.
```

### Step 21: Performance Functions

```text
Add functional performance optimizations.

Requirements:
1. Create src/utils/performance.ts:
   - createDebouncer(fn, delay) higher-order function
   - createThrottler(fn, limit) function
   - measureFPS() pure calculation

2. Apply to:
   - Ray visualization (250ms debounce)
   - Mirror updates
   - UI state changes

3. Hide rays during dragging

Write tests first for:
- Debounce timing behavior
- Throttle limiting
- FPS calculations
- HOF composition
- Drag state handling

Use functional programming patterns throughout.
```

### Step 22: Quality Settings Functions

```text
Implement render quality adjustment functions.

Requirements:
1. Create src/render/qualitySettings.ts:
   - QualityLevel type (Low | Medium | High)
   - calculateRenderSize(quality, baseSize) function
   - applyQualitySettings(scene, quality) function

2. Quality factors:
   - Low: 0.5
   - Medium: 0.75
   - High: 1.0

3. Update render target sizing

Write tests first for:
- Size calculations
- Quality application
- Scene updates
- Performance impact
- Pure functions

Maintain functional approach to configuration.
```

### Step 23: Error Boundary Functions

```text
Create functional error handling system.

Requirements:
1. Create src/errors/errorBoundary.ts:
   - wrapWithErrorBoundary(fn) HOF
   - Error state management
   - Recovery functions

2. Create src/errors/errorReporting.ts:
   - logError(error, context) function
   - User-friendly error messages

3. Apply to all async operations

Write tests first for:
- Error catching HOF
- Error state shape
- Recovery logic
- Logging behavior
- User messaging

Use functional error handling patterns.
```

### Step 24: Final Integration and Build

```text
Complete final integration with production build setup.

Requirements:
1. Create src/app.ts:
   - Compose all systems functionally
   - Initialize application
   - Export cleanup function

2. Configure Vite for production:
   - Optimization settings
   - Build output configuration
   - Asset handling

3. Add deployment configuration

Write tests first for:
- Full integration flow
- Initialization sequence
- Cleanup behavior
- Build output validation
- Cross-browser testing

Ensure all code follows functional principles.
```

## Implementation Notes

Each prompt should be implemented following TDD principles:
1. Write failing tests first
2. Implement minimal code to pass tests
3. Refactor while keeping tests green
4. Commit after each step

Key functional programming principles to follow:
- Prefer pure functions over classes
- Use immutable data structures
- Isolate side effects
- Use function composition
- Avoid mutation
- Declarative over imperative

The prompts are designed to build incrementally with no orphaned code. Each step integrates with previous work and prepares for future steps.

## Success Criteria

- All tests pass
- No TypeScript errors with strict mode
- ESLint and Prettier compliance
- Functional programming principles followed
- Smooth 60 FPS performance
- Works on modern browsers
- Responsive on different screen sizes