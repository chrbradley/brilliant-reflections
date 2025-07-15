import { describe, it, expect, vi } from 'vitest';
import {
  createSelectionEffect,
  createTransformEffect,
  createRayUpdateEffect,
  createQualityEffect,
  createResetEffect,
  applyStateEffects,
  type StateEffect,
  type EffectContext,
} from './stateEffects';
import { createInitialAppState, updateAppState, type AppState } from './appState';
import { Vector3, Scene, Mesh } from 'babylonjs';

describe('stateEffects', () => {
  const createMockContext = (): EffectContext => ({
    editorScene: {
      getMeshByName: vi.fn(),
    } as any,
    renderScene: {
      getMeshByName: vi.fn(),
      materials: [],
    } as any,
    gizmoManager: {
      attachToMesh: vi.fn(),
    } as any,
    rayManager: {
      updateRays: vi.fn(),
      showRays: vi.fn(),
      hideRays: vi.fn(),
    } as any,
    applyHighlight: vi.fn(),
    removeHighlight: vi.fn(),
  });

  describe('createSelectionEffect', () => {
    it('should create effect for object selection', () => {
      const oldState = createInitialAppState();
      const newState = updateAppState(oldState, {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });

      const effect = createSelectionEffect(oldState, newState);

      expect(effect).toBeDefined();
      expect(effect.type).toBe('selection');
      expect(effect.execute).toBeDefined();
    });

    it('should execute selection effect', () => {
      const context = createMockContext();
      const mockMesh = new Mesh('colorCube', null);
      context.editorScene.getMeshByName.mockReturnValue(mockMesh);

      const oldState = createInitialAppState();
      const newState = updateAppState(oldState, {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });

      const effect = createSelectionEffect(oldState, newState);
      effect.execute(context);

      expect(context.applyHighlight).toHaveBeenCalledWith(
        context.editorScene,
        'colorCube'
      );
      expect(context.gizmoManager.attachToMesh).toHaveBeenCalledWith(mockMesh);
    });

    it('should handle deselection', () => {
      const context = createMockContext();
      const initial = createInitialAppState();
      const selected = updateAppState(initial, {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });
      const deselected = updateAppState(selected, {
        type: 'CLEAR_SELECTION',
      });

      const effect = createSelectionEffect(selected, deselected);
      effect.execute(context);

      expect(context.removeHighlight).toHaveBeenCalledWith(
        context.editorScene,
        'colorCube'
      );
      expect(context.gizmoManager.attachToMesh).toHaveBeenCalledWith(null);
    });
  });

  describe('createTransformEffect', () => {
    it('should create effect for position update', () => {
      const oldState = createInitialAppState();
      const newState = updateAppState(oldState, {
        type: 'UPDATE_POSITION',
        payload: { objectId: 'colorCube', position: new Vector3(1, 2, 3) },
      });

      const effect = createTransformEffect(oldState, newState);

      expect(effect).toBeDefined();
      expect(effect.type).toBe('transform');
    });

    it('should execute transform effect', () => {
      const context = createMockContext();
      const editorMesh = new Mesh('colorCube', null);
      const renderMesh = new Mesh('colorCube', null);
      
      context.editorScene.getMeshByName.mockReturnValue(editorMesh);
      context.renderScene.getMeshByName.mockReturnValue(renderMesh);

      const oldState = createInitialAppState();
      const position = new Vector3(1, 2, 3);
      const newState = updateAppState(oldState, {
        type: 'UPDATE_POSITION',
        payload: { objectId: 'colorCube', position },
      });

      const effect = createTransformEffect(oldState, newState);
      effect.execute(context);

      expect(editorMesh.position).toEqual(position);
      expect(renderMesh.position).toEqual(position);
    });

    it('should handle rotation updates', () => {
      const context = createMockContext();
      const editorMesh = new Mesh('colorCube', null);
      const renderMesh = new Mesh('colorCube', null);
      
      context.editorScene.getMeshByName.mockReturnValue(editorMesh);
      context.renderScene.getMeshByName.mockReturnValue(renderMesh);

      const oldState = createInitialAppState();
      const rotation = new Vector3(0, Math.PI / 4, 0);
      const newState = updateAppState(oldState, {
        type: 'UPDATE_ROTATION',
        payload: { objectId: 'colorCube', rotation },
      });

      const effect = createTransformEffect(oldState, newState);
      effect.execute(context);

      expect(editorMesh.rotation).toEqual(rotation);
      expect(renderMesh.rotation).toEqual(rotation);
    });
  });

  describe('createRayUpdateEffect', () => {
    it('should create effect when ray count changes', () => {
      const oldState = createInitialAppState();
      const newState = updateAppState(oldState, {
        type: 'UPDATE_RAY_COUNT',
        payload: { count: 6 },
      });

      const effect = createRayUpdateEffect(oldState, newState);

      expect(effect).toBeDefined();
      expect(effect.type).toBe('rayUpdate');
    });

    it('should execute ray update effect', () => {
      const context = createMockContext();
      const mockMesh = new Mesh('colorCube', null);
      context.editorScene.getMeshByName.mockReturnValue(mockMesh);

      const initial = createInitialAppState();
      const selected = updateAppState(initial, {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });
      const updated = updateAppState(selected, {
        type: 'UPDATE_RAY_COUNT',
        payload: { count: 6 },
      });

      const effect = createRayUpdateEffect(selected, updated);
      effect.execute(context);

      expect(context.rayManager.updateRays).toHaveBeenCalledWith(
        expect.objectContaining({
          position: mockMesh.position,
          worldMatrix: expect.anything(),
          config: { count: 6, maxBounces: 2 },
        })
      );
    });

    it('should not update rays when no object selected', () => {
      const context = createMockContext();
      const oldState = createInitialAppState();
      const newState = updateAppState(oldState, {
        type: 'UPDATE_RAY_COUNT',
        payload: { count: 6 },
      });

      const effect = createRayUpdateEffect(oldState, newState);
      effect.execute(context);

      expect(context.rayManager.updateRays).not.toHaveBeenCalled();
    });
  });

  describe('createQualityEffect', () => {
    it('should create effect for quality change', () => {
      const oldState = createInitialAppState();
      const newState = updateAppState(oldState, {
        type: 'UPDATE_QUALITY',
        payload: { quality: 'high' },
      });

      const effect = createQualityEffect(oldState, newState);

      expect(effect).toBeDefined();
      expect(effect.type).toBe('quality');
    });

    it('should execute quality effect', () => {
      const context = createMockContext();
      const mockMaterial = {
        reflectionTexture: {
          name: 'mirrorTexture',
          mirrorPlane: new Vector3(0, 0, 1),
          renderList: [],
          dispose: vi.fn(),
        },
      };
      
      context.renderScene.materials = [mockMaterial as any];

      const oldState = createInitialAppState();
      const newState = updateAppState(oldState, {
        type: 'UPDATE_QUALITY',
        payload: { quality: 'high' },
      });

      const effect = createQualityEffect(oldState, newState);
      effect.execute(context);

      expect(mockMaterial.reflectionTexture.dispose).toHaveBeenCalled();
    });
  });

  describe('createResetEffect', () => {
    it('should create effect for reset action', () => {
      const oldState = updateAppState(createInitialAppState(), {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });
      const newState = updateAppState(oldState, { type: 'RESET' });

      const effect = createResetEffect(oldState, newState);

      expect(effect).toBeDefined();
      expect(effect.type).toBe('reset');
    });

    it('should execute reset effect', () => {
      const context = createMockContext();
      context.getInitialConfig = vi.fn().mockReturnValue({
        cube: {
          position: new Vector3(0, 5, 5),
          rotation: new Vector3(0, 0, 0),
        },
        cameraIndicator: {
          position: new Vector3(0, 5, -5),
          rotation: new Vector3(0, 0, 0),
        },
      });

      const editorCube = new Mesh('colorCube', null);
      const renderCube = new Mesh('colorCube', null);
      const cameraIndicator = new Mesh('cameraIndicator', null);

      context.editorScene.getMeshByName
        .mockReturnValueOnce(editorCube)
        .mockReturnValueOnce(cameraIndicator);
      context.renderScene.getMeshByName.mockReturnValue(renderCube);

      const oldState = updateAppState(createInitialAppState(), {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });
      const newState = updateAppState(oldState, { type: 'RESET' });

      const effect = createResetEffect(oldState, newState);
      effect.execute(context);

      expect(editorCube.position).toEqual(new Vector3(0, 5, 5));
      expect(renderCube.position).toEqual(new Vector3(0, 5, 5));
      expect(cameraIndicator.position).toEqual(new Vector3(0, 5, -5));
      expect(context.rayManager.hideRays).toHaveBeenCalled();
    });
  });

  describe('applyStateEffects', () => {
    it('should generate and execute all relevant effects', () => {
      const context = createMockContext();
      const mockMesh = new Mesh('colorCube', null);
      context.editorScene.getMeshByName.mockReturnValue(mockMesh);
      context.renderScene.getMeshByName.mockReturnValue(mockMesh);

      const oldState = createInitialAppState();
      const newState = updateAppState(oldState, {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });

      const effects = applyStateEffects(oldState, newState, context);

      expect(effects.length).toBeGreaterThan(0);
      expect(context.applyHighlight).toHaveBeenCalled();
      expect(context.gizmoManager.attachToMesh).toHaveBeenCalled();
    });

    it('should handle multiple state changes', () => {
      const context = createMockContext();
      const mockMesh = new Mesh('colorCube', null);
      context.editorScene.getMeshByName.mockReturnValue(mockMesh);
      context.renderScene.getMeshByName.mockReturnValue(mockMesh);

      const state1 = createInitialAppState();
      const state2 = updateAppState(state1, {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'colorCube' },
      });
      const state3 = updateAppState(state2, {
        type: 'UPDATE_POSITION',
        payload: { objectId: 'colorCube', position: new Vector3(1, 2, 3) },
      });

      const effects = applyStateEffects(state2, state3, context);

      expect(effects.some(e => e.type === 'transform')).toBe(true);
      expect(mockMesh.position).toEqual(new Vector3(1, 2, 3));
    });
  });
});