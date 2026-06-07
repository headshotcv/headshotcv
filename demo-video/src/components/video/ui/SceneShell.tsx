import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { SafariBar } from './SafariBar';
import { IOSKeyboard } from './IOSKeyboard';

function AppHeader() {
  return (
    <div className="flex items-center gap-[1.4vh] px-[3.4vh] py-[1.4vh] bg-[#eef0f3] border-b border-black/5">
      <img
        src={`${import.meta.env.BASE_URL}logo-icon.png`}
        alt=""
        className="h-[3.6vh] w-auto"
      />
      <span
        className="text-[2.6vh] font-extrabold text-[#1c1f26]"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        HeadshotCV
      </span>
    </div>
  );
}

function GeneratingOverlay() {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-[0.4vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col items-center gap-[2vh] bg-white rounded-[2.4vh] px-[5vh] py-[4vh] shadow-2xl"
        initial={{ scale: 0.9, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        <Loader2 className="w-[6vh] h-[6vh] text-[#2563eb] animate-spin" />
        <div
          className="text-[2.7vh] font-semibold text-[#1c1f26]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Création de votre CV…
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SceneShell({
  children,
  activeKey,
  generating = false,
}: {
  children: React.ReactNode;
  activeKey?: string;
  generating?: boolean;
}) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col bg-[#eef0f3]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <StatusBar dark={false} />
      <SafariBar />
      <AppHeader />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      <IOSKeyboard activeKey={activeKey} />
      <AnimatePresence>{generating && <GeneratingOverlay />}</AnimatePresence>
    </motion.div>
  );
}
