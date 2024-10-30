"use client"

import { Users, Calendar, BarChart2, DollarSign, Gift, BookOpen, LayoutDashboard, Clipboard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const sidebarItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/trabajadores", icon: Users, label: "Empleados" },
  { href: "/asistencia", icon: Calendar, label: "Asistencia" },
  { href: "/desempeno", icon: BarChart2, label: "Desempeño" },
  { href: "/nominas", icon: DollarSign, label: "Nóminas" },
  { href: "/beneficios", icon: Gift, label: "Beneficios" },
  { href: "/cursos", icon: BookOpen, label: "Formación" },
  { href: "/postulaciones", icon: Clipboard, label: "Postulaciones"},
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="text-center mb-6">
        <img 
          src="/pueble logo.png" // Asegúrate de que la ruta sea correcta
          alt="Pueble S.A Logo"
          className="h-40 mx-auto" // Ajusta la altura según sea necesario
        />
      </div>
      <nav>
        {sidebarItems.map((item) => {
          const Icon = item.icon
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
          )
        })}
      </nav>
    </aside>
  )
}