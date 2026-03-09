/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OpeningCeremony } from './components/OpeningCeremony';
import { Slot } from './components/Slot';
import { EANScanner } from './components/EANScanner';
import { PhotoSession } from './components/PhotoSession';
import { AIProcessor } from './components/AIProcessor';
import { Verification } from './components/Verification';
import { FinancialReport } from './components/FinancialReport';
import { InventoryList } from './components/InventoryList';
import { Login } from './components/Login';
import { useAuth } from './contexts/AuthContext';
import { Camera, LayoutGrid, Settings, User, LogOut, PackageSearch, Sparkles, Globe, Moon, Sun, Download, Smartphone } from 'lucide-react';
import { InventoryData } from './lib/utils';
import { Language, translations } from './lib/translations';

import { saveInventoryToGoogle } from './services/googleService';

import { PhotoEditor } from './components/PhotoEditor';
import { SettingsPanel } from './components/SettingsPanel';
import { useSettings } from './contexts/SettingsContext';

export default function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const { settings } = useSettings();
  const [showSplash, setShowSplash] = useState(true);
  const [activeModule, setActiveModule] = useState<'home' | 'scan' | 'photo-only' | 'settings'>('home');
  const [scanStep, setScanStep] = useState<1 | 2 | 3 | 4>(1);
  const [language, setLanguage] = useState<Language>('pl');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<Partial<InventoryData>>({});

  const t = translations[language];

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleEANDetected = (ean: string) => {
    setInventoryData(prev => ({ ...prev, ean }));
    setScanStep(2);
  };

  const handlePhotosComplete = (photos: string[]) => {
    setInventoryData(prev => ({ ...prev, rawPhotos: photos }));
    setScanStep(3);
  };

  const handleAIComplete = (data: { productName: string; proPhotos: string[]; weeeNumber?: string }) => {
    setInventoryData(prev => ({ ...prev, ...data }));
    setScanStep(4);
  };

  const handleFinalSubmit = async (amount: number) => {
    const finalData = { ...inventoryData, amount } as InventoryData;
    setIsSubmitting(true);
    
    try {
      await saveInventoryToGoogle(finalData, settings);
      
      alert(t.success);
      handleClearData();
    } catch (err) {
      console.error("Submission error:", err);
      alert(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearData = () => {
    setActiveModule('home');
    setScanStep(1);
    setInventoryData({});
  };

  if (showSplash) {
    return <OpeningCeremony onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return <Login language={language} />;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 overflow-hidden ${darkMode ? 'dark bg-deep-black text-white' : 'bg-white text-black'}`}>
      {/* Header / Top Bar - Minimalist */}
      <header className={`p-6 flex justify-between items-center z-20 ${darkMode ? '' : 'border-b border-black/5'}`}>
        <div className="flex items-center gap-4">
          <img 
            src="https://i.imgur.com/dZdQEWX.png" 
            alt="Logo" 
            className="h-8 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold uppercase tracking-[0.4em] ${darkMode ? 'text-white/40' : 'text-black/40'}`}>GUSCHALL</span>
            <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${darkMode ? 'text-white/20' : 'text-black/20'}`}>APPS!!!!</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pro-blue/10 text-pro-blue text-[10px] font-bold uppercase tracking-widest hover:bg-pro-blue/20 transition-colors"
            >
              <Smartphone className="w-3 h-3" />
              {t.installPWA}
            </button>
          )}

          {activeModule === 'scan' && (
            <button 
              onClick={handleClearData}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${darkMode ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-red-500/5 text-red-600 hover:bg-red-500/10'}`}
            >
              {t.clearData}
            </button>
          )}
          {/* Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Language Selector */}
          <div className={`flex items-center rounded-full p-1 border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
            {(['pl', 'de', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                  language === lang 
                    ? 'bg-pro-blue text-white shadow-[0_0_10px_rgba(0,83,160,0.5)]' 
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setActiveModule('settings')}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
            title="Ustawienia"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button 
            onClick={logout}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className={`w-10 h-10 rounded-full p-[1px] bg-gradient-to-br ${darkMode ? 'from-pro-blue to-white/10' : 'from-pro-blue to-black/10'}`}>
            <div className={`w-full h-full rounded-full flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}>
              <User className={`w-5 h-5 ${darkMode ? 'text-white/80' : 'text-black/80'}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Logo Reconstruction */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {activeModule === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full flex justify-center"
            >
              <SettingsPanel onBack={() => setActiveModule('home')} />
            </motion.div>
          )}

          {activeModule === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center w-full max-w-4xl"
            >
              {/* Central High-Impact Logo */}
              <div className="relative mb-12">
                <motion.img 
                  src="https://i.imgur.com/dZdQEWX.png" 
                  alt="GUSCHALL APPS Logo" 
                  className="h-64 md:h-80 w-auto logo-impact object-contain"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  referrerPolicy="no-referrer"
                />
                {/* Subtle pulse effect behind logo */}
                <div className="absolute inset-0 bg-pro-blue/10 blur-[100px] -z-10 rounded-full animate-pulse" />
              </div>

              {/* Welcome Text Block - Preserved at the bottom of the central area */}
              <div className="text-center space-y-3 mb-12">
                <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>
                  {t.welcome} <span className="text-pro-blue">{t.operator}</span>
                </h1>
                <p className={`text-lg md:text-xl ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                  {t.chooseModule}
                </p>
              </div>

              {/* Modular Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                <Slot 
                  title={t.scanModule}
                  description={t.scanDesc}
                  icon={<Camera />}
                  onClick={() => setActiveModule('scan')}
                  className={darkMode ? "border-pro-blue/20 bg-pro-blue/5" : "border-pro-blue/20 bg-pro-blue/5"}
                />
                <Slot 
                  title={t.photoModule || "PRZERABIANIE ZDJĘĆ"}
                  description={t.photoDesc || "Wygeneruj profesjonalny packshot z dowolnego zdjęcia."}
                  icon={<Sparkles />}
                  onClick={() => setActiveModule('photo-only')}
                  className={darkMode ? "" : "bg-black/5 border-black/10"}
                />
              </div>
            </motion.div>
          )}

          {activeModule === 'photo-only' && (
            <motion.div
              key="photo-only"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full flex justify-center"
            >
              <PhotoEditor t={t} onBack={() => setActiveModule('home')} />
            </motion.div>
          )}

          {activeModule === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {scanStep === 1 && (
                <EANScanner 
                  t={t}
                  onDetected={handleEANDetected} 
                  onCancel={() => setActiveModule('home')} 
                />
              )}
              {scanStep === 2 && (
                <PhotoSession 
                  t={t}
                  onComplete={handlePhotosComplete} 
                  onCancel={() => setScanStep(1)} 
                />
              )}
              {scanStep === 3 && (
                <AIProcessor 
                  t={t}
                  photos={inventoryData.rawPhotos || []} 
                  ean={inventoryData.ean || ''}
                  onComplete={handleAIComplete}
                />
              )}
              {scanStep === 4 && (
                <Verification 
                  t={t}
                  data={{
                    productName: inventoryData.productName || '',
                    ean: inventoryData.ean || '',
                    proPhotos: inventoryData.proPhotos || [],
                    rawPhotos: inventoryData.rawPhotos || [],
                    weeeNumber: inventoryData.weeeNumber
                  }}
                  isSubmitting={isSubmitting}
                  onConfirm={handleFinalSubmit}
                  onBack={() => setScanStep(2)}
                  onClear={handleClearData}
                  onGoToStudio={handleGoToStudio}
                />
              )}
            </motion.div>
          )}

          {activeModule === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center w-full max-w-5xl gap-8"
            >
              <InventoryList t={t} />
              <FinancialReport language={language} t={t} />
              
              <button 
                onClick={() => setActiveModule('home')}
                className="text-gold font-bold uppercase tracking-widest text-xs hover:text-gold/80 transition-colors"
              >
                {t.backToMenu}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav (Mobile Only) */}
      <nav className={`p-4 backdrop-blur-xl border-t flex justify-around items-center sticky bottom-0 z-20 ${darkMode ? 'bg-black/80 border-white/5' : 'bg-white/80 border-black/5'}`}>
        <button 
          onClick={() => setActiveModule('home')}
          className={`p-3 rounded-2xl transition-colors ${activeModule === 'home' ? 'bg-pro-blue/20 text-pro-blue' : (darkMode ? 'text-white/40' : 'text-black/40')}`}
        >
          <LayoutGrid className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveModule('scan')}
          className={`p-3 rounded-2xl transition-colors ${activeModule === 'scan' ? 'bg-pro-blue/20 text-pro-blue' : (darkMode ? 'text-white/40' : 'text-black/40')}`}
        >
          <Camera className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveModule('home')}
          className={`p-3 rounded-2xl transition-colors ${darkMode ? 'text-white/40' : 'text-black/40'}`}
        >
          <LogOut className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}
