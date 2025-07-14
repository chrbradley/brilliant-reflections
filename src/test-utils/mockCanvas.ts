// ABOUTME: Mock canvas utilities for testing Babylon.js in jsdom environment
// ABOUTME: Provides WebGL context mock for unit tests

import { vi } from 'vitest';

/**
 * Mock WebGL rendering context
 */
export const createMockWebGLContext = (): any => ({
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  getShaderParameter: vi.fn(() => true),
  getProgramParameter: vi.fn(() => true),
  getExtension: vi.fn(() => null),
  getParameter: vi.fn((param: number) => {
    // Return appropriate values for common parameters
    if (param === 0x0D33) return 1024; // MAX_TEXTURE_SIZE
    if (param === 0x851C) return 16; // MAX_VERTEX_TEXTURE_IMAGE_UNITS
    if (param === 0x1F01) return 'Mock WebGL'; // RENDERER
    if (param === 0x1F00) return 'Mock'; // VENDOR
    return 0;
  }),
  pixelStorei: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  clear: vi.fn(),
  clearColor: vi.fn(),
  viewport: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  createTexture: vi.fn(),
  bindTexture: vi.fn(),
  texParameteri: vi.fn(),
  texImage2D: vi.fn(),
  createFramebuffer: vi.fn(),
  bindFramebuffer: vi.fn(),
  framebufferTexture2D: vi.fn(),
  checkFramebufferStatus: vi.fn(() => 0x8CD5), // FRAMEBUFFER_COMPLETE
  createRenderbuffer: vi.fn(),
  bindRenderbuffer: vi.fn(),
  renderbufferStorage: vi.fn(),
  framebufferRenderbuffer: vi.fn(),
  deleteShader: vi.fn(),
  deleteProgram: vi.fn(),
  deleteBuffer: vi.fn(),
  deleteTexture: vi.fn(),
  deleteFramebuffer: vi.fn(),
  deleteRenderbuffer: vi.fn(),
  getUniformLocation: vi.fn(() => {}),
  uniformMatrix4fv: vi.fn(),
  uniform1f: vi.fn(),
  uniform2f: vi.fn(),
  uniform3f: vi.fn(),
  uniform4f: vi.fn(),
  uniform1i: vi.fn(),
  vertexAttribPointer: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  disableVertexAttribArray: vi.fn(),
  getAttribLocation: vi.fn(() => 0),
});

/**
 * Setup canvas mock with WebGL support
 */
export const setupCanvasMock = (): void => {
  HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return createMockWebGLContext();
    }
    return null;
  });
};