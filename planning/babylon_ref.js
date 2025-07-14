const createScene = function () {
  /* ======= USER-TWEAKABLE PARAMETERS ======= */
  let rayCount = 4; // 0-8
  let maxBounces = 5; // 1-5
  /* ========================================= */

  const scene = new BABYLON.Scene(engine);
  const canvas = engine.getRenderingCanvas();
  const GridMaterial = BABYLON.GridMaterial;

  /* ───── EDIT-CAMERA (orthographic) ───── */
  const ortho = new BABYLON.FreeCamera(
    'ortho',
    new BABYLON.Vector3(0, 25, 0),
    scene
  );
  ortho.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  ortho.setTarget(BABYLON.Vector3.Zero());

  ortho.rotation.z = -Math.PI; // ← flip X-axis so +X is right, –X is left

  const HALF = 10; // half-extent of the room
  const BORDER = 1; // extra world-units of padding

  const setOrtho = () => {
    const extent = HALF + BORDER; // HALF = 10  →  extent = 11
    ortho.orthoLeft = -extent;
    ortho.orthoRight = extent;
    ortho.orthoTop = extent;
    ortho.orthoBottom = -extent;
  };

  setOrtho();

  engine.onResizeObservable.add(setOrtho);
  ortho.viewport = new BABYLON.Viewport(0, 0, 1, 1);
  scene.activeCamera = ortho;

  /* ───── LIGHT ───── */
  new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);

  /* ——— ROOM (4 shaded walls, not pickable) ——— */
  const WALL_THICKNESS = 0.2;
  const wallMat = new BABYLON.StandardMaterial('wallMat', scene);
  wallMat.diffuseColor.set(0.5, 0.55, 0.5);
  wallMat.backFaceCulling = false;

  const mirrorMat = new BABYLON.StandardMaterial('mirrorMat', scene);
  mirrorMat.diffuseColor.set(0.55, 0.55, 1);

  const WALL_OFFSET = HALF - WALL_THICKNESS / 2; // 9.9  ⇒ inside face at ±10

  /* holds { plane: BABYLON.Plane, isMirror: boolean } for every wall */
  const WALL_PLANES = [];

  const makeWall = (name, position, rotY, isMirror) => {
    const w = BABYLON.MeshBuilder.CreateBox(
      name,
      { width: HALF * 2, depth: WALL_THICKNESS, height: HALF * 2 },
      scene
    );
    w.position.copyFrom(position);
    w.rotation.y = rotY;
    w.material = isMirror ? mirrorMat : wallMat;
    w.isPickable = false;

    /* outward normal */
    const mat = BABYLON.Matrix.RotationYawPitchRoll(rotY, 0, 0); // yaw → matrix
    const n = BABYLON.Vector3.TransformNormal(
      new BABYLON.Vector3(0, 0, -1),
      mat
    ).normalize();

    /* point on the plane, with Y forced to 0 (XZ slice) */
    const pPos = position.clone(); // Vector3
    pPos.y = 0;

    const plane = BABYLON.Plane.FromPositionAndNormal(pPos, n);
    WALL_PLANES.push({ plane, isMirror });
  };

  /* North (+Z) & South (–Z) */
  makeWall('north', new BABYLON.Vector3(0, HALF, WALL_OFFSET), Math.PI, true);
  makeWall('south', new BABYLON.Vector3(0, HALF, -WALL_OFFSET), 0, false);

  /* East (+X) & West (–X) */
  makeWall(
    'east',
    new BABYLON.Vector3(WALL_OFFSET, HALF, 0),
    -Math.PI / 2,
    true
  );
  makeWall(
    'west',
    new BABYLON.Vector3(-WALL_OFFSET, HALF, 0),
    Math.PI / 2,
    true
  );

  /* ----- Ground grid: major/minor lines ----- */
  const ground = BABYLON.MeshBuilder.CreateGround(
    'ground',
    { width: HALF * 2, height: HALF * 2, subdivisions: 40 },
    scene
  );
  ground.isPickable = false;

  const gridMat = new BABYLON.GridMaterial('gridMat', scene);
  gridMat.gridRatio = 1; // one minor division = 1 unit
  gridMat.majorUnitFrequency = 5; // every 4 units → major line
  gridMat.minorUnitVisibility = 0.25; // fade minor lines
  gridMat.lineColor.set(0.7, 0.7, 0.7); // minor lines (lighter grey)
  gridMat.mainColor.set(0.2, 0.2, 0.2); // background
  gridMat.backFaceCulling = false;

  ground.material = gridMat;

  /* ───── BOX with Rubik-style faces ───── */
  const box = BABYLON.MeshBuilder.CreateBox(
    'box',
    {
      size: 2,
      faceColors: [
        new BABYLON.Color4(0.0, 0.8, 0.0, 1), // front  +Z  green
        new BABYLON.Color4(0.0, 0.2, 1.0, 1), // back   –Z  blue
        new BABYLON.Color4(1.0, 0.0, 0.0, 1), // right  +X  red
        new BABYLON.Color4(1.0, 0.55, 0.0, 1), // left   –X  orange
        new BABYLON.Color4(1.0, 1.0, 1.0, 1), // top    +Y  white
        new BABYLON.Color4(1.0, 1.0, 0.0, 1), // bottom –Y  yellow
      ],
    },
    scene
  );

  box.position.set(0, 0.5, 3);

  box.enableEdgesRendering();
  box.edgesWidth = 4.0;
  box.edgesColor = new BABYLON.Color4(0, 0, 0);

  /* ───── CAMERA RIG, PIVOT & CONE ───── */
  const camRig = new BABYLON.TransformNode('camRig', scene); // moves (no rotation)
  camRig.position.set(0, 0, -3);

  /* aim the cone toward the box by rotating the pivot, not the rig */
  camRig.rotation.x = Math.PI / 2; // tip forward (+Z)
  camRig.rotation.z = Math.PI; // make edges parallel to scene

  /* pivot handles facing direction */
  const camPivot = new BABYLON.TransformNode('camPivot', scene);
  camPivot.parent = camRig;

  camPivot.rotation.y = Math.PI / 4; // make edges parallel to scene

  /* visible cone */
  const helper = BABYLON.MeshBuilder.CreateCylinder(
    'camera',
    {
      diameterTop: 0.5,
      diameterBottom: 2,
      height: 2,
      tessellation: 4,
    },
    scene
  );
  helper.parent = camPivot;
  // helper.position.y = 1;

  helper.material = new BABYLON.StandardMaterial('cMat', scene);
  helper.material.diffuseColor.set(0, 0.71, 1);
  helper.material.alpha = 0.5;

  helper.enableEdgesRendering();
  helper.edgesWidth = 4.0;
  helper.edgesColor = new BABYLON.Color4(0, 0.72, 1);

  helper.isPickable = true;

  /* ───── GIZMOS ───── */
  const gm = new BABYLON.GizmoManager(scene);
  gm.attachableMeshes = [box, helper];

  /* clear selection on empty pointer-down */
  gm.clearGizmoOnEmptyPointerEvent = true;

  /* bootstrap once so gizmo sub-objects exist */
  gm.attachToMesh(box);

  /* ── TRANSLATE ── */
  gm.positionGizmoEnabled = true; // arrows visible
  gm.gizmos.positionGizmo.snapDistance = 1; // 1-unit grid
  gm.gizmos.positionGizmo.yGizmo.isEnabled = false; // lock Y-move
  gm.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh = false; // world-aligned

  /* ---------- hard-stop limits ---------- */
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  /* hard-stop any selected object (box) or the camera rig (via cone) */
  const limitToRoom = (mesh) => {
    // if we’re dragging the cone, clamp the rig instead
    const target = mesh === helper ? camRig : mesh;

    const xBefore = target.position.x;
    const zBefore = target.position.z;

    target.position.x = clamp(xBefore, -8, 8);
    target.position.z = clamp(zBefore, -8, 8);

    /* if clamped, freeze the drag plane so the arrow stops instantly */
    if (target.position.x !== xBefore || target.position.z !== zBefore) {
      currentDragBehavior.dragPlanePosition.copyFrom(
        target === camRig ? camRig.position : mesh.position
      );
    }
  };

  /* normalise any angle to the interval [-π , π) */
  function clampYaw(mesh) {
    /* if you ever switch to quaternions, convert here first */
    let y = mesh.rotation.y; // current radians
    y = ((y + Math.PI) % (2 * Math.PI)) - Math.PI; // wrap
    mesh.rotation.y = y;
  }

  /* attach limiter to the active axis drag behaviors */
  let currentDragBehavior = null; // keeps reference for limitToRoom()

  ['xGizmo', 'zGizmo'].forEach((axisName) => {
    const axisGizmo = gm.gizmos.positionGizmo[axisName];
    const db = axisGizmo.dragBehavior;

    /* remember which behavior is firing (needed inside limitToRoom) */
    db.onDragStartObservable.add(() => {
      if (gm.attachedMesh === box) raysParent.setEnabled(false);
      currentDragBehavior = db;
    });

    db.onDragEndObservable.add(() => {
      currentDragBehavior = null;
      if (gm.attachedMesh === box) {
        rebuildRays();
        raysParent.setEnabled(true);
      }
    });

    db.onDragObservable.add(() => {
      if (gm.attachedMesh) limitToRoom(gm.attachedMesh);
    });
  });

  /* ── ROTATE ── */
  gm.rotationGizmoEnabled = true; // Y-ring visible
  gm.gizmos.rotationGizmo.snapDistance = BABYLON.Tools.ToRadians(15);
  gm.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh = false; // world-aligned
  gm.gizmos.rotationGizmo.xGizmo.isEnabled = false; // hide X ring
  gm.gizmos.rotationGizmo.zGizmo.isEnabled = false; // hide Z ring

  /* --- limit Y-rotation to −180 … 180 degrees ---------------- */
  const yDrag = gm.gizmos.rotationGizmo.yGizmo.dragBehavior;

  yDrag.onDragEndObservable.add(() => {
    if (!gm.attachedMesh) return;

    /* wrap any angle into [−π , π) */
    let y = gm.attachedMesh.rotation.y;
    y = ((y + Math.PI) % (2 * Math.PI)) - Math.PI;
    gm.attachedMesh.rotation.y = y;

    /* keep rays lined up when the cube is selected */
    if (gm.attachedMesh === box) rebuildRays();
  });

  /* start with nothing selected */
  gm.attachToMesh(null);

  /* click-to-select */
  scene.onPointerObservable.add((ev) => {
    console.log({ ev });
    if (ev.type !== BABYLON.PointerEventTypes.POINTERPICK) return;

    const pick = scene.pick(scene.pointerX, scene.pointerY, (m) =>
      gm.attachableMeshes.includes(m)
    );

    if (!pick.hit) {
      gm.attachToMesh(null);
      return;
    }

    /* if helper clicked, steer gizmo to the rig instead */
    const target = pick.pickedMesh === helper ? camRig : pick.pickedMesh;
    gm.attachToMesh(target);
  });

  /* keep Y locked */
  scene.onBeforeRenderObservable.add(() => {
    if (box) box.position.y = 0.5;
    if (camRig) camRig.position.y = 0; // rig base on ground
  });

  /* ════════════════  MIRROR-RAY VISUALISER  ════════════════ */
  /* Precompute infinite planes that match the four walls */
  const wallPlanes = [
    BABYLON.Plane.FromPositionAndNormal(
      new BABYLON.Vector3(0, 0, HALF),
      new BABYLON.Vector3(0, 0, -1)
    ), // north
    BABYLON.Plane.FromPositionAndNormal(
      new BABYLON.Vector3(0, 0, -HALF),
      new BABYLON.Vector3(0, 0, 1)
    ), // south
    BABYLON.Plane.FromPositionAndNormal(
      new BABYLON.Vector3(HALF, 0, 0),
      new BABYLON.Vector3(-1, 0, 0)
    ), // east
    BABYLON.Plane.FromPositionAndNormal(
      new BABYLON.Vector3(-HALF, 0, 0),
      new BABYLON.Vector3(1, 0, 0)
    ), // west
  ];

  /* parent node so we can dispose/rebuild rays quickly */
  let raysParent = new BABYLON.TransformNode('raysParent', scene);

  /* Rebuild rays */
  function rebuildRays() {
    /* face-hue map (Rubik order) */
    const FACE_COLOR = {
      front: new BABYLON.Color3(0.48, 1, 0), // +Z  green
      back: new BABYLON.Color3(0, 0.72, 1), // –Z  blue
      right: new BABYLON.Color3(1, 0, 0.92), // +X  red
      left: new BABYLON.Color3(1, 0.85, 0), // –X  orange
    };

    raysParent.dispose(false, true); // clear previous lines
    const origin = box.getAbsolutePosition().clone(); // ← always the cube
    origin.y += 0.01; // sit above the ground

    raysParent = new BABYLON.TransformNode('raysParent', scene);

    for (let i = 0; i < rayCount; i++) {
      /* 1. base directions in cube-local space */
      const localAngle = (i / rayCount) * Math.PI * 2; // 0 .. 2π
      const localDir = new BABYLON.Vector3(
        Math.cos(localAngle),
        0,
        Math.sin(localAngle)
      );

      /* --- pick colour based on which face this localDir points through --- */
      let rayHue;
      if (Math.abs(localDir.x) >= Math.abs(localDir.z)) {
        rayHue = localDir.x >= 0 ? FACE_COLOR.right : FACE_COLOR.left;
      } else {
        rayHue = localDir.z >= 0 ? FACE_COLOR.front : FACE_COLOR.back;
      }

      /* 2. transform by cube’s rotation quaternion (world orientation) */
      const worldDir = BABYLON.Vector3.TransformNormal(
        localDir,
        box.getWorldMatrix() // ← includes full rotation, never collapses
      ).normalize();

      let pos = origin.clone();
      let dir = worldDir.clone();

      const points = [pos.clone()];

      for (let b = 0; b < maxBounces; b++) {
        const ray = new BABYLON.Ray(pos, dir, 1000);

        /* find nearest hit among wall planes */
        let minDist = Infinity,
          hitPoint = null,
          hitNormal = null,
          hitMirror = false;
        WALL_PLANES.forEach(({ plane, isMirror }) => {
          const t = ray.intersectsPlane(plane);
          if (t !== null && t < minDist) {
            minDist = t;
            hitPoint = ray.origin.add(ray.direction.scale(t));
            hitNormal = plane.normal;
            hitMirror = isMirror;
          }
        });
        if (!hitPoint) break; // should never happen

        points.push(hitPoint.addInPlaceFromFloats(0, 0.01, 0)); // store & lift

        if (!hitMirror) break; // stop; this wall isn’t reflective

        /* otherwise reflect and continue */
        dir = BABYLON.Vector3.Reflect(dir, hitNormal).normalize();
        pos = hitPoint.add(dir.scale(0.001));
      }

      /* split the poly-line into segments so we can vary alpha per segment */
      const segCount = points.length - 1; // ≥ 1
      const denom = Math.max(1, segCount - 1); // avoid 0

      for (let s = 0; s < segCount; s++) {
        const seg = BABYLON.MeshBuilder.CreateLines(
          `ray${i}_seg${s}`,
          {
            points: [points[s], points[s + 1]],
            useVertexAlpha: true,
          },
          scene
        );

        /* colour & alpha */
        const t = s / denom; // 0 → 1, always finite
        seg.color = rayHue; // hue chosen earlier
        seg.alpha = 1 - 0.333 * t; // 1 → 0.667 (1 seg) or 1→0.1 (≥ 4 seg)
        seg.parent = raysParent;
      }
    }
  }

  /* Hook into UI — slider changes */
  const bounceSlider = document.getElementById('bounceSlider'); // <input type=range>
  if (bounceSlider) {
    bounceSlider.addEventListener('input', (e) => {
      maxBounces = BABYLON.Scalar.Clamp(parseInt(e.target.value), 1, 5);
      if (gm.attachedMesh === box) rebuildRays();
    });
  }

  if (gm.attachedMesh === box) rebuildRays();

  /* Hook into drag END so we only recompute after user releases */
  gm.gizmos.positionGizmo.xGizmo.dragBehavior.onDragEndObservable.add(() => {
    if (gm.attachedMesh === box) rebuildRays();
  });
  gm.gizmos.positionGizmo.zGizmo.dragBehavior.onDragEndObservable.add(() => {
    if (gm.attachedMesh === box) rebuildRays();
  });
  gm.gizmos.rotationGizmo.yGizmo.dragBehavior.onDragEndObservable.add(() => {
    if (gm.attachedMesh === box) rebuildRays();
  });

  /* Recompute whenever selection changes — cube only */
  gm.onAttachedToMeshObservable.add((mesh) => {
    if (mesh === box) {
      raysParent.setEnabled(true); // show
      rebuildRays(box.getAbsolutePosition());
    } else {
      raysParent.setEnabled(false); // hide for camera or none
    }
  });

  return scene;
};
