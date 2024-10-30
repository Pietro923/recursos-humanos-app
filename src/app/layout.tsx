// layout.tsx
"use client"
import { Inter } from 'next/font/google'
import { usePathname, useRouter } from 'next/navigation'
import '@/styles/globals.css'
import Sidebar from '../components/Sidebar'

const inter = Inter({ subsets: ['latin'] })



export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Aquí podría estar la lógica para verificar si el usuario está autenticado
  const isAuthenticated = true // Cambia esto con la lógica real de autenticación

  // Redirección a login si no está autenticado y no estamos ya en login
  if (!isAuthenticated && pathname !== '/login') {
    router.push('/login')
    return null
  }

  // Si está en la página de login, solo renderizamos el contenido de login
  if (pathname === '/login') {
    return (
      <html lang="es">
        <body className={inter.className}>
          <main className="h-screen flex items-center justify-center bg-gray-100">
            {children}
          </main>
        </body>
      </html>
    )
  }

  // Layout para las páginas autenticadas
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
