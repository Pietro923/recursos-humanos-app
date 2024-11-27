"use client"

import React from "react";
import { useAppSettings } from "@/components/appSettingsProvider"; // Ajusta la ruta según tu estructura
import { auth, db } from "@/lib/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Loader2, 
  Moon,
  Save,
} from "lucide-react";

// Definimos el tipo de 'settings' para permitir claves dinámicas
interface ThemeSettings {
  mode: string;
  fontSize: string;
  animations: boolean;
}

interface LanguageSettings {
  preferred: string;
}

interface AppSettings {
  theme: ThemeSettings;
  language: LanguageSettings;
  // Agregar otras secciones según sea necesario
}

const SettingsPage = () => {
  const { settings, updateSettings } = useAppSettings();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  const handleSettingChange = (
    section: keyof AppSettings, // Usamos 'keyof AppSettings' para asegurar que 'section' es una clave válida
    key: string,
    value: string | boolean
  ) => {
    const updatedSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    
    updateSettings(updatedSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        settings,
        updatedAt: new Date().toISOString(),
      });

      toast({
        variant: "default",
        title: "Configuración actualizada",
        description: "Los cambios han sido guardados exitosamente",
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 ">
      <div className="space-y-6">
        <div className="flex justify-between items-center ">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Configuración</h1>
            <p className="text-gray-500 dark:text-white">Gestiona tus preferencias y configuración de la aplicación</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 dark:text-white dark:bg-gray-700 dark:hover:gray-600"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar Cambios
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Apariencia y Regional
                </CardTitle>
                <CardDescription>
                  Personaliza la apariencia de la aplicación y tus preferencias regionales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Tema</Label>
                    <Select
                      value={settings.theme.mode}
                      onValueChange={(value) => 
                        handleSettingChange('theme', 'mode', value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecciona un tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    
                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label>Tamaño de fuente</Label>
                    <Select
                      value={settings.theme.fontSize}
                      onValueChange={(value) => 
                        handleSettingChange('theme', 'fontSize', value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tamaño de fuente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeño</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>


                  <Separator />

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Idioma</Label>
                      <Select
                        value={settings.language.preferred}
                        onValueChange={(value) => 
                          handleSettingChange('language', 'preferred', value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecciona un idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;