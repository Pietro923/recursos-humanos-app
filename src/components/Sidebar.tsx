"use client";
import { Users, Calendar, BarChart2, DollarSign, Gift, BookOpen, LayoutDashboard, Clipboard, LogOut, AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
type Role = "ADMIN" | "rrhh" | "nominas";

const NavLink = ({ href, icon: Icon, label, isActive, onClick }: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`
      group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium
      transition-all duration-300 ease-in-out
      hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 
      dark:hover:from-blue-900 dark:hover:to-blue-800 // Ajuste para tema oscuro
      ${isActive 
        ? "bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 text-blue-600 dark:text-blue-400" 
        : "text-gray-600 dark:text-gray-300"}
    `}
  >
    {/* Hover Effect Border */}
    <span className={`
      absolute left-0 top-0 h-full w-0.5 rounded-full
      transition-all duration-300 ease-out
      ${isActive ? "bg-blue-600" : "bg-transparent"}
      group-hover:bg-blue-600 group-hover:h-full
    `} />
    
    {/* Icon with hover effect */}
    <Icon className={`
      mr-3 h-5 w-5
      transition-all duration-300 ease-in-out
      ${isActive 
        ? "text-blue-600 dark:text-blue-400" 
        : "text-gray-500 dark:text-gray-400"}
      group-hover:text-blue-600 dark:group-hover:text-blue-400
      group-hover:scale-110
    `} />
    
    {/* Label with hover effect */}
    <span className={`
      transition-all duration-300 ease-in-out
      group-hover:translate-x-1
      ${isActive 
        ? "font-semibold" 
        : "font-medium"}
    `}>
      {label}
    </span>
  </Link>
);

export default function Sidebar({ role }: { role: Role | null }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation(); // Hook de traducción dentro del componente funcional

  const sidebarItems: Record<Role, { href: string; icon: React.ElementType; label: string }[]> = {
    ADMIN: [
      { href: "/dashboard", icon: LayoutDashboard, label: t('menu.ADMIN.0.label') },
      { href: "/trabajadores", icon: Users, label: t('menu.ADMIN.1.label') },
      { href: "/asistencia", icon: Calendar, label: t('menu.ADMIN.2.label') },
      { href: "/desempeno", icon: BarChart2, label: t('menu.ADMIN.3.label') },
      { href: "/nominas", icon: DollarSign, label: t('menu.ADMIN.4.label') },
      { href: "/beneficios", icon: Gift, label: t('menu.ADMIN.5.label') },
      { href: "/cursos", icon: BookOpen, label: t('menu.ADMIN.6.label') },
      { href: "/postulaciones", icon: Clipboard, label: t('menu.ADMIN.7.label') },
      { href: "/recordatorios", icon: AlarmClock, label: t('menu.ADMIN.8.label') },
    ],
    rrhh: [
      { href: "/asistencia", icon: Calendar, label: t('menu.RRHH.0.label') },
      { href: "/desempeno", icon: BarChart2, label: t('menu.RRHH.1.label') },
      { href: "/beneficios", icon: Gift, label: t('menu.RRHH.2.label') },
      { href: "/cursos", icon: BookOpen, label: t('menu.RRHH.3.label') },
      { href: "/recordatorios", icon: AlarmClock, label: t('menu.RRHH.4.label') },
    ],
    nominas: [
      { href: "/trabajadores", icon: Users, label: t('menu.NOMINAS.0.label') },
      { href: "/nominas", icon: DollarSign, label: t('menu.NOMINAS.1.label') },
      { href: "/recordatorios", icon: AlarmClock, label: t('menu.NOMINAS.2.label') },
    ],
  };

  if (!role || !(role in sidebarItems)) return null;

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4 bg-white dark:bg-gray-900"> 
      <div className="flex-1 flex flex-col gap-6">
        {/* Logo Section */}
        <div className="flex items-center justify-center py-4">
          <Link href="/" className="flex items-center justify-center group">
            <img
              src="/pueble logo 2.png"
              alt="Pueble S.A Logo"
              className="h-32 w-auto object-contain transition-all duration-500 ease-in-out transform group-hover:scale-110 group-hover:brightness-110 dark:brightness-75" // Ajuste para logo en modo oscuro
            />
          </Link>
        </div>
        
        <Separator className="opacity-50 dark:opacity-20" /> {/* Ajuste para separador en modo oscuro */}
        
        {/* Navigation Links */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            {sidebarItems[role].map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>  
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 
            hover:bg-blue-50 hover:text-blue-600 
            dark:hover:bg-blue-900 dark:hover:text-blue-400 // Añadir hover para modo oscuro
            transition-all duration-300 bg-white dark:bg-gray-800" // Añadir fondo oscuro
          >
            ☰
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 dark:bg-gray-900"> {/* Añadir fondo oscuro */}
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-background dark:border-gray-700 dark:bg-gray-900 shadow-lg h-screen"> {/* Añadir estilos para modo oscuro */}
        <SidebarContent />
      </aside>
    </>
  );
}