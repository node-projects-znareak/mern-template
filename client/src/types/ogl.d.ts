declare module "ogl" {
  export class Texture {
    constructor(gl: WebGL2RenderingContext & { canvas: HTMLCanvasElement }, options?: Record<string, unknown>);
    image: HTMLCanvasElement | null;
    texture: WebGLTexture;
  }

  export class Mesh {
    constructor(gl: WebGL2RenderingContext & { canvas: HTMLCanvasElement }, options?: Record<string, unknown>);
  }

  export class Program {
    constructor(gl: WebGL2RenderingContext & { canvas: HTMLCanvasElement }, options?: Record<string, unknown>);
  }

  export class Triangle {
    constructor(gl: WebGL2RenderingContext & { canvas: HTMLCanvasElement }, options?: Record<string, unknown>);
  }

  export class RenderTarget {
    constructor(gl: WebGL2RenderingContext & { canvas: HTMLCanvasElement }, options?: Record<string, unknown>);
    width: number;
    height: number;
    texture: Texture;
    buffer: WebGLFramebuffer | null;
  }

  export class Renderer {
    constructor(options?: Record<string, unknown>);
    gl: WebGL2RenderingContext & { canvas: HTMLCanvasElement };
    readonly isWebgl2: boolean;
    dpr: number;
    setSize(width: number, height: number): void;
    render(params: { scene: Mesh; target?: RenderTarget | null; clear?: boolean }): void;
    bindFramebuffer(target?: RenderTarget | null): void;
  }
}
