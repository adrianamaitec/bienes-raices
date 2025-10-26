// components/ModelViewer/SimpleModelViewer.tsx
'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Group } from 'three';

interface SimpleModelViewerProps {
    url: string;
    width?: number | string;
    height?: number | string;
}

function SimpleModel({ url }: { url: string }) {
    const { scene } = useGLTF(url) as any;
    const groupRef = useRef<Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <group ref={groupRef}>
            <primitive
                object={scene}
                scale={1.5}
                position={[0, 0, 0]}
            />
        </group>
    );
}

function LoadingSpinner() {
    return (
        <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[1, 0.4, 16, 100]} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
        </mesh>
    );
}

export default function ModelViewer({
    url,
    width = "100%",
    height = "400px"
}: SimpleModelViewerProps) {
    return (
        <div
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden"
            style={{ width, height }}
        >
            <Canvas
                camera={{
                    position: [8, 8, 8],
                    fov: 50
                }}
            >
                {/* Luces básicas */}
                <ambientLight intensity={0.8} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    color="#ffffff"
                />
                <hemisphereLight
                    intensity={0.5}
                    color="#ffffff"
                    groundColor="#aaaaaa"
                />

                {/* Modelo */}
                <Suspense fallback={<LoadingSpinner />}>
                    <SimpleModel url={url} />
                </Suspense>

                {/* Controles */}
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={3}
                    maxDistance={15}
                />
            </Canvas>

            {/* Instrucciones */}
            <div className="absolute bottom-3 left-3 right-3 bg-black bg-opacity-70 text-white text-xs p-2 rounded text-center">
                💡 Arrastra para rotar • Rueda del mouse para zoom • Click derecho para mover
            </div>
        </div>
    );
}