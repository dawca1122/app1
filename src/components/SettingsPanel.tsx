import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Save, Camera, Database, Map, ChevronLeft, Cpu } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const SettingsPanel = ({ onBack }: { onBack: () => void }) => {
  const { settings, updateSettings } = useSettings();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devs => {
      setDevices(devs.filter(d => d.kind === 'videoinput'));
    });
  }, []);

  const handleChange = (field: keyof typeof settings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    alert('Ustawienia zostały zapisane pomyślnie!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl space-y-6 text-white p-6 pb-32"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold uppercase tracking-widest text-gold">Ustawienia Systemu</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Źródło Danych */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-pro-blue" />
            <h3 className="text-xl font-bold uppercase tracking-widest">Źródło Danych</h3>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/60 uppercase tracking-widest">ID Folderu Drive / Arkusza (Source)</label>
            <input 
              type="text" 
              value={localSettings.dataSourceId}
              onChange={(e) => handleChange('dataSourceId', e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-pro-blue outline-none transition-colors"
              placeholder="np. 1gTT53zuUTLwl..."
            />
          </div>
        </div>

        {/* Wybór Aparatu */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-6 h-6 text-pro-blue" />
            <h3 className="text-xl font-bold uppercase tracking-widest">Wybór Aparatu</h3>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/60 uppercase tracking-widest">Domyślna Kamera</label>
            <select 
              value={localSettings.selectedCameraId}
              onChange={(e) => handleChange('selectedCameraId', e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-pro-blue outline-none transition-colors appearance-none"
            >
              <option value="">Automatycznie (Tylna Kamera)</option>
              {devices.map(dev => (
                <option key={dev.deviceId} value={dev.deviceId}>
                  {dev.label || `Kamera ${dev.deviceId.substring(0, 5)}...`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Model AI */}
        <div className="glass-panel p-6 space-y-4 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-6 h-6 text-pro-blue" />
            <h3 className="text-xl font-bold uppercase tracking-widest">Model AI (Przetwarzanie Zdjęć)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className={`flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-colors ${localSettings.aiImageModel === 'gemini-3-pro-image-preview' ? 'bg-pro-blue/20 border-pro-blue/50' : 'bg-black/50 border-white/10 hover:border-pro-blue/30'}`}>
              <div className="flex items-center justify-between">
                <div className="font-bold text-white">Nano Banana Pro</div>
                <input 
                  type="radio" 
                  name="aiModel" 
                  value="gemini-3-pro-image-preview"
                  checked={localSettings.aiImageModel === 'gemini-3-pro-image-preview'}
                  onChange={(e) => handleChange('aiImageModel', e.target.value)}
                  className="accent-pro-blue"
                />
              </div>
              <div className="text-xs font-mono text-gold/80">gemini-3-pro-image-preview</div>
              <div className="text-xs text-white/60 mt-1">Najwyższa jakość studyjna, fotorealistyczne cienie i detale. Zalecany do profesjonalnych packshotów.</div>
            </label>
            
            <label className={`flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-colors ${localSettings.aiImageModel === 'gemini-3.1-flash-image-preview' ? 'bg-pro-blue/20 border-pro-blue/50' : 'bg-black/50 border-white/10 hover:border-pro-blue/30'}`}>
              <div className="flex items-center justify-between">
                <div className="font-bold text-white">Flash Image 3.1</div>
                <input 
                  type="radio" 
                  name="aiModel" 
                  value="gemini-3.1-flash-image-preview"
                  checked={localSettings.aiImageModel === 'gemini-3.1-flash-image-preview'}
                  onChange={(e) => handleChange('aiImageModel', e.target.value)}
                  className="accent-pro-blue"
                />
              </div>
              <div className="text-xs font-mono text-gold/80">gemini-3.1-flash-image-preview</div>
              <div className="text-xs text-white/60 mt-1">Szybkie generowanie w wysokiej rozdzielczości. Optymalny balans między czasem a jakością.</div>
            </label>

            <label className={`flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-colors ${localSettings.aiImageModel === 'gemini-2.5-flash-image' ? 'bg-pro-blue/20 border-pro-blue/50' : 'bg-black/50 border-white/10 hover:border-pro-blue/30'}`}>
              <div className="flex items-center justify-between">
                <div className="font-bold text-white">Flash Image 2.5</div>
                <input 
                  type="radio" 
                  name="aiModel" 
                  value="gemini-2.5-flash-image"
                  checked={localSettings.aiImageModel === 'gemini-2.5-flash-image'}
                  onChange={(e) => handleChange('aiImageModel', e.target.value)}
                  className="accent-pro-blue"
                />
              </div>
              <div className="text-xs font-mono text-gold/80">gemini-2.5-flash-image</div>
              <div className="text-xs text-white/60 mt-1">Podstawowy model do błyskawicznej edycji i usuwania tła. Najszybszy czas reakcji.</div>
            </label>
          </div>
        </div>

        {/* Mapowanie Zapisu */}
        <div className="glass-panel p-6 space-y-4 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Map className="w-6 h-6 text-pro-blue" />
            <h3 className="text-xl font-bold uppercase tracking-widest">Mapowanie Zapisu (Workspace Studio)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-white/60 uppercase tracking-widest">Docelowa Tabela/Arkusz</label>
              <input 
                type="text" 
                value={localSettings.targetSheetName}
                onChange={(e) => handleChange('targetSheetName', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-pro-blue outline-none transition-colors"
                placeholder="np. Sheet1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60 uppercase tracking-widest">Docelowy Folder na Zdjęcia (ID)</label>
              <input 
                type="text" 
                value={localSettings.targetPhotoFolderId}
                onChange={(e) => handleChange('targetPhotoFolderId', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-pro-blue outline-none transition-colors"
                placeholder="Pozostaw puste dla głównego katalogu"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <label className="text-xs text-white/60 uppercase tracking-widest">Kolumna EAN</label>
              <input 
                type="text" 
                value={localSettings.colEan}
                onChange={(e) => handleChange('colEan', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-pro-blue outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60 uppercase tracking-widest">Kolumna Nazwa</label>
              <input 
                type="text" 
                value={localSettings.colName}
                onChange={(e) => handleChange('colName', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-pro-blue outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60 uppercase tracking-widest">Kolumna Cena</label>
              <input 
                type="text" 
                value={localSettings.colPrice}
                onChange={(e) => handleChange('colPrice', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-pro-blue outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60 uppercase tracking-widest">Kolumna MPN</label>
              <input 
                type="text" 
                value={localSettings.colMpn}
                onChange={(e) => handleChange('colMpn', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-pro-blue outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button 
          onClick={handleSave}
          className="gold-button flex items-center gap-2 px-8"
        >
          <Save className="w-5 h-5" />
          ZAPISZ USTAWIENIA
        </button>
      </div>
    </motion.div>
  );
};
