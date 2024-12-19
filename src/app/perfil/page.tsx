"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone, User, Building, NotebookText, LinkIcon } from "lucide-react";
import { getFirestore, doc,getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from "react-i18next";

interface CurrentUser {
  uid: string;
  email: string | null;
}

interface UserProfile {
  nickname: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  bio: string;
  avatarUrl: string; // Nuevo campo para la URL del avatar
}

const ProfilePage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const { t } = useTranslation(); // Hook de traducción
  
  const [formData, setFormData] = useState<UserProfile>({
    nickname: "",
    fullName: "",
    email: "",
    phone: "",
    department: "",
    bio: "",
    avatarUrl: "", // Inicializar con cadena vacía
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({ uid: user.uid, email: user.email });
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Verificar que los datos cumplen con el tipo UserProfile
            const userData: UserProfile = {
              nickname: data.nickname || "",
              fullName: data.fullName || "",
              email: data.email || "",
              phone: data.phone || "",
              department: data.department || "",
              bio: data.bio || "",
              avatarUrl: data.avatarUrl || "", // Obtener URL del avatar
            };
            setFormData(userData);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchUserData();
  }, [currentUser]);

  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const db = getFirestore();
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          nickname: formData.nickname,
          fullName: formData.fullName,
          phone: formData.phone,
          department: formData.department,
          bio: formData.bio,
          avatarUrl: formData.avatarUrl, // Guardar URL del avatar
        });
        toast({
          title: t('perfil.perfil_actualizado'),
          description: t('perfil.cambios_guardados'),
        });
      } else {
        throw new Error('No se pudo obtener el usuario actual');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: t('perfil.guardar_error'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Tabs defaultValue="personal" className="w-full">
      <TabsList className="flex flex-col sm:flex-row w-full">
  <TabsTrigger className="flex-1" value="personal">{t('perfil.info_personal')}</TabsTrigger>
  <TabsTrigger className="flex-1" value="actualizar">{t('perfil.actualizar_info')}</TabsTrigger>
</TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>{t('perfil.perfil_personal')}</CardTitle>
              <CardDescription>
              {t('perfil.descripcion_perfil')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 ">
                <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatarUrl || ""} />
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    {formData.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nickname">
                    <User className="inline-block w-4 h-4 mr-2" />
                    {t('perfil.nickname')}
                  </Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    value={formData.nickname}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    <User className="inline-block w-4 h-4 mr-2" />
                    {t('perfil.nombre_completo')}
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline-block w-4 h-4 mr-2" />
                    {t('perfil.email')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="inline-block w-4 h-4 mr-2" />
                    {t('perfil.telefono')}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    <Building className="inline-block w-4 h-4 mr-2" />
                    {t('perfil.departamento')}
                  </Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                <NotebookText className="inline-block w-4 h-4 mr-2" />
                  <Label htmlFor="bio">{t('perfil.biografia')}</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    disabled
                    className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="actualizar">
        <Card>
            <CardHeader>
              <CardTitle>{t('perfil.actualizar_perfil')}</CardTitle>
              <CardDescription>
              {t('perfil.descripcion_actualizar')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatarUrl || ""} />
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    {formData.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {/* Nuevo campo para URL del avatar */}
                <div className="space-y-2 w-full max-w-md">
                  <Label htmlFor="avatarUrl">
                    <LinkIcon className="inline-block w-4 h-4 mr-2" />
                    {t('perfil.url_avatar')}
                  </Label>
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/mi-avatar.jpg"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nickname">
                    <User className="inline-block w-4 h-4 mr-2" />
                    {t('perfil.nickname')}
                  </Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    <User className="inline-block w-4 h-4 mr-2" />
                    {t('perfil.nombre_completo')}
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline-block w-4 h-4 mr-2" />
                    {t('perfil.email')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="inline-block w-4 h-4 mr-2" />
                    {t('perfil.telefono')}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    <Building className="inline-block w-4 h-4 mr-2" />
                    {t('perfil.departamento')}
                  </Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                <NotebookText className="inline-block w-4 h-4 mr-2" />
                  <Label htmlFor="bio"> {t('perfil.biografia')}</Label>
                  
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">{t('perfil.cancelar')}</Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('perfil.guardar_cambios')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;