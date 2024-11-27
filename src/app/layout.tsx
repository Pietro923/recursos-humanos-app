"use client";
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from 'react';
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, X, ChevronDown, LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import NotificationBell from '@/components/notificaciones';
import { AppSettingsProvider } from "@/components/appSettingsProvider" // Ajusta la ruta según tu estructura

const inter = Inter({ subsets: ['latin'] });

type Role = "ADMIN" | "rrhh" | "nominas";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
            setUserName(userDoc.data().name || user.email);
          } else {
            setUserRole(null);
            setIsAuthenticated(false);
            router.push('/login');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsAuthenticated(false);
          router.push('/login');
        }
      } else {
        setIsAuthenticated(false);
        if (!isLoggingOut && pathname !== '/login') {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router, isLoggingOut]);

  const role = ["ADMIN", "rrhh", "nominas"].includes(userRole || "") ? (userRole as Role) : null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      document.body.style.pointerEvents = 'auto'; // Forzar pointer-events
      await auth.signOut();
      setUserRole(null);
      setUserName(null);
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <html lang="es">
        <body className={inter.className}>
          <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // Login page
  if (!isAuthenticated && pathname === '/login') {
    return (
      <html lang="es">
        <body className={inter.className}>
          <main className="min-h-screen">
            {children}
            <Toaster />
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
    <body className={`${inter.className} dark:bg-gray-900`}>
      <AppSettingsProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          {/* Sidebar */}
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Sidebar role={role} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navbar */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                  {/* Left section */}
                  <div className="flex items-center">
                  <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="mr-4 dark:hover:bg-gray-700"
                >
                  {isSidebarOpen ? (
                    <X className="h-6 w-6 dark:text-white" />
                  ) : (
                    <Menu className="h-6 w-6 dark:text-white" />
                  )}
                </Button>
                  </div>

                  {/* Right section */}
                  <div className="flex items-center space-x-4">
                    <NotificationBell /> 

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2 dark:text-white">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-blue-600 text-white">
                              {userName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden md:inline-block font-medium">
                            {userName}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/perfil"><DropdownMenuItem>Perfil</DropdownMenuItem></Link>
                        <Link href="/configuracion"><DropdownMenuItem>Configuración</DropdownMenuItem></Link>
                        <Link href="/notificaciones"><DropdownMenuItem>Historial de Notificaciones</DropdownMenuItem></Link>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }} 
                              className="text-red-600"
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Cerrar Sesión
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className='bg-white'>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción cerrará tu sesión actual. Tendrás que volver a iniciar sesión para acceder a tu cuenta.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Cerrar Sesión
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </div>
            </main>
          </div>
          <Toaster />
        </div>
        </AppSettingsProvider>
      </body>
    </html>
  );
}