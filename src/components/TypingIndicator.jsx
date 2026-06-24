import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
  const dotVariants = { start: { y: "0%" }, end: { y: "100%" } };
  return (
    <div className="flex space-x-2 p-3 bg-white border border-goldran-border rounded-2xl w-20 justify-center items-center shadow-premium">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="w-2 h-2 bg-goldran-gold rounded-full block"
          variants={dotVariants}
          animate="end"
          initial="start"
          transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: index * 0.12 }}
        />
      ))}
    </div>
  );
}