import React, { useState } from 'react';
import { CheckCircle2, Package, Hash, Layers, Send, ChevronLeft, Loader2, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VerificationProps {
  t: any;
  data: {
    productName: string;
    ean: string;
    proPhotos: string[];
    rawPhotos: string[];
    weeeNumber?: string;
  };
  isSubmitting: boolean;
  onConfirm: (amount: number) => void;
  onBack: () => void;
  onClear: () => void;
  onGoToStudio: () => void;
}

export const Verification: React.FC<VerificationProps> = ({ t, data, isSubmitting, onConfirm, onBack, onClear, onGoToStudio }) => {
  const [amount, setAmount] = useState(1);
  const [isFlowActive, setIsFlowActive] = useState(false);

  const handleSubmit = async () => {
    onConfirm(amount);
  };

  const triggerWorkspaceFlow = async () => {
    setIsFlowActive(true);
    // Simulate API call to studio.workspace.google.com
    setTimeout(() => {
      setIsFlowActive(false);
      alert(t.auctionDescFlow);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-deep-black flex flex-col overflow-y-auto">
      <AnimatePresence>
        {(isSubmitting || isFlowActive) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-gold animate-spin" />
              <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full animate-pulse" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-white uppercase tracking-widest">
              {isFlowActive ? "WORKSPACE STUDIO FLOW" : (t.aiProcessing || 'Submitting...')}
            </h3>
            <p className="mt-2 text-white/40 text-sm max-w-xs">
              {isFlowActive ? "Activating Auction Description Flow..." : (t.secureEnv || 'Connecting to Google Cloud...')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-4 flex items-center gap-4 bg-black/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-gold">{t.step4}</h2>
      </div>

      <div className="p-6 flex flex-col gap-8 pb-32">
        {/* Pro Photo Preview */}
        <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 bg-black">
          <img 
            src={data.proPhotos[0]} 
            alt="Pro Packshot" 
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 right-4 bg-electric-purple/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {t.jblStyle}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t.aiName}</label>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-electric-purple mt-1 flex-shrink-0" />
              <p className="text-xl font-bold leading-tight">{data.productName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t.eanLabel}</label>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gold" />
                <p className="font-mono text-sm">{data.ean}</p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t.amount}</label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setAmount(Math.max(1, amount - 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="text-xl font-bold w-8 text-center">{amount}</span>
                <button 
                  onClick={() => setAmount(amount + 1)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {data.weeeNumber && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Compliance (WEEE)</p>
                <p className="text-sm font-bold">Reg. No: {data.weeeNumber}</p>
              </div>
            </div>
          )}
        </div>

        {/* Raw Photos Strip */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t.rawPhotos}</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {data.rawPhotos.map((p, i) => (
              <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                <img src={p} alt={`Raw ${i}`} className="w-full h-full object-cover opacity-50" />
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <button 
            onClick={triggerWorkspaceFlow}
            className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-pro-blue/20 border border-pro-blue/30 text-pro-blue text-xs font-bold uppercase tracking-widest hover:bg-pro-blue/30 transition-all shadow-[0_0_15px_rgba(0,83,160,0.2)]"
          >
            <Zap className="w-4 h-4" />
            {t.workspaceFlow}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <button 
            onClick={onClear}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors"
          >
            {t.clearData}
          </button>
          <button 
            onClick={onGoToStudio}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            {t.goToStudio}
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gold-button w-full flex items-center justify-center gap-3 py-4 text-lg"
        >
          {isSubmitting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Layers className="w-6 h-6" />
            </motion.div>
          ) : (
            <>
              <Send className="w-6 h-6" />
              {t.submit}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
