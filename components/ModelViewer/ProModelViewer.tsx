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

  // useEffect para inicialización de Three.js - DEPENDENCIAS FIJAS
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
    camera.position.set(10, 10, 10);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    
    // Limpiar contenedor antes de agregar
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate; // Usamos el prop directamente aquí
    controls.autoRotateSpeed = 1;

    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(10, 10, 5);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 2048;
    directionalLight1.shadow.mapSize.height = 2048;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Axes helper (para debug)
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [backgroundColor]); // SOLO backgroundColor como dependencia fija

  // useEffect separado para autoRotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]); // Dependencia separada

  const loadModel = () => {
    if (!sceneRef.current) {
      console.error("Scene not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    // Limpiar modelo anterior
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      modelRef.current = null;
    }

    const loader = new GLTFLoader();

    // Progreso real
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    console.log("Cargando modelo desde:", url);

    loader.load(
      url,
      (gltf) => {
        clearInterval(progressInterval);
        setProgress(100);
        console.log("Modelo cargado:", gltf);

        const model = gltf.scene;
        modelRef.current = model;

        // CENTRADO Y ESCALADO
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        console.log("Tamaño del modelo:", size);
        console.log("Centro del modelo:", center);

        // Calcular la distancia de la cámara
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = cameraRef.current?.fov || 75;
        const cameraZ = Math.abs(maxDim / (2 * Math.tan((fov * Math.PI) / 360)));
        
        // Centrar el modelo
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        // Ajustar cámara
        if (cameraRef.current && controlsRef.current) {
          cameraRef.current.position.set(cameraZ, cameraZ, cameraZ);
          cameraRef.current.lookAt(0, 0, 0);
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }

        sceneRef.current?.add(model);
        console.log("Modelo agregado a la escena");

        setTimeout(() => {
          setIsLoading(false);
          console.log("Loading completado");
        }, 300);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          setProgress(percentComplete);
          console.log(`Progreso: ${percentComplete.toFixed(2)}%`);
        }
      },
      (error) => {
        clearInterval(progressInterval);
        console.error("Error cargando modelo:", error);
        
        let errorMessage = "Error al cargar el modelo 3D";
        
        if (error.message.includes("CORS")) {
          errorMessage = "Error CORS: El servidor no permite cargar el modelo";
        } else if (error.message.includes("404")) {
          errorMessage = "Archivo no encontrado (404)";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "No se pudo cargar el archivo (Network error)";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    );
  };

  // useEffect para cargar modelo cuando cambia la URL
  useEffect(() => {
    if (url && sceneRef.current) {
      console.log("URL cambiada, cargando nuevo modelo:", url);
      loadModel();
    }
  }, [url]); // Dependencia separada para URL

  const resetCamera = () => {
    if (controlsRef.current && cameraRef.current && modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = cameraRef.current.fov;
      const cameraZ = Math.abs(maxDim / (2 * Math.tan((fov * Math.PI) / 360)));
      
      cameraRef.current.position.set(cameraZ, cameraZ, cameraZ);
      cameraRef.current.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
    }
  };

  return (
    <div
      className={`relative rounded-xl border border-gray-700 overflow-hidden shadow-2xl ${className}`}
      style={{ width, height }}
    >
      <div ref={mountRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="relative mb-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold">
                {Math.round(progress)}%
              </div>
            </div>
            <p className="text-sm mb-1">Cargando modelo 3D...</p>
            <p className="text-xs text-gray-400 max-w-xs truncate">{url}</p>
            {progress > 0 && progress < 100 && (
              <div className="w-48 bg-gray-700 rounded-full h-2 mt-2 mx-auto">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center text-white p-4 max-w-md">
            <div className="text-4xl mb-3">❌</div>
            <h3 className="font-semibold mb-2">Error al cargar el modelo</h3>
            <p className="text-sm mb-4 bg-red-800 p-3 rounded">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={loadModel}
                className="px-4 py-2 bg-white text-red-700 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Controles superiores */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <div className="bg-black bg-opacity-60 text-white text-xs px-3 py-2 rounded-lg border border-white border-opacity-20 backdrop-blur-sm">
              <div className="font-medium">📦 {url.split("/").pop()}</div>
              <div className="text-green-400 flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Modelo cargado
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleAutoRotate}
                className={`px-3 py-2 rounded-lg text-xs font-medium backdrop-blur-sm border ${
                  controlsRef.current?.autoRotate 
                    ? 'bg-green-600 text-white border-green-500' 
                    : 'bg-black bg-opacity-60 text-white border-white border-opacity-20'
                }`}
              >
                {controlsRef.current?.autoRotate ? '🔄 On' : '⏸️ Off'}
              </button>
              <button
                onClick={resetCamera}
                className="px-3 py-2 bg-black bg-opacity-60 text-white text-xs rounded-lg border border-white border-opacity-20 backdrop-blur-sm hover:bg-opacity-80"
                title="Resetear vista"
              >
                🎯 Reset
              </button>
            </div>
          </div>

          {/* Instrucciones inferiores */}
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 backdrop-blur-sm text-white text-xs p-3 rounded-lg border border-white border-opacity-20">
            <div className="flex flex-wrap gap-4 justify-center">
              <span className="flex items-center gap-1">
                <span className="text-lg">🖱️</span> Arrastra para rotar
              </span>
              <span className="flex items-center gap-1">
                <span className="text-lg">🔍</span> Rueda para zoom
              </span>
              <span className="flex items-center gap-1">
                <span className="text-lg">🎯</span> Click derecho para mover
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}