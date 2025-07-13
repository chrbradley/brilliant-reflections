
# Mirror Room Reflection Interactive – Specification

## 1. Purpose & Scope
Create a browser-based proof-of-concept (PoC) that teaches geometric reasoning through mirror reflections.  
The learner manipulates a **cube** (default geometry) and a **camera rig** inside a 3-wall mirrored room, observes omni-directional rays in a top-down editor view, and simultaneously sees a real-time render that honours the same number of reflection bounces.

This spec consolidates all agreed-upon requirements, architecture decisions, and implementation notes.

---

## 2. High-Level Features
| ID | Feature | Priority |
|----|---------|----------|
| F-1 | **Dual Babylon.js canvases** (square; responsive) – editor (left) & render (right) | High |
| F-2 | **Top-down orthographic editor**: translate ±X/±Z, rotate Y; snap 1 unit / 15° | High |
| F-3 | **Omni-rays** (0-8) with up to **maxBounces** (1-5) segments, coloured by cube face | High |
| F-4 | **Real-time perspective render** that reflects exactly `maxBounces` mirrors | High |
| F-5 | Quality dropdown (low 50 %, medium 75 %, high 100 %) for render canvas | Medium |
| F-6 | UI controls: rays slider, bounces slider, quality selector, reset button | Medium |
| F-7 | Scene state loaded from **`assets/lesson-1.babylon`** (author-generated) | High |
| F-8 | Reset reloads default `.babylon` file | High |
| F-9 | FPS safeguard: re-render debounced (250 ms after interaction stop) | Medium |
| F-10| MIT-licensed, TS (strict) + ESLint + Prettier, built with **Vite** | High |

---

## 3. Detailed Behaviour

### 3.1 Editor (left canvas)
* **Camera**: orthographic, looks down -Y; flipped so +X points right.  
* **Room**: 20 × 20 units footprint (`HALF = 10`); walls 0.2 units thick.  
  * Mirrors = north, east, west.  
  * South wall matte. Floor/ceiling matte.  
* **Cube**: 2 units, Rubik-style face colours:  
  | Face | Axis | Colour |
  |------|------|--------|
  | Top  | +Y | White |
  | Bottom | –Y | Yellow |
  | Front | +Z | Green |
  | Back | –Z | Blue |
  | Right | +X | Red |
  | Left  | –X | Orange |
* **Camera Rig**: non-pickable `TransformNode` at y = 0 with cone helper.
* **Gizmos**  
  * Position: snap 1 unit; X & Z arrows only; hard-clamp to ±8 units.  
  * Rotation: snap 15°; Y ring only; yaw wrapped to [-180°, 180°].  
* **Ray visualiser**  
  * Shown only when cube selected, hidden during drag (re-shown after 250 ms debounce).  
  * Colours inherit emitting cube face.  
  * Non-mirror hit terminates ray; mirror hit reflects and continues until `maxBounces` reached.  
  * Alpha fades per segment: `α = 1 – 0.333 · t`, `t` = segment index / (maxSeg-1).

### 3.2 Render (right canvas)
* **Camera**: positioned/rotated from editor rig (yaw only).  
  * FOV chosen to encompass room at any rig location (≈ 60°).  
* **Mirrors**: Babylon `MirrorTexture` chain up to **4** reflections (cap).  
* **Lighting**: single emissive-ceiling **AreaLight** approximation.  
  * Shadows/SSAO omitted for PoC, noted as stretch goals.  
* **Quality dropdown** sets render-target size factor (0.5 / 0.75 / 1.0).

---

## 4. File/Asset Conventions
```
assets/
 └─ lesson-1.babylon     # default PoC scene
src/
 ├─ main.ts              # Vite entry, creates canvases & UI
 ├─ editor/              # left-view code
 ├─ render/              # right-view code
 ├─ utils/               # helpers (rayTracer, clamp, debounce…)
 └─ types/
```
* On **Reset** the loader re-imports `assets/lesson-1.babylon`.

---

## 5. Build & Dev

1. `pnpm i` (or `npm i`)  
2. `pnpm dev` – Vite dev server with HMR, ESLint + Prettier on save  
3. `pnpm build` – production build output to `/dist`  

### Deployment
* **Vercel**: import repo → build command `pnpm build` → output `dist`.

---

## 6. Stretch Goals
* Automatic FPS monitor → show “Performance: drop quality?” banner if < 30 FPS.  
* HUD overlay of current rays/bounces/quality.  
* Multiple lesson scenes (`lesson-2.babylon`, …) loaded via URL param.  
* Undo / Redo stack (drag history).

---

## 7. Code guidelines
#### Functional & Declarative Programming:
- Prioritize pure functions, immutability, and composition.
- Avoid classes and object-oriented patterns where functional alternatives exist.
- Favor declarative approaches over imperative ones.

#### TypeScript Everywhere:
- Enforce strong type safety for all code.
- Prefer interfaces over types for object shapes.
- Utilize TypeScript features like generics, utility types, and type inference effectively.

#### Vite Optimization:
- Leverage Vite's fast HMR and build capabilities.
- Optimize imports and exports for efficient bundling.
- Consider Vite-specific configurations for development and production.

#### Code Style & Structure:
- Implement consistent naming conventions for variables, functions, and files.
- Organize files logically, grouping related components, helpers, and types.
- Favor named exports for better modularity.
- Utilize early returns and guard clauses for improved readability and error handling.
Error Handling & Validation:
- Handle errors gracefully and proactively.
Validate inputs and outputs to ensure data integrity.
- Implement robust error reporting and logging mechanisms.

#### Testing & Automation:
- Emphasize automated testing (unit, integration, end-to-end).
- Integrate testing into the development workflow.

---

## 8. License
```text
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction...
```

_End of specification._
