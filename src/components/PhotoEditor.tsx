import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, ImagePlus, X, Loader2, Sparkles, Download, ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useSettings } from '../contexts/SettingsContext';

interface PhotoEditorProps {
  t: any;
  onBack: () => void;
}

type Step = 'capture' | 'processing' | 'result';

export const PhotoEditor: React.FC<PhotoEditorProps> = ({ t, onBack }) => {
  const { settings } = useSettings();
  const [step, setStep] = useState<Step>('capture');
  const [rawPhoto, setRawPhoto] = useState<string | null>(null);
  const [proPhoto, setProPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [aiStep, setAiStep] = useState<number>(1);

  useEffect(() => {
    if (step === 'capture') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  const startCamera = async () => {
    try {
      const videoConstraints: any = {};
      if (settings.selectedCameraId) {
        videoConstraints.deviceId = { exact: settings.selectedCameraId };
      } else {
        videoConstraints.facingMode = 'environment';
      }

      const s = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
      setRawPhoto(dataUrl);
      processImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setRawPhoto(dataUrl);
        processImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processImage = async (dataUrl: string) => {
    setStep('processing');
    setError(null);
    setAiStep(1);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const base64Data = dataUrl.split(',')[1];
      const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];

      // Step 1: Simulated segmentation/analysis for UX
      setAiStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Simulated environment generation for UX
      setAiStep(2);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Actual image processing
      setAiStep(3);
      const imageResponse = await ai.models.generateContent({
        model: settings.aiImageModel || 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            {
              text: "Professional product photography of the item from the uploaded image. Place it on a modern minimalist marble pedestal. Background should be clean solid white with soft studio lighting. High resolution, 4k, commercial quality, realistic shadows."
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            ...(settings.aiImageModel !== 'gemini-2.5-flash-image' && { imageSize: "1K" })
          }
        }
      });

      let generatedPhoto = null;
      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          generatedPhoto = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (generatedPhoto) {
        setProPhoto(generatedPhoto);
        setStep('result');
      } else {
        throw new Error("Nie udało się wygenerować obrazu.");
      }

    } catch (err: any) {
      console.error("AI Processing Error:", err);
      setError(err.message || "Wystąpił błąd podczas przetwarzania.");
    }
  };

  const handleDownload = () => {
    if (!proPhoto) return;
    const a = document.createElement('a');
    a.href = proPhoto;
    a.download = `packshot_${new Date().getTime()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const aiSteps = [
    { id: 1, title: "Analiza i Segmentacja", desc: "Przygotowanie maski produktu" },
    { id: 2, title: "Generowanie Otoczenia", desc: "Tworzenie studyjnego tła" },
    { id: 3, title: "Upscaling i Retusz", desc: settings.aiImageModel || "gemini-3-pro-image-preview" }
  ];

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <div className="w-full flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold uppercase tracking-widest text-gold">{t.photoModule || "PRZERABIANIE ZDJĘĆ"}</h2>
      </div>

      <AnimatePresence mode="wait">
        {step === 'capture' && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md bg-deep-black rounded-3xl overflow-hidden border border-white/10"
          >
            <div className="relative aspect-[3/4] bg-black overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute inset-0 border-2 border-pro-blue/30 m-8 rounded-xl pointer-events-none border-dashed" />
            </div>
            
            <div className="p-6 text-center flex flex-col items-center bg-black/50">
              <p className="text-white/60 text-sm mb-6">{t.photoDesc || "Zrób zdjęcie produktu lub wgraj z galerii"}</p>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
                  title="Wgraj zdjęcie"
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
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full bg-pro-blue flex items-center justify-center shadow-[0_0_30px_rgba(0,83,160,0.3)] active:scale-90 transition-transform"
                >
                  <Camera className="w-10 h-10 text-white" />
                </button>
                
                <div className="w-14 h-14"></div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center w-full max-w-md p-8"
          >
            {error ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="p-4 rounded-full bg-red-500/20">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{t.aiError || "Błąd Przetwarzania"}</h2>
                  <p className="text-red-400 text-sm mb-6">{error}</p>
                  <button 
                    onClick={() => setStep('capture')}
                    className="gold-button"
                  >
                    {t.tryAgain || "Spróbuj Ponownie"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative mb-8">
                  <Loader2 className="w-20 h-20 text-pro-blue animate-spin" />
                  <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-gold animate-pulse" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-8 uppercase tracking-widest text-center">
                  GUSCHALL Vision Pro
                </h2>

                <div className="w-full space-y-4">
                  {aiSteps.map((s) => (
                    <div 
                      key={s.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                        aiStep === s.id 
                          ? 'bg-pro-blue/20 border-pro-blue/50 shadow-[0_0_15px_rgba(0,83,160,0.3)]' 
                          : aiStep > s.id 
                            ? 'bg-white/5 border-white/10 opacity-50'
                            : 'bg-transparent border-transparent opacity-30'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {aiStep > s.id ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : aiStep === s.id ? (
                          <Loader2 className="w-6 h-6 text-pro-blue animate-spin" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-white/20" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className={`font-bold ${aiStep === s.id ? 'text-white' : 'text-white/70'}`}>
                          {s.id}. {s.title}
                        </div>
                        <div className="text-xs font-mono text-gold/80">
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {step === 'result' && proPhoto && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl flex flex-col items-center gap-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="space-y-2">
                <div className="text-xs text-white/60 uppercase tracking-widest text-center">Oryginał</div>
                <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                  <img src={rawPhoto!} alt="Original" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-gold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-3 h-3" /> Packshot Pro
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden border-2 border-pro-blue/50 bg-white shadow-[0_0_30px_rgba(0,83,160,0.2)]">
                  <img src={proPhoto} alt="Processed" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setStep('capture')}
                className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors uppercase tracking-widest text-sm font-bold"
              >
                Kolejne Zdjęcie
              </button>
              <button 
                onClick={handleDownload}
                className="gold-button flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                POBIERZ ZDJĘCIE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
