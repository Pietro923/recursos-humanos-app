"use client";

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, Users, Calculator, Shield, Cake } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { differenceInYears, isSameDay } from 'date-fns';

interface Employee {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  companyId?: string;
}

export default function Inicio() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [birthdayEmployees, setBirthdayEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation(); // Hook de traducción

  const checkBirthdays = async () => {
    try {
      // Obtener dinámicamente las empresas de la colección "Grupo_Pueble"
      const groupRef = collection(db, "Grupo_Pueble");
      const groupSnapshot = await getDocs(groupRef);
      
      const companies = groupSnapshot.docs
        .filter(doc => doc.id !== 'empleados') // Excluir colecciones que no sean empresas si es necesario
        .map(doc => ({
          name: doc.id,
          collectionPath: `Grupo_Pueble/${doc.id}/empleados`
        }));
  
      const employeesData: { employee: Employee; companyName: string }[] = [];
  
      // Obtener empleados de cada empresa
      for (const company of companies) {
        try {
          const employeesRef = collection(db, company.collectionPath);
          const employeesSnapshot = await getDocs(employeesRef);
  
          employeesSnapshot.docs.forEach((doc) => {
            employeesData.push({
              employee: {
                id: doc.id,
                ...doc.data(),
              } as Employee,
              companyName: company.name,
            });
          });
        } catch (companyError) {
          console.error(`Error al obtener empleados de ${company.name}:`, companyError);
          // Continuar con las siguientes empresas si hay un error en una
          continue;
        }
      }
  
      const today = new Date();
  
      // Filtrar empleados que cumplen años hoy
      const birthdays = employeesData.filter(({ employee }) => {
        const birthDate = new Date(employee.fechaNacimiento + "T00:00:00");
        return isSameDay(
          new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
        );
      });
  
      // Actualizar estado de empleados de cumpleaños (asumiendo que tienes esta función)
      setBirthdayEmployees(birthdays.map(({ employee }) => employee));
  
      // Crear notificaciones para cumpleaños
      for (const { employee, companyName } of birthdays) {
        const remindersRef = collection(db, "Grupo_Pueble", companyName, "recordatorios");
        const archivedRef = collection(db, "Grupo_Pueble", companyName, "notificaciones_archivadas");
  
        // Verificar si ya existe el recordatorio
        const remindersQuery = await getDocs(remindersRef);
        const existingBirthdayReminder = remindersQuery.docs.find((doc) => {
          const reminder = doc.data();
          return (
            reminder.empleadoId === employee.id &&
            isSameDay(reminder.fechaInicio.toDate(), new Date()) &&
            reminder.tipo === "Cumpleaños"
          );
        });
  
        const archivedQuery = await getDocs(archivedRef);
        const archivedBirthdayReminder = archivedQuery.docs.find((doc) => {
          const archived = doc.data();
          return (
            archived.empleadoId === employee.id &&
            isSameDay(archived.fechaInicio.toDate(), new Date()) &&
            archived.tipo === "Cumpleaños"
          );
        });
  
        // Crear recordatorio solo si no existe
        if (!existingBirthdayReminder && !archivedBirthdayReminder) {
          await addDoc(remindersRef, {
            tipo: "Cumpleaños",
            descripcion: `¡${employee.nombre} ${employee.apellido} cumple ${differenceInYears(new Date(), new Date(employee.fechaNacimiento))} años hoy!`,
            fechaInicio: new Date(),
            fechaFin: new Date(new Date().setHours(23, 59, 59, 999)),
            empleadoId: employee.id,
            nombre: employee.nombre,
            apellido: employee.apellido,
          });
        }
      }
    } catch (err) {
      console.error("Error al verificar cumpleaños:", err);
    }
  };
  


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
            await checkBirthdays(); // Llama a la función para verificar cumpleaños
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
      title: t('dashboard.roles.ADMIN.title'),
      description: t('dashboard.roles.ADMIN.description'),
      icon: Shield,
      path: '/admin',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      role: 'RRHH',
      title: t('dashboard.roles.RRHH.title'),
      description:  t('dashboard.roles.RRHH.description'),
      icon: Users,
      path: '/trabajadores',
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      role: 'NOMINAS',
      title: t('dashboard.roles.NOMINAS.title'),
      description: t('dashboard.roles.NOMINAS.description'),
      icon: Calculator,
      path: '/nominas',
      color: 'bg-yellow-500/10 text-yellow-500',
    },
  ];

  return (
    <div className="bg-gradient-to-br py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-2xl border-none rounded-2xl overflow-hidden dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 border-b dark:border-gray-700">
            <CardTitle className="text-center text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              {t('dashboard.welcomeMessage', { userRole: userRole || 'Usuario' })}
            </CardTitle>
            <CardDescription className="text-center text-lg mt-2 text-gray-600 dark:text-gray-300 font-medium">
              {t('dashboard.selectOptionMessage')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid gap-6">
              {/* Birthday Employees Section */}
              {birthdayEmployees.length > 0 && (
                <div className="space-y-4">
                  {birthdayEmployees.map((employee) => (
                    <Alert 
                      key={employee.id} 
                      className="border-transparent bg-blue-50/50 dark:bg-gray-700/50 
                        transition-all duration-300 ease-in-out 
                        hover:scale-[1.02] hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full">
                          <Cake className="h-7 w-7 text-blue-600 dark:text-blue-300 animate-bounce" />
                        </div>
                        <div>
                          <AlertTitle className="text-blue-900 dark:text-white font-bold text-lg">
                            {t('empleados.birthday.title')}
                          </AlertTitle>
                          <AlertDescription className="text-blue-800 dark:text-blue-200 text-base">
                            {t('empleados.birthday.description')} <span className="font-extrabold">{employee.nombre} {employee.apellido}</span>
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
  
              {/* Dashboard Cards */}
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Dashboard Card */}
                <Card className="group overflow-hidden transition-all duration-300 
                  hover:shadow-xl hover:scale-[1.02] 
                  dark:bg-gray-700/50 dark:hover:bg-gray-600/60
                  w-full max-w-md mx-auto">
  <CardContent className="flex flex-col sm:flex-row items-center p-6 space-y-4 sm:space-y-0 sm:space-x-4">
    <div className="flex items-center w-full">
      <div className="bg-blue-500/10 dark:bg-blue-500/20 p-4 rounded-xl 
        transition-all group-hover:rotate-6 group-hover:scale-110 mr-4">
        <LayoutDashboard className="h-7 w-7 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-1">
          {t('dashboard.mainDashboard')}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-base">
          {t('dashboard.mainDashboardDescription')}
        </p>
      </div>
    </div>
    <div className="w-full sm:w-auto mt-4 sm:mt-0">
      <Button
        onClick={() => router.push('/dashboard')}
        variant="default"
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 
          dark:bg-blue-700 dark:hover:bg-blue-600 
          transition-all duration-300 
          px-4 py-2 rounded-lg"
      >
        {t('dashboard.access')}
      </Button>
    </div>
  </CardContent>
</Card>
  
                {/* Role-specific Cards */}
                {roleCards.map((card) => (
                  userRole?.toUpperCase() === card.role && (
                    <Card 
      key={card.role} 
      className="group overflow-hidden transition-all duration-300  
        hover:shadow-xl hover:scale-[1.02] 
        dark:bg-gray-700/50 dark:hover:bg-gray-600/60
        w-full max-w-md mx-auto"
    >
      <CardContent className="flex flex-col sm:flex-row items-center p-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center w-full">
          <div className={`p-4 rounded-xl 
            transition-all group-hover:rotate-6 group-hover:scale-110 
            ${card.color} dark:opacity-80 mr-4`}>
            <card.icon className="h-7 w-7 dark:text-white" />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-1">
              {card.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-base">
              {card.description}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0">
          <Button
            onClick={() => router.push(card.path)}
            variant="default"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 
              dark:bg-blue-700 dark:hover:bg-blue-600 
              transition-all duration-300 
              px-4 py-2 rounded-lg"
          >
            {t('dashboard.access')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}