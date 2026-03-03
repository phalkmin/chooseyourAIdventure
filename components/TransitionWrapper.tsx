'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function TransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ clipPath: 'inset(0 50% 0 50%)', opacity: 0 }}
        animate={{ clipPath: 'inset(0 0% 0 0%)', opacity: 1 }}
        exit={{ clipPath: 'inset(0 50% 0 50%)', opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.45, 0, 0.55, 1] }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
