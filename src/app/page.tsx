"use client";

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, Users, Calculator, Shield } from "lucide-react";


export default function Inicio() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setError("El documento del usuario no existe en Firestore. Verifica el UID.");
          }
        } catch (err) {
          console.error("Error al obtener el rol del usuario:", err);
          setError("Error: no tienes permisos para acceder a esta información.");
        }
      } else {
        // Redirigir al login sin mostrar la página intermedia
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-72" />
          <Skeleton className="h-48 w-72" />
          <Skeleton className="h-48 w-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const roleCards = [
    {
      role: 'ADMIN',
      title: 'Administración',
      description: 'Accede al panel de administración completo del sistema',
      icon: Shield,
      path: '/admin',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      role: 'RRHH',
      title: 'Recursos Humanos',
      description: 'Gestiona el personal y procesos de RRHH',
      icon: Users,
      path: '/rrhh',
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      role: 'NOMINAS',
      title: 'Nóminas',
      description: 'Administra las nóminas y pagos del personal',
      icon: Calculator,
      path: '/nominas',
      color: 'bg-yellow-500/10 text-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold tracking-tight">
              Bienvenido, {userRole || 'Usuario'}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Selecciona una de las siguientes opciones para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 mt-6">
              {/* Dashboard Card - Available to all */}
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="flex items-center p-6">
                  <div className="bg-blue-500/10 p-3 rounded-lg mr-4 group-hover:bg-blue-500/20 transition-all duration-300">
                    <LayoutDashboard className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-1">Dashboard Principal</h3>
                    <p className="text-muted-foreground">Accede al panel principal del sistema</p>
                  </div>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="default"
                    className="ml-4"
                  >
                    Acceder
                  </Button>
                </CardContent>
              </Card>

              {/* Role-specific cards */}
              {roleCards.map((card) => (
                userRole?.toUpperCase() === card.role && (
                  <Card key={card.role} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="flex items-center p-6">
                      <div className={`p-3 rounded-lg mr-4 group-hover:opacity-80 transition-all duration-300 ${card.color}`}>
                        <card.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg mb-1">{card.title}</h3>
                        <p className="text-muted-foreground">{card.description}</p>
                      </div>
                      <Button
                        onClick={() => router.push(card.path)}
                        variant="default"
                        className="ml-4"
                      >
                        Acceder
                      </Button>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
