import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppSettings {
  dataSourceId: string;
  selectedCameraId: string;
  targetSheetName: string;
  colEan: string;
  colName: string;
  colPrice: string;
  colMpn: string;
  targetPhotoFolderId: string;
  aiImageModel: string;
}

const defaultSettings: AppSettings = {
  dataSourceId: '',
  selectedCameraId: '',
  targetSheetName: 'Sheet1',
  colEan: 'A',
  colName: 'B',
  colPrice: 'C',
  colMpn: 'D',
  targetPhotoFolderId: '',
  aiImageModel: 'gemini-3-pro-image-preview',
};

const getInitialSettings = (): AppSettings => {
  const saved = localStorage.getItem('guschall_settings');
  if (saved) {
    try {
      return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
  }
  return defaultSettings;
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(getInitialSettings);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('guschall_settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
