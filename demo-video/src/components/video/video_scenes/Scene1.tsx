import { motion } from 'framer-motion';
import { CVScreen } from '../ui/CVScreen';

export function Scene1() {
  return (
    <CVScreen photosChrome imageAnim>
      <motion.div
        className="absolute top-[24%] left-0 right-0 px-[4vh] text-center pointer-events-none"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          className="text-white text-[5.4vh] leading-[1.15] font-extrabold"
          style={{ fontFamily: 'var(--font-body)', textShadow: '0 0.5vh 2.2vh rgba(0,0,0,0.7)' }}
        >
          Pov : tu es enfin embauché
        </span>
      </motion.div>
    </CVScreen>
  );
}
