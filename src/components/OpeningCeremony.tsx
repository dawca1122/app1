import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OpeningCeremonyProps {
  onComplete: () => void;
}

export const OpeningCeremony: React.FC<OpeningCeremonyProps> = ({ onComplete }) => {
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!videoEnded) {
        setVideoEnded(true);
        onComplete();
      }
    }, 8000); // Fallback if video fails to trigger onEnded

    return () => clearTimeout(timer);
  }, [videoEnded, onComplete]);

  // New Imgur direct link for 8-second video
  const videoUrl = "https://i.imgur.com/N2sDRNP.mp4";

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
    >
      <video
        autoPlay
        muted
        playsInline
        onEnded={() => {
          setVideoEnded(true);
          onComplete();
        }}
        className="w-full h-full object-contain"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </motion.div>
  );
};
