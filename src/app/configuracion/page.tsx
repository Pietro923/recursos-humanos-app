"use client"

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, 
  Moon,
  Bell,
  Globe,
  Clock,
  Shield,
  Smartphone,
  Volume2,
  Mail,
  Keyboard,
  Eye,
  Lock,
  AlertTriangle
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    theme: {
      mode: "light",
      fontSize: "normal",
      colorScheme: "default",
      animations: true,
    },
    notifications: {
      email: true,
      push: true,
      sounds: true,
      updates: true,
      reminders: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: "public",
      activityStatus: true,
      showEmail: false,
      twoFactorAuth: false,
    },
    language: {
      preferred: "es",
      timezone: "UTC+1",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      keyboardShortcuts: true,
    },
  });

  const { toast } = useToast();

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
        toast({
          title: "Error",
          description: "No se pudieron cargar las configuraciones",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

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
        title: "Configuración actualizada",
        description: "Los cambios han sido guardados exitosamente",
      });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-gray-500">Gestiona tus preferencias y configuración de la aplicación</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="accessibility">Accesibilidad</TabsTrigger>
          </TabsList>

          {/* Pestaña General */}
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
                    <Label htmlFor="theme">Tema</Label>
                    <Select
                      value={settings.theme.mode}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          theme: { ...settings.theme, mode: value },
                        })
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

                  <div className="flex items-center justify-between">
                    <Label htmlFor="font-size">Tamaño de fuente</Label>
                    <Select
                      value={settings.theme.fontSize}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          theme: { ...settings.theme, fontSize: value },
                        })
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

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Animaciones</Label>
                      <p className="text-sm text-gray-500">
                        Activa o desactiva las animaciones de la interfaz
                      </p>
                    </div>
                    <Switch
                      checked={settings.theme.animations}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          theme: { ...settings.theme, animations: checked },
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="language">Idioma</Label>
                    <Select
                      value={settings.language.preferred}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          language: { ...settings.language, preferred: value },
                        })
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

                  <div className="flex items-center justify-between">
                    <Label htmlFor="date-format">Formato de fecha</Label>
                    <Select
                      value={settings.language.dateFormat}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          language: { ...settings.language, dateFormat: value },
                        })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Formato de fecha" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
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