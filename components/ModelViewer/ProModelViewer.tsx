"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface ProModelViewerProps {
  url: string;
  width?: string | number;
  height?: string | number;
  autoRotate?: boolean;
  backgroundColor?: string;
  className?: string;
}

export default function ProModelViewer({
  url,
  width = "100%",
  height = "500px",
  autoRotate = true,
  backgroundColor = "#1a1a1a",
  className = "",
}: ProModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0x443333, 0x111122, 0.8);
    scene.add(hemisphereLight);

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      scene.clear();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [backgroundColor]);

  const loadModel = () => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setError(null);
    setProgress(0);

    // Limpiar modelo anterior
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }

    const loader = new GLTFLoader();

    // Progreso simulado
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    loader.load(
      url,
      (gltf) => {
        clearInterval(progressInterval);
        setProgress(100);

        const model = gltf.scene;
        modelRef.current = model;

        // Configurar modelo
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Centrar y escalar
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        sceneRef.current?.add(model);

        setTimeout(() => setIsLoading(false), 500);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          setProgress(percentComplete);
        }
      },
      (err) => {
        clearInterval(progressInterval);
        console.error("Error loading model:", err);
        setError("No se pudo cargar el modelo 3D");
        setIsLoading(false);
      }
    );
  };

  useEffect(() => {
    loadModel();
  }, [url]);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  const resetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.reset();
      cameraRef.current.position.set(5, 5, 5);
    }
  };

  return (
    <div
      className={`relative rounded-xl border border-gray-700 overflow-hidden shadow-2xl ${className}`}
      style={{ width, height }}
    >
      <div ref={mountRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="relative mb-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm">
                {Math.round(progress)}%
              </div>
            </div>
            <p className="text-sm">Cargando modelo 3D...</p>
            <p className="text-xs text-gray-400 mt-1">{url.split("/").pop()}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-80 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-sm mb-2">{error}</p>
            <button
              onClick={loadModel}
              className="px-3 py-1 bg-white text-red-700 rounded text-sm hover:bg-gray-100"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Barra de controles inferior */}
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 backdrop-blur-sm text-white text-xs p-3 rounded-lg border border-white border-opacity-20 flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Modelo cargado</span>
              </div>
              <div className="text-gray-300 text-xs">
                🖱️ Arrastra • 🔍 Zoom • Click derecho mover
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={resetCamera}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                title="Resetear cámara"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Auto-rotación */}
          {autoRotate && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded border border-white border-opacity-20 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Auto-rotación</span>
            </div>
          )}

          {/* Nombre del archivo */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded border border-white border-opacity-20">
            📦 {url.split("/").pop()}
          </div>
        </>
      )}
    </div>
  );
}
