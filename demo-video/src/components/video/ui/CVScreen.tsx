import { motion } from 'framer-motion';
import { ChevronLeft, Share, Heart, Info, SlidersHorizontal, Trash2 } from 'lucide-react';
import { StatusBar } from './StatusBar';
import cvLea from '@assets/cv-clients/cv-lea.jpg';

export function CVScreen({
  photosChrome = false,
  imageAnim = false,
  children,
}: {
  photosChrome?: boolean;
  imageAnim?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col bg-[#0c0c0e]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <StatusBar dark />
      {photosChrome && (
        <div className="flex items-center px-[3vh] py-[1.4vh] text-white">
          <ChevronLeft className="w-[3.6vh] h-[3.6vh]" />
          <div className="flex-1 text-center -ml-[3.6vh]">
            <div className="text-[2.6vh] font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
              Aujourd'hui
            </div>
            <div className="text-[2vh] text-white/60" style={{ fontFamily: 'var(--font-body)' }}>
              18:53
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center overflow-hidden relative px-[2vh]">
        <motion.img
          src={cvLea}
          alt=""
          className="max-h-full max-w-full object-contain rounded-[1vh] shadow-[0_2vh_6vh_rgba(0,0,0,0.5)]"
          initial={imageAnim ? { scale: 1.08, y: '4%' } : false}
          animate={imageAnim ? { scale: 1, y: '0%' } : {}}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        />
        {children}
      </div>

      {photosChrome && (
        <div className="flex items-center justify-around px-[3vh] py-[2.4vh] text-white/90">
          <Share className="w-[3vh] h-[3vh]" />
          <Heart className="w-[3vh] h-[3vh]" />
          <Info className="w-[3vh] h-[3vh]" />
          <SlidersHorizontal className="w-[3vh] h-[3vh]" />
          <Trash2 className="w-[3vh] h-[3vh]" />
        </div>
      )}
    </motion.div>
  );
}
