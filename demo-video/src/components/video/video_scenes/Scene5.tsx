import { motion } from 'framer-motion';
import { CVScreen } from '../ui/CVScreen';

export function Scene5() {
  return (
    <CVScreen imageAnim>
      <motion.div
        className="absolute bottom-[5%] left-0 right-0 flex flex-col items-center gap-[1.4vh] pointer-events-none"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-[1.4vh]">
          <img
            src={`${import.meta.env.BASE_URL}logo-icon.png`}
            alt=""
            className="h-[4.4vh] w-auto"
          />
          <span
            className="text-white text-[3.4vh] font-extrabold"
            style={{ fontFamily: 'var(--font-body)', textShadow: '0 0.4vh 1.6vh rgba(0,0,0,0.6)' }}
          >
            HeadshotCV
          </span>
        </div>
        <div
          className="text-white/85 text-[2.6vh] font-medium"
          style={{ fontFamily: 'var(--font-body)', textShadow: '0 0.3vh 1.2vh rgba(0,0,0,0.6)' }}
        >
          Ton CV pro en 2 minutes.
        </div>
      </motion.div>
    </CVScreen>
  );
}
