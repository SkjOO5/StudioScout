import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from '../../types';
import { MapPin, Film, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getThreeThemeConfig, ThreeThemeConfig } from './threeTheme';
import { ErrorBoundary } from '../ErrorBoundary';

interface SceneNodeProps {
  scene: Scene;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  config: ThreeThemeConfig;
  isDark: boolean;
}

function SceneNode({ scene, position, isSelected, onSelect, config, isDark }: SceneNodeProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      if (isSelected) {
        meshRef.current.rotation.x += delta * 0.3;
      }
    }
  });

  const nodeColor = isSelected
    ? config.mapNodeSelectedColor
    : scene.recommendation_status === 'available'
    ? config.mapNodeAvailableColor
    : scene.research_status === 'researching'
    ? config.mapNodeResearchingColor
    : config.mapNodePendingColor;

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
        {/* Core Node Orb */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
          scale={isSelected ? 1.4 : hovered ? 1.2 : 1}
        >
          <icosahedronGeometry args={[0.35, 1]} />
          <meshStandardMaterial
            color={nodeColor}
            emissive={nodeColor}
            emissiveIntensity={isSelected ? (isDark ? 1.2 : 0.6) : hovered ? (isDark ? 0.8 : 0.4) : (isDark ? 0.3 : 0.15)}
            wireframe={!isSelected}
          />
        </mesh>

        {/* Outer Aura Ring */}
        {isSelected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.65, 32]} />
            <meshBasicMaterial color={nodeColor} side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
        )}

        {/* Interactive HTML Tag Overlay */}
        <Html
          position={[0, 0.6, 0]}
          center
          distanceFactor={10}
          zIndexRange={[0, 10]}
          className="pointer-events-none select-none transition-all duration-200"
        >
          <div
            className={`px-2.5 py-1 rounded-lg border-2 text-[10px] font-mono whitespace-nowrap shadow-pop-xs backdrop-blur-md transition-transform ${
              isSelected
                ? 'bg-studio-surface border-[#8B5CF6] text-studio-text scale-110 font-bold'
                : hovered
                ? 'bg-studio-surface border-studio-border text-studio-text scale-105 font-bold'
                : 'bg-studio-surface/90 border-studio-border text-studio-muted'
            }`}
          >
            <span className="font-bold text-[#8B5CF6]">SC {scene.scene_number}:</span> {scene.location}
          </div>
        </Html>
      </Float>
    </group>
  );
}

interface ProductionMap3DProps {
  scenes: Scene[];
  selectedSceneId: string | null;
  onSelectScene: (scene: Scene) => void;
}

export const ProductionMap3D: React.FC<ProductionMap3DProps> = ({
  scenes,
  selectedSceneId,
  onSelectScene,
}) => {
  const { resolvedTheme } = useTheme();
  const threeConfig = useMemo(() => getThreeThemeConfig(resolvedTheme), [resolvedTheme]);
  const [hasWebGL, setHasWebGL] = useState(true);

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

  // Generate spatial 3D curve layout for scenes
  const scenePositions = useMemo(() => {
    const total = scenes.length || 1;
    return scenes.map((scene, i) => {
      const angle = (i / total) * Math.PI * 1.6 - Math.PI * 0.8;
      const radius = 3.5;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * (radius * 0.4) - 1;
      const y = (i - (total - 1) / 2) * 0.4;
      return { scene, pos: [x, y, z] as [number, number, number] };
    });
  }, [scenes]);

  const linePoints = useMemo(() => {
    return scenePositions.map((sp) => sp.pos);
  }, [scenePositions]);

  if (scenes.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-72 sm:h-80 rounded-2xl bg-studio-surface border-2 border-studio-border relative overflow-hidden shadow-pop group transition-colors duration-250">
      {/* HUD Header Overlay */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
        <span className="text-[11px] font-mono font-black uppercase tracking-widest text-[#8B5CF6]">
          3D Production Intelligence Map
        </span>
        <span className="text-[10px] text-studio-dim font-mono hidden sm:inline">
          &bull; {scenes.length} Nodes Connected
        </span>
      </div>

      <div className="absolute bottom-3 right-4 z-10 text-[10px] text-studio-dim font-mono pointer-events-none font-bold">
        Click node to inspect scene &bull; Drag to orbit
      </div>

      {!hasWebGL ? (
        <div className="w-full h-full flex items-center justify-center p-6 text-center text-studio-dim">
          <p className="text-xs font-mono font-bold">2D Mode Active &bull; {scenes.length} Scenes Connected</p>
        </div>
      ) : (
        <ErrorBoundary
          fallback={
            <div className="w-full h-full flex items-center justify-center p-6 text-center text-studio-dim">
              <p className="text-xs font-mono font-bold">2D Mode Active &bull; {scenes.length} Scenes Connected</p>
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 1.5, 6.5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <color attach="background" args={[resolvedTheme === 'dark' ? '#0A0E17' : '#F8FAFC']} />
            <fog attach="fog" args={[resolvedTheme === 'dark' ? '#0A0E17' : '#F8FAFC', 6, 18]} />

            <ambientLight intensity={threeConfig.ambientIntensity} color={threeConfig.ambientColor} />
            <pointLight position={[5, 5, 5]} intensity={threeConfig.keyLightIntensity} color={threeConfig.keyLightColor} />
            <pointLight position={[-5, -3, 2]} intensity={threeConfig.fillLightIntensity} color={threeConfig.fillLightColor} />

            {/* Spatial Floor Grid */}
            <gridHelper
              args={[24, 24, resolvedTheme === 'dark' ? '#1E293B' : '#CBD5E1', resolvedTheme === 'dark' ? '#0D1424' : '#E2E8F0']}
              position={[0, -1.8, 0]}
            />

            {/* Trajectory line connecting scenes */}
            {linePoints.length > 1 && (
              <Line
                points={linePoints}
                color={threeConfig.mapLineColor}
                lineWidth={1.5}
                dashed
                dashScale={20}
                dashSize={0.4}
                gapSize={0.2}
              />
            )}

            {/* 3D Scene Nodes */}
            {scenePositions.map(({ scene, pos }) => (
              <SceneNode
                key={scene.id}
                scene={scene}
                position={pos}
                isSelected={selectedSceneId === scene.id}
                onSelect={() => onSelectScene(scene)}
                config={threeConfig}
                isDark={resolvedTheme === 'dark'}
              />
            ))}

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 1.8}
              minPolarAngle={Math.PI / 2.5}
              maxAzimuthAngle={Math.PI / 4}
              minAzimuthAngle={-Math.PI / 4}
            />
          </Canvas>
        </ErrorBoundary>
      )}
    </div>
  );
};

