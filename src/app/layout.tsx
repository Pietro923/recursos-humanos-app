// app/layout.tsx
"use client"
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import Sidebar from '../components/Sidebar'
import { usePathname, useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged, setPersistence, browserSessionPersistence } from "firebase/auth"
import { useEffect, useState } from 'react'
import firebaseConfig from "@/lib/firebaseConfig"
import { initializeApp } from "firebase/app"

// Inicializa Firebase si no está inicializado
try {
  initializeApp(firebaseConfig)
} catch (error) {
  // Ignora el error si Firebase ya está inicializado
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const auth = getAuth()

    setPersistence(auth, browserSessionPersistence).catch((error) => {
      console.error("Error setting persistence: ", error)
    })

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
      if (!user) {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [pathname, router])

  if (isAuthenticated === null) {
    // Opcional: Muestra una pantalla de carga o spinner mientras verifica la autenticación
    return (
      <html lang="es">
        <body className={inter.className}>
          <div className="flex items-center justify-center h-screen bg-gray-100">
            <p>Cargando...</p>
          </div>
        </body>
      </html>
    )
  }

  if (!isAuthenticated && pathname === '/login') {
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
