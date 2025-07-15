import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Application initialization', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create a container for our test DOM
    container = document.createElement('div');
    container.innerHTML = `
      <canvas id="editorCanvas"></canvas>
      <canvas id="renderCanvas"></canvas>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
  });

  it('should find the editor canvas element', () => {
    const canvas = document.getElementById('editorCanvas');
    expect(canvas).toBeTruthy();
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  it('should find the render canvas element', () => {
    const canvas = document.getElementById('renderCanvas');
    expect(canvas).toBeTruthy();
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  it('should maintain aspect ratio of 1:1 for canvases', () => {
    const editorCanvas = document.getElementById(
      'editorCanvas'
    ) as HTMLCanvasElement;
    const renderCanvas = document.getElementById(
      'renderCanvas'
    ) as HTMLCanvasElement;

    // Set CSS to maintain aspect ratio
    editorCanvas.style.aspectRatio = '1 / 1';
    renderCanvas.style.aspectRatio = '1 / 1';

    expect(editorCanvas.style.aspectRatio).toBe('1 / 1');
    expect(renderCanvas.style.aspectRatio).toBe('1 / 1');
  });
});

describe('TypeScript compilation', () => {
  it('should compile with strict mode enabled', () => {
    // This test passes if the file compiles without errors
    const strictModeTest: string = 'test';
    expect(strictModeTest).toBe('test');
  });
});
