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

type Role = "ADMIN" | "rrhh" | "nominas";

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
    { href: "/recordatorios", icon: AlarmClock, label: "Recordatorios" },
  ],
  rrhh: [
    { href: "/asistencia", icon: Calendar, label: "Asistencia" },
    { href: "/desempeno", icon: BarChart2, label: "Desempeño" },
    { href: "/beneficios", icon: Gift, label: "Beneficios" },
    { href: "/cursos", icon: BookOpen, label: "Formación" },
    { href: "/recordatorios", icon: AlarmClock, label: "Recordatorios" },
  ],
  nominas: [
    { href: "/trabajadores", icon: Users, label: "Empleados" },
    { href: "/nominas", icon: DollarSign, label: "Nóminas" },
    { href: "/recordatorios", icon: AlarmClock, label: "Recordatorios" },
  ],
};

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
      hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-950 dark:hover:to-blue-900
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

  if (!role || !(role in sidebarItems)) return null;


  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4 bg-white">
      <div className="flex-1 flex flex-col gap-6">
        {/* Logo Section */}
        <div className="flex items-center justify-center py-4">
          <Link href="/" className="flex items-center justify-center group">
            <img
              src="/pueble logo 2.png"
              alt="Pueble S.A Logo"
              className="h-32 w-auto object-contain transition-all duration-500 ease-in-out transform group-hover:scale-110 group-hover:brightness-110"
            />
          </Link>
        </div>
        
        <Separator className="opacity-50" />
        
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
            className="md:hidden fixed top-4 left-4 z-50 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 bg-white"
          >
            ☰
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-background shadow-lg h-screen">
        <SidebarContent />
      </aside>
    </>
  );
}