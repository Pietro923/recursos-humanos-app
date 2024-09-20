import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '../components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Gestión de RRHH',
  description: 'Sistema integral para la gestión de recursos humanos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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