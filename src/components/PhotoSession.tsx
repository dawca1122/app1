import React, { useRef, useState } from 'react';
import { Camera, RefreshCw, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';

interface PhotoSessionProps {
  t: any;
  onComplete: (photos: string[]) => void;
  onCancel: () => void;
}

export const PhotoSession: React.FC<PhotoSessionProps> = ({ t, onComplete, onCancel }) => {
  const { settings } = useSettings();
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  const PHOTO_LABELS = [t.front, t.left, t.right, t.backSide];

  const startCamera = async () => {
    try {
      const videoConstraints: any = {};
      if (settings.selectedCameraId) {
        videoConstraints.deviceId = { exact: settings.selectedCameraId };
      } else {
        videoConstraints.facingMode = 'environment';
      }

      const s = await navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [settings.selectedCameraId]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Shutter sound effect
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);

        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        const newPhotos = [...photos, dataUrl];
        setPhotos(newPhotos);
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 100);
        
        if (currentStep < 3) {
          setCurrentStep(currentStep + 1);
        }
      }
    }
  };

  const resetPhotos = () => {
    setPhotos([]);
    setCurrentStep(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="p-4 flex justify-between items-center bg-deep-black border-b border-white/5">
        <h2 className="text-lg font-bold text-gold">{t.step2}</h2>
        <button onClick={onCancel} className="text-white/60">{t.cancel}</button>
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        <AnimatePresence>
          {showFlash && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-20 flex items-center justify-center"
            >
              <motion.span 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                className="text-black font-bold text-4xl uppercase tracking-widest"
              >
                {currentStep + 1} / 4
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-4 left-4 right-4 flex justify-between gap-2">
          {PHOTO_LABELS.map((label, i) => (
            <div 
              key={label}
              className={`flex-1 h-1 rounded-full ${i <= currentStep ? 'bg-gold' : 'bg-white/20'}`}
            />
          ))}
        </div>

        <div className="absolute bottom-32 left-0 right-0 text-center">
          <span className="bg-black/50 backdrop-blur-md px-4 py-1 rounded-full text-sm font-bold border border-white/20">
            {PHOTO_LABELS[currentStep]}
          </span>
        </div>
      </div>

      <div className="p-8 bg-deep-black border-t border-white/5 flex flex-col gap-6">
        <div className="flex justify-center items-center gap-8">
          <button 
            onClick={resetPhotos}
            className="p-4 rounded-full bg-white/5 text-white/60"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
          
          <button 
            onClick={capturePhoto}
            disabled={photos.length >= 4}
            className="w-20 h-20 rounded-full bg-gold flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.3)] active:scale-90 transition-transform disabled:opacity-50"
          >
            <Camera className="w-10 h-10 text-black" />
          </button>

          <button 
            onClick={() => onComplete(photos)}
            disabled={photos.length < 4}
            className="p-4 rounded-full bg-electric-purple text-white disabled:opacity-20"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {photos.map((p, i) => (
            <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-white/20 flex-shrink-0 relative">
              <img src={p} alt={`Raw ${i}`} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-center py-0.5">
                {PHOTO_LABELS[i]}
              </div>
            </div>
          ))}
          {Array.from({ length: 4 - photos.length }).map((_, i) => (
            <div key={i + photos.length} className="w-20 h-20 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-white/10 text-xs">{PHOTO_LABELS[i + photos.length]}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={onCancel}
          className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:text-red-400 transition-colors text-center"
        >
          {t.clearData}
        </button>
      </div>
    </div>
  );
};
