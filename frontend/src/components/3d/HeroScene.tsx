import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import { getThreeThemeConfig, ThreeThemeConfig } from './threeTheme';
import { ErrorBoundary } from '../ErrorBoundary';

// Optimized Particle Field
function ParticleField({ count = 250, config }: { count?: number; config: ThreeThemeConfig }) {
  const pointsRef = useRef<THREE.Points>(null!);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        color={config.particleColor}
        size={config.particleSize}
        sizeAttenuation
        depthWrite={false}
        opacity={config.particleOpacity}
      />
    </points>
  );
}

// Floating Cinematic Film Frame Geometry
function FloatingFilmRings({ config }: { config: ThreeThemeConfig }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.15 + (state.pointer.y * 0.2);
      groupRef.current.rotation.y = t * 0.1 + (state.pointer.x * 0.3);
    }
  });

  return (
    <group ref={groupRef} position={[2, 0, -2]}>
      {/* Outer lens aperture ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3.2, 0.02, 16, 100]} />
        <meshStandardMaterial
          color={config.keyLightColor}
          emissive={config.keyLightColor}
          emissiveIntensity={config.filmRingEmissiveIntensity}
          wireframe
        />
      </mesh>

      {/* Middle gold focal ring */}
      <mesh rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[2.5, 0.015, 16, 100]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#d97706"
          emissiveIntensity={config.filmRingEmissiveIntensity * 0.7}
        />
      </mesh>

      {/* Inner violet iris */}
      <mesh rotation={[-Math.PI / 6, Math.PI / 3, 0]}>
        <torusGeometry args={[1.8, 0.015, 16, 100]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={config.filmRingEmissiveIntensity * 0.8}
        />
      </mesh>

      {/* Core glowing optic */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <Sphere args={[0.3, 32, 32]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive={config.keyLightColor}
            emissiveIntensity={config.coreOpticEmissiveIntensity}
            roughness={0.1}
          />
        </Sphere>
      </Float>
    </group>
  );
}

export const HeroScene: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const threeConfig = useMemo(() => getThreeThemeConfig(resolvedTheme), [resolvedTheme]);
  const [hasWebGL, setHasWebGL] = React.useState(true);

  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-amber-500/10 blur-[100px] rounded-full"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-amber-500/10 blur-[100px] rounded-full"></div>
        </div>
      }
    >
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-75 transition-opacity duration-300">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={threeConfig.ambientIntensity} color={threeConfig.ambientColor} />
          <pointLight position={[10, 10, 10]} intensity={threeConfig.keyLightIntensity} color={threeConfig.keyLightColor} />
          <pointLight position={[-10, -5, -5]} intensity={threeConfig.fillLightIntensity} color={threeConfig.fillLightColor} />
          <directionalLight position={[0, 5, 5]} intensity={threeConfig.directionalLightIntensity} color={threeConfig.directionalLightColor} />

          <ParticleField count={200} config={threeConfig} />
          <FloatingFilmRings config={threeConfig} />
        </Canvas>
      </div>
    </ErrorBoundary>
  );
};


