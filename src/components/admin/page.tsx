"use client"

import { useState } from "react"
import { getAuth } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus } from "lucide-react"

export default function AdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("rrhh")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
  
    try {
      const auth = getAuth()
      const currentUser = auth.currentUser
      
      if (!currentUser) {
        throw new Error("No hay sesión de administrador activa")
      }
  
      const token = await currentUser.getIdToken()
  
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      })
  
      // Primero verifica si la respuesta es JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Error del servidor: respuesta no válida")
      }
  
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el usuario')
      }
  
      setSuccess(`Usuario ${email} creado exitosamente con rol ${role}`)
      
      // Limpiar el formulario
      setEmail("")
      setPassword("")
      setRole("rrhh")
    } catch (err) {
      console.error('Error en handleCreateUser:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error al crear el usuario. Por favor, intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 flex flex-col items-center justify-center p-4 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <UserPlus className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold text-center">
              Panel de Administración
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Crear nuevo usuario en el sistema
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol del Usuario</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="rrhh">Recursos Humanos</SelectItem>
                  <SelectItem value="nominas">Nóminas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creando usuario..." : "Crear Usuario"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="w-full bg-green-50 text-green-700 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}