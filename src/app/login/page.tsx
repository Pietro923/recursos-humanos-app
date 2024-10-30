// pages/login.tsx
"use client"
import { useState } from "react"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "next/navigation"
import { initializeApp } from "firebase/app"
import firebaseConfig from "@/lib/firebaseConfig" // Asegúrate de que apunta a la configuración correcta

initializeApp(firebaseConfig)

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const auth = getAuth()

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/") // Redirigir a la página principal o dashboard
    } catch (err) {
      setError("Error de autenticación. Verifica tus credenciales.")
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión en Pueble S.A.</h2>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <label className="block mb-2 text-sm font-medium">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded mb-4"
        />
        
        <label className="block mb-2 text-sm font-medium">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded mb-6"
        />

        <button type="submit" className="w-full py-2 bg-blue-600 text-white font-bold rounded">
          Iniciar sesión
        </button>
      </form>
    </div>
  )
}
