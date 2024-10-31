"use client"
import { useState } from "react"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebaseConfig" // Asegúrate de exportar correctamente la instancia de Firestore desde tu configuración de Firebase
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("RRHH") // RRHH por defecto, se puede cambiar
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const auth = getAuth()
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await setDoc(doc(db, "users", user.uid), { email, role })
      setSuccess(`Usuario ${email} creado con rol ${role}`)
      setEmail("")
      setPassword("")
      setRole("RRHH")
    } catch (err) {
      setError("Error al crear el usuario. Por favor, intenta de nuevo.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h2 className="text-3xl font-bold">Panel de Administración</h2>
      <form onSubmit={handleCreateUser} className="flex flex-col space-y-4 p-6 bg-white rounded-md shadow-lg w-80">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <Label htmlFor="role">Rol</Label>
        <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="border rounded p-2">
        <option value="ADMIN">Admin</option>
        <option value="RRHH">RRHH</option>
        <option value="NOMINAS">Nominas</option>
        </select>

        <Button type="submit">Crear Usuario</Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </form>
    </div>
  )
}
