import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';

interface AIProcessorProps {
  t: any;
  photos: string[];
  ean: string;
  onComplete: (data: { productName: string; proPhotos: string[]; weeeNumber?: string }) => void;
}

export const AIProcessor: React.FC<AIProcessorProps> = ({ t, photos, ean, onComplete }) => {
  const { settings } = useSettings();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const processWithAI = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // 1️⃣ gemini-3.1-pro-preview: Analiza zdjęcia i segmentacja
      setCurrentStep(1);
      const extractionResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              { text: `Analyze these product photos and EAN: ${ean}. 
              1. Extract the full product name from the packaging.
              2. Check if WEEE compliance is required for this category. If yes, provide the WEEE registration number.
              Return JSON: { "productName": "string", "weeeRequired": boolean, "weeeNumber": "string" }` },
              ...photos.map(p => ({
                inlineData: {
                  data: p.split(',')[1],
                  mimeType: "image/jpeg"
                }
              }))
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const info = JSON.parse(extractionResponse.text || '{}');

      // 2️⃣ gemini-2.5-flash-image: Generowanie / poprawa (Simulated transition for UX)
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3️⃣ Finalne ulepszenie (używa modelu z ustawień)
      setCurrentStep(3);
      const proPhotos: string[] = [];
      
      const imageResponse = await ai.models.generateContent({
        model: settings.aiImageModel || 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: photos[0].split(',')[1],
                mimeType: "image/jpeg"
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
            // imageSize is only supported for gemini-3-pro-image-preview and gemini-3.1-flash-image-preview
            ...(settings.aiImageModel !== 'gemini-2.5-flash-image' && { imageSize: "1K" })
          }
        }
      });

      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          proPhotos.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }

      if (proPhotos.length === 0) {
        proPhotos.push(photos[0]);
      }

      onComplete({
        productName: info.productName || (t.eanLabel === "EAN / GTIN" ? "Unknown Product" : "Nieznany Produkt"),
        proPhotos: proPhotos,
        weeeNumber: info.weeeNumber
      });

    } catch (err: any) {
      console.error("AI Processing Error:", err);
      setStatus('error');
      setError(err.message || t.error);
    }
  };

  useEffect(() => {
    processWithAI();
  }, []);

  const steps = [
    { id: 1, title: "Segmentacja i Analiza", desc: "gemini-3.1-pro-preview" },
    { id: 2, title: "Generowanie Otoczenia", desc: "gemini-2.5-flash-image" },
    { id: 3, title: "Upscaling i Retusz", desc: settings.aiImageModel || "gemini-3-pro-image-preview" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-8 text-center">
      <AnimatePresence mode="wait">
        {status === 'processing' ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center w-full max-w-md"
          >
            <div className="relative mb-8">
              <Loader2 className="w-20 h-20 text-pro-blue animate-spin" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-gold animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-8 uppercase tracking-widest">
              GUSCHALL Vision Pro
            </h2>

            <div className="w-full space-y-4">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                    currentStep === step.id 
                      ? 'bg-pro-blue/20 border-pro-blue/50 shadow-[0_0_15px_rgba(0,83,160,0.3)]' 
                      : currentStep > step.id 
                        ? 'bg-white/5 border-white/10 opacity-50'
                        : 'bg-transparent border-transparent opacity-30'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : currentStep === step.id ? (
                      <Loader2 className="w-6 h-6 text-pro-blue animate-spin" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-white/20" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className={`font-bold ${currentStep === step.id ? 'text-white' : 'text-white/70'}`}>
                      {step.id}. {step.title}
                    </div>
                    <div className="text-xs font-mono text-gold/80">
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="p-4 rounded-full bg-red-500/20">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{t.aiError}</h2>
              <p className="text-red-400 text-sm mb-6">{error}</p>
              <button 
                onClick={() => {
                  setStatus('processing');
                  processWithAI();
                }}
                className="gold-button"
              >
                {t.tryAgain}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
