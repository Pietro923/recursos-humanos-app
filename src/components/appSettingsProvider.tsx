import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import i18n from '@/lib/i18n';

type ThemeMode = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'normal' | 'large';
type Language = 'es' | 'en' | 'fr';

interface ThemeSettings {
  mode: ThemeMode;
  fontSize: FontSize;
  animations: boolean;
}

interface LanguageSettings {
  preferred: Language;
}

interface AppSettings {
  theme: ThemeSettings;
  language: LanguageSettings;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  applyTheme: (mode: ThemeMode) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: {
      mode: 'system',
      fontSize: 'normal',
      animations: true
    },
    language: {
      preferred: 'es' // Idioma por defecto
    }
  });

  useEffect(() => {
    // Cambiar idioma de i18n cuando cambia la configuración
    i18n.changeLanguage(settings.language.preferred);
  }, [settings.language.preferred]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().settings) {
          setSettings(userDoc.data().settings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    // Lógica para aplicar tema con variables CSS de Tailwind
    const root = document.documentElement;

    // Determinar el modo de tema
    let effectiveMode = mode;
    if (mode === 'system') {
      effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Aplicar clases para tema oscuro/claro
    root.classList.remove('dark', 'light');
    root.classList.add(effectiveMode);

    // Aplicar tamaño de fuente
    const fontSizeMap = {
      'small': '0.875rem',
      'normal': '1rem',
      'large': '1.125rem'
    };
    root.style.fontSize = fontSizeMap[settings.theme.fontSize];
  };
  
  useEffect(() => {
    applyTheme(settings.theme.mode);
  }, [settings.theme.mode, settings.theme.fontSize]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, applyTheme }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};