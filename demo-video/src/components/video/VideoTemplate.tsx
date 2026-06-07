import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS = {
  hook: 3600,
  name: 4200,
  city: 3600,
  linkedin: 4900,
  reveal: 4200,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  hook: Scene1,
  name: Scene2,
  city: Scene3,
  linkedin: Scene4,
  reveal: Scene5,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* 9:16 phone screen — the whole frame reads as an iOS screen recording */}
      <motion.div
        className="relative w-full h-full max-w-[56.25vh] bg-[#0c0c0e] overflow-hidden"
        style={{ transformOrigin: 'center center' }}
        animate={{
          rotate: [-0.4, 0.4, -0.3, 0.4, -0.4],
          scale: [1.03, 1.04, 1.035, 1.04, 1.03],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        <AnimatePresence mode="popLayout">
          {SceneComponent && <SceneComponent key={currentSceneKey} />}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
