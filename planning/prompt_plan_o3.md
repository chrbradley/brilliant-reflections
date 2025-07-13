# Prompt-Plan (o3 edition)  
*A step-by-step, test-driven blueprint for implementing the Babylon.js “Mirror-Room” proof-of-concept.*

---

## 0  Ground Rules for Code-Gen Prompts
* Use **TypeScript strict**.  
* Follow the coding style enforced by the shared **ESLint + Prettier** config.  
* One commit (and one test‐green run) per prompt.  
* When adding or changing files, always show the **full absolute path** from the repo root.  
* Tests first: each feature PR adds or extends Vitest specs.  
* No TODOs left behind — everything you create must be compiled, lint-clean and test-passing.  
* Keep prompts self-sufficient: every prompt restates any context a model needs.  
* Avoid giant jumps; each prompt should be completable in ≤ 20 LOC of *new* code on average.

---

## 1  High-Level Implementation Roadmap

| Phase | Goal | Key Artifacts |
|-------|------|---------------|
| P0 | Project scaffold & config | `vite.config.ts`, `tsconfig.json`, ESLint/Prettier, minimal `index.html` with two empty canvases |
| P1 | Viewport layout & resize logic | `src/ui/layout.ts`, CSS grid/flex rules |
| P2 | Babylon bootstrap & default scene loader | `src/babylon/sceneLoader.ts`, local `assets/lesson-1.babylon` |
| P3 | Interactive gizmos (translate+rotate) with grid/angle snap | `src/interaction/gizmos.ts` + unit helpers |
| P4 | Hard-stop movement & yaw clamp | physics utils tests |
| P5 | Omni-ray visualiser + Rubik face colours | `src/visualiser/rays.ts` |
| P6 | Mirror/ matte wall rules & selective bounce | extend rays + tests |
| P7 | Right-hand render viewport with MirrorTexture chain (≤ 4) | `src/render/renderScene.ts` |
| P8 | Camera rig ↔ render-cam sync | observer wiring |
| P9 | Controls: **rays slider**, **bounce slider**, **quality select**, **reset** | `src/ui/controls.tsx` (plain TS DOM for PoC) |
| P10 | Debounced render update (250 ms) & perf warning stub | `src/utils/throttle.ts` |
| P11 | Vitest coverage for math helpers + throttler | `tests/` |
| P12 | Vercel deploy config & README quick-start | `vercel.json`, `README.md` |

Each phase will be split into “bite-size” prompts below.

---

## 2  Bite-Size Prompt Sequence

Below each code-block is a **prompt** meant to be fed to a code-generation LLM such as OpenAI o3.  
You’ll run them in order; when code compiles & tests pass, move to the next.

### Prompt 0 — Scaffold repo

```text
You are given an empty Git repo.  
Create project scaffolding for a Vite + TypeScript (strict) web app:

• Initialise `package.json` with scripts:
  - dev, build, preview, lint, format, test
• Add `vite.config.ts` (plain, root served).
• Configure `tsconfig.json` with `"strict": true`, `"module": "ESNext"`.
• Add ESLint config extending `eslint:recommended`, `@typescript-eslint/recommended`.
• Add Prettier config (two-space indent).
• Install Babylon.js 8.16.1 as dependency.
• Add Vitest with JS DOM environment.
• Commit baseline.

No runtime code yet — just config files.  
Show full paths and file contents.
```
### Prompt 1 — HTML shell & square viewports
```text
Add `index.html` with two side-by-side square canvases (`id="learner"` and `id="render"`).  
Use flexbox (or CSS Grid) so each canvas always remains a square equal to `min(50vw, 90vh)`.  
Include `<script type="module" src="/src/main.ts"></script>`.  

Create `src/main.ts` that:
• Looks up both canvas elements.
• Instantiates a Babylon `Engine` for EACH canvas (separate scenes for now).
• Adds a simple render loop with `engine.runRenderLoop`.

Write a Vitest DOM test that ensures both canvases exist and have equal width/height after calling the layout helper.  
Paths & file contents please.
```

