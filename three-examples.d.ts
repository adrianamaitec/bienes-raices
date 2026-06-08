declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, MOUSE, Vector3, EventDispatcher, HTMLElement } from 'three';
  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);
    object: Camera;
    domElement: HTMLElement;
    enabled: boolean;
    target: Vector3;
    enableDamping: boolean;
    dampingFactor: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    update(): void;
    dispose(): void;
    reset(): void;
    // y más métodos si quieres
  }
}
declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import { Group, LoadingManager } from 'three';
  export class GLTFLoader {
    setDRACOLoader: any;
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (gltf: { scene: Group }) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}
declare module 'three/examples/jsm/loaders/DRACOLoader' {
  import { LoadingManager } from 'three';
    export class DRACOLoader {
    constructor(manager?: LoadingManager);
    setDecoderPath(path: string): void;
    setDecoderConfig(config: { type: 'js' | 'wasm' }): void;
    preload(): void;
    dispose(): void;
    }
}