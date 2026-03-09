import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, X, CheckCircle2, Loader2, ScanLine, ZoomIn, ZoomOut, ImagePlus } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useSettings } from '../contexts/SettingsContext';

interface EANScannerProps {
  t: any;
  onDetected: (ean: string) => void;
  onCancel: () => void;
}

export const EANScanner: React.FC<EANScannerProps> = ({ t, onDetected, onCancel }) => {
  const { settings } = useSettings();
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [zoomSupported, setZoomSupported] = useState(false);

  // Pinch to zoom state
  const initialDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const videoConstraints: any = { zoom: true };
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

        // Check zoom capabilities
        const track = s.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;
        if (capabilities.zoom) {
          setZoomSupported(true);
          setMinZoom(capabilities.zoom.min);
          setMaxZoom(capabilities.zoom.max);
          const trackSettings = track.getSettings() as any;
          setZoom(trackSettings.zoom || capabilities.zoom.min);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [settings.selectedCameraId]);

  const handleZoomChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = Number(e.target.value);
    setZoom(newZoom);
    if (stream) {
      const track = stream.getVideoTracks()[0];
      try {
        await track.applyConstraints({ advanced: [{ zoom: newZoom }] } as any);
      } catch (err) {
        console.error("Failed to apply zoom", err);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && zoomSupported) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      initialDistanceRef.current = dist;
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = async (e: React.TouchEvent) => {
    if (e.touches.length === 2 && zoomSupported && initialDistanceRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      
      const scale = dist / initialDistanceRef.current;
      let newZoom = initialZoomRef.current * scale;
      
      newZoom = Math.max(minZoom, Math.min(newZoom, maxZoom));
      
      setZoom(newZoom);
      if (stream) {
        const track = stream.getVideoTracks()[0];
        try {
          await track.applyConstraints({ advanced: [{ zoom: newZoom }] } as any);
        } catch (err) {
          // Ignore constraint errors during rapid movement
        }
      }
    }
  };

  const handleTouchEnd = () => {
    initialDistanceRef.current = null;
  };

  const analyzeImage = async (dataUrl: string) => {
    setScanning(true);
    try {
      const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      const base64Data = dataUrl.split(',')[1];

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              { text: "Extract the EAN or barcode number from this image. Return ONLY the digits of the barcode. If no barcode is visible, return 'NOT_FOUND'." },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType
                }
              }
            ]
          }
        ]
      });
      
      const text = response.text?.trim() || '';
      if (text && text !== 'NOT_FOUND' && /^\d+$/.test(text)) {
        onDetected(text);
      } else {
        alert("Nie wykryto kodu EAN. Spróbuj ponownie.");
        setScanning(false);
      }
    } catch (err) {
      console.error(err);
      alert("Błąd podczas analizy obrazu.");
      setScanning(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || scanning) return;
    
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      await analyzeImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await analyzeImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-deep-black rounded-3xl overflow-hidden border border-white/10">
        <div className="p-4 flex justify-between items-center border-b border-white/5">
          <h2 className="text-lg font-bold text-gold">{t.step1}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div 
          className="relative aspect-video bg-black overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute inset-0 border-2 border-pro-blue/50 m-8 rounded-xl pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-pro-blue/50 shadow-[0_0_10px_rgba(0,83,160,0.8)] animate-pulse" />
          </div>

          {zoomSupported && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 z-20">
              <span className="text-xs font-mono text-white/80">{zoom.toFixed(1)}x</span>
            </div>
          )}

          {zoomSupported && (
            <div className="absolute bottom-4 left-8 right-8 flex items-center gap-3 bg-black/50 backdrop-blur-md p-3 rounded-2xl border border-white/10 z-20">
              <ZoomOut className="w-4 h-4 text-white/60" />
              <input 
                type="range" 
                min={minZoom} 
                max={maxZoom} 
                step={0.1} 
                value={zoom} 
                onChange={handleZoomChange}
                className="flex-1 accent-pro-blue"
              />
              <ZoomIn className="w-4 h-4 text-white/60" />
            </div>
          )}

          {scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
              <Loader2 className="w-10 h-10 text-gold animate-spin mb-2" />
              <span className="text-xs text-white/60 uppercase tracking-widest">Analiza Gemini AI...</span>
            </div>
          )}
        </div>
        
        <div className="p-6 text-center flex flex-col items-center">
          <p className="text-white/60 text-sm mb-6">{t.eanDesc}</p>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
              className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50 border border-white/10"
              title="Upload Image"
            >
              <ImagePlus className="w-6 h-6 text-white" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            
            <button 
              onClick={captureAndAnalyze}
              disabled={scanning}
              className="w-20 h-20 rounded-full bg-pro-blue flex items-center justify-center shadow-[0_0_30px_rgba(0,83,160,0.3)] active:scale-90 transition-transform disabled:opacity-50"
            >
              <ScanLine className="w-10 h-10 text-white" />
            </button>
            
            {/* Empty div to balance the flex layout */}
            <div className="w-14 h-14"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
