"use client"

import { useState } from "react"
import { getAuth } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Building2} from "lucide-react"
import { useTranslation } from "react-i18next"

export default function AdminManagementPage() {
  // User Creation State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("rrhh")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Company Creation State
  const [companyName, setCompanyName] = useState("")
  const [companyError, setCompanyError] = useState("")
  const [companySuccess, setCompanySuccess] = useState("")
  const [isCompanyLoading, setIsCompanyLoading] = useState(false)

  const { t } = useTranslation()
  
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

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCompanyLoading(true)
    setCompanyError("")
    setCompanySuccess("")
  
    try {
      const auth = getAuth()
      const currentUser = auth.currentUser
      
      if (!currentUser) {
        throw new Error("No hay sesión de administrador activa")
      }
  
      const token = await currentUser.getIdToken()
  
      const response = await fetch('/api/admin/create-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName,
        }),
      })
  
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Error del servidor: respuesta no válida")
      }
  
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la empresa')
      }
  
      setCompanySuccess(`Empresa ${companyName} creada exitosamente`)
      
      // Limpiar el formulario
      setCompanyName("")
    } catch (err) {
      console.error('Error en handleCreateCompany:', err)
      if (err instanceof Error) {
        setCompanyError(err.message)
      } else {
        setCompanyError("Error al crear la empresa. Por favor, intenta de nuevo.")
      }
    } finally {
      setIsCompanyLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 flex flex-col items-center justify-center p-4 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
        <div className="flex items-center justify-center space-x-2 mb-4">
            <CardTitle className="text-2xl font-bold text-center">
              {t('adminPanel.title')}
            </CardTitle>
          </div>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>{t('adminPanel.userTab')}</span>
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>{t('adminPanel.companyTab')}</span>
              </TabsTrigger>
            </TabsList>
            
            {/* User Creation Tab */}
            <TabsContent value="user">
              <CardContent className="mt-4">
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('adminPanel.emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('adminPanel.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t('adminPanel.passwordLabel')}</Label>
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
                    <Label htmlFor="role">{t('adminPanel.roleLabel')}</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('adminPanel.selectRolePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">{t('adminPanel.roleAdmin')}</SelectItem>
                        <SelectItem value="rrhh">{t('adminPanel.roleRrhh')}</SelectItem>
                        <SelectItem value="nominas">{t('adminPanel.roleNominas')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? t('adminPanel.loadingCreateUserButton') : t('adminPanel.createUserButton')}
                  </Button>
                </form>
              </CardContent>
              {error && (
                <CardFooter>
                  <Alert variant="destructive" className="w-full">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </CardFooter>
              )}
              {success && (
                <CardFooter>
                  <Alert className="w-full bg-green-50 text-green-700 border-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                </CardFooter>
              )}
            </TabsContent>

            {/* Company Creation Tab */}
            <TabsContent value="company">
              <CardContent className="mt-4">
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">{t('adminPanel.companyNameLabel')}</Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder={t('adminPanel.companyNamePlaceholder')}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    disabled={isCompanyLoading}
                  >
                    {isCompanyLoading ? t('adminPanel.loadingCreateCompanyButton') : t('adminPanel.createCompanyButton')}
                  </Button>
                </form>
              </CardContent>
              {companyError && (
                <CardFooter>
                  <Alert variant="destructive" className="w-full">
                    <AlertDescription>{companyError}</AlertDescription>
                  </Alert>
                </CardFooter>
              )}
              {companySuccess && (
                <CardFooter>
                  <Alert className="w-full bg-green-50 text-green-700 border-green-200">
                    <AlertDescription>{companySuccess}</AlertDescription>
                  </Alert>
                </CardFooter>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}