### Prompt 2 — Load default .babylon into learner-scene
```text
Extend `src/main.ts`:

1. Replace dummy scene with real orthographic “learner” scene loaded from `/assets/lesson-1.babylon`.  
   Use `SceneLoader.AppendAsync` and once loaded:
   • Set active camera to the file’s `editCamera` (if present) else create FreeCamera top-down.
   • Ensure gizmos & grid snapping are NOT wired yet.

2. Keep the right canvas scene empty for now.

Add `assets/lesson-1.babylon` (copy the raw file).

Write Vitest that mocks `SceneLoader.AppendAsync` and asserts `Scene` gets at least one mesh.

Paths & file contents.
```

### Prompt 3 — Gizmo manager with translate/rotate snap
```text
Implement `src/interaction/gizmos.ts` that:

• Accepts (scene, box mesh, camera helper mesh) and wires a `GizmoManager`:
  – Position snap 1 unit, lock Y arrow.
  – Rotation snap 15° (π/12), show only Y ring.
• Exports helper to attach/detach.

Call this from `main.ts` after scene load.

Add unit test for helper: given fake meshes, it sets `snapDistance` & disabled axes.

Paths & file contents.
```

### Prompt 4 — Movement hard-stop & yaw clamp
```text
Create `src/interaction/limits.ts` exporting:

`limitPosition(mesh, minX, maxX, minZ, maxZ)`
`wrapYaw(mesh) // clamp to [-π, π)`

Unit-test both.

Integrate into `gizmos.ts` drag behaviours (reuse code from reference scene).
```

### Prompt 5 — Ray visualiser (single bounce) stub
```text
Create `src/visualiser/rays.ts` exporting `rebuildRays(scene, box, opts)`.

For now:
• Only draw `opts.rayCount` rays, 1 bounce, no colouring.
• Use hard-coded green colour.

Hook into gizmo attach/detach & drag-end (via callback from `gizmos.ts`).

Add Vitest: given mock wall planes, returns an array of `Vector3[]` with expected length.

Paths & code.
```

### Prompt 6 — Multi-bounce & mirror filtering + face hue
```text
Enhance `rays.ts`:

• Accept `maxBounces`, `mirrorPlanes[]`.
• Stop reflecting when plane is non-mirror.
• Map ray hue to cube face per Rubik rules.
• Split into segments and fade alpha (1 → 0.667 / 0.1).

Add tests for hue mapping & bounce termination logic (pure math).

Update main wiring to pass mirrors array from scene.

Paths & code.
```

### Prompt 7 — Right-hand render scene (1st-bounce MirrorTexture chain)
```text
Create `src/render/renderScene.ts` that:

• Builds a new Babylon `Scene` bound to the render canvas and clones
  meshes from learner scene (share geometry).
• For each mirror wall, attaches `MirrorTexture` (size factor 0.5) and
  sets `renderList` to include cube and walls recursively.
• Chains reflections up to **4** by nesting mirror cameras (documented trick).

• Syncs render camera position & yaw from `camRig` each frame.

Unit test: fake scene, ensure mirror textures created for `isMirror` walls.

Integrate into `main.ts` after learner scene load.

Paths & code.
```

### Prompt 8 — Quality dropdown wiring
```text
Add `<select id="quality"><option>low</option>…</select>` under render canvas.

Quality → render target scale:
low 0.5, medium 1.0, high 2.0.

Listen to change → recreate MirrorTextures with new ratio (call helper in renderScene).

Vitest: given “high”, texture size ratio = 2.

Paths & code.
```

### Prompt 9 — Rays & bounce sliders + debounced rebuild
```text
Add two inputs under learner canvas:
• `#raySlider` (0–8)
• `#bounceSlider` (1–5)

Bind to `rays.ts`, using a 250 ms debounce (`src/utils/throttle.ts`; unit-test throttle).

Ensure learner rebuild triggers right-scene re-render (cam sync already does).

Paths & code.
```

### Prompt 10 — Reset button
```text
Add `#resetBtn`.  
On click:
1. Dispose both scenes.
2. Reload default .babylon via existing loader.
3. Reset sliders to defaults.

No persistence.

Update README quick-start with “npm run dev”.

Paths & code.
```

### Prompt 11 — Deploy config
```text
Add `vercel.json` with `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`.

Ensure `npm run build` outputs to `dist/`.

Add section to README:  
“1-click deploy to Vercel (free) or GitHub Pages”.

Paths & code.
```