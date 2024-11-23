"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    document.body.style.pointerEvents = 'auto';
    return () => {
      document.body.style.pointerEvents = 'auto';
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("Usuario no encontrado.");
      } else if (err.code === "auth/wrong-password") {
        setError("Contraseña incorrecta.");
      } else {
        setError("Error de autenticación. Intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex ">
      {/* Sección izquierda: Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-20">
        <div className="max-w-md w-full mx-auto space-y-8">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-8"
          >
            <img
              src="/pueble logo grande.jpg"
              alt="Logo"
              className="h-40 w-auto drop-shadow-lg hover:scale-105 transition-transform duration-300"
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8 border-none shadow-2xl rounded-3xl bg-white/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Bienvenido de nuevo
                  </h1>
                  <p className="text-gray-500">
                    Ingresa tus credenciales para continuar
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-4">
                    <div className="relative">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Correo Electrónico
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="usuario@empresa.com"
                          required
                          className="pl-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Contraseña
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="pl-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Iniciando sesión...</span>
                      </div>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Sección derecha: Ilustración */}
      <div className="hidden lg:flex lg:w-1/2">
        <div className="w-full flex flex-col items-center justify-center p-12 space-y-8">
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            src="/zafra.jpg"
            alt="Ilustración de progreso"
            className="max-w-md w-full h-auto hover:scale-105 transition-transform duration-300"
          />
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center space-y-4 max-w-md"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestiona tus proyectos fácilmente
            </h2>
            <p className="text-gray-600 text-lg">
              Monitorea el progreso de tus proyectos y mantén todo bajo control
              desde nuestra plataforma.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}