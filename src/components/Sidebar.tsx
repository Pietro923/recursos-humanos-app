"use client";

import { Users, Calendar, BarChart2, DollarSign, Gift, BookOpen, LayoutDashboard, Clipboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth"; // Asegúrate de importar esto si usas Firebase para autenticación
import { auth } from "@/lib/firebaseConfig"; // Importa tu configuración de Firebase

type Role = "ADMIN" | "rrhh" | "nominas"; // Define el tipo Role

const sidebarItems: Record<Role, { href: string; icon: React.ElementType; label: string }[]> = {
  ADMIN: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/trabajadores", icon: Users, label: "Empleados" },
    { href: "/asistencia", icon: Calendar, label: "Asistencia" },
    { href: "/desempeno", icon: BarChart2, label: "Desempeño" },
    { href: "/nominas", icon: DollarSign, label: "Nóminas" },
    { href: "/beneficios", icon: Gift, label: "Beneficios" },
    { href: "/cursos", icon: BookOpen, label: "Formación" },
    { href: "/postulaciones", icon: Clipboard, label: "Postulaciones" },
  ],
  rrhh: [
    { href: "/asistencia", icon: Calendar, label: "Asistencia" },
    { href: "/desempeno", icon: BarChart2, label: "Desempeño" },
    { href: "/beneficios", icon: Gift, label: "Beneficios" },
    { href: "/cursos", icon: BookOpen, label: "Formación" },
  ],
  nominas: [
    { href: "/trabajadores", icon: Users, label: "Empleados" },
    { href: "/nominas", icon: DollarSign, label: "Nóminas" },
  ],
};

export default function Sidebar({ role }: { role: Role | null }) {
  const pathname = usePathname();

  // Verificamos que el role sea válido antes de renderizar
  if (!role || !(role in sidebarItems)) return null;

  const handleLogout = async () => {
    await signOut(auth); // Cierra sesión en Firebase
  };

  return (
    <aside className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="text-center mb-6">
        <Link href="/">
          <img 
            src="/pueble logo.png" // Asegúrate de que la ruta sea correcta
            alt="Pueble S.A Logo"
            className="h-40 mx-auto" // Ajusta la altura según sea necesario
          />
        </Link>
      </div>
      <nav>
        {sidebarItems[role].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block py-2.5 px-4 rounded transition duration-200 ${
                pathname === item.href ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
            >
              <Icon className="inline-block mr-2" size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-6 left-0 w-full px-4">
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 rounded"
        >
          <LogOut className="inline-block mr-2" size={18} />
          Salir
        </Button>
      </div>
    </aside>
  );
}
