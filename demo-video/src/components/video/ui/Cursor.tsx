import { motion } from 'framer-motion';

export function Cursor() {
  return (
    <motion.span
      className="inline-block w-[0.32vh] h-[3.2vh] bg-[#2563eb] ml-[0.5vh] align-middle rounded-full"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear', times: [0, 0.5, 0.5, 1] }}
    />
  );
}
