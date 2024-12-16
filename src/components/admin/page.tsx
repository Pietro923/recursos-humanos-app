"use client"

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Building2, Container} from "lucide-react"
import { useTranslation } from "react-i18next"
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

export default function AdminManagementPage() {
  // User Creation State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("rrhh")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Company Creation State
  const [companyName, setCompanyName] = useState("")
  const [companyError, setCompanyError] = useState("")
  const [companySuccess, setCompanySuccess] = useState("")
  const [isCompanyLoading, setIsCompanyLoading] = useState(false)

  const { t } = useTranslation()

  // Deparment Creation State
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companies, setCompanies] = useState<string[]>([]);
  // New states for Department, Subdepartment, and Job Position management
  const [departments, setDepartments] = useState<string[]>([]);
  const [subdepartments, setSubdepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSubdepartment, setSelectedSubdepartment] = useState("");
  
  // Department creation states
  const [departmentName, setDepartmentName] = useState("");
  const [subdepartmentName, setSubdepartmentName] = useState("");
  const [jobPositionName, setJobPositionName] = useState("");
  
  // Error and success states for department management
  const [departmentError, setDepartmentError] = useState("");
  const [departmentSuccess, setDepartmentSuccess] = useState("");
  const [subdepartmentError, setSubdepartmentError] = useState("");
  const [subdepartmentSuccess, setSubdepartmentSuccess] = useState("");
  const [jobPositionError, setJobPositionError] = useState("");
  const [jobPositionSuccess, setJobPositionSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Existing useEffect and other methods...
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const collectionRef = collection(db, "Grupo_Pueble");
        const snapshot = await getDocs(collectionRef);
        const companyNames = snapshot.docs.map(doc => doc.id);
        setCompanies([...companyNames]);
      } catch (error) {
        console.error("Error al obtener las compañías:", error);
      }
    };
  
    fetchCompanies();
  }, []);

  // New method to fetch departments when a company is selected
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!selectedCompany) return;

      try {
        const departmentsRef = collection(db, "Grupo_Pueble", selectedCompany, "Departamentos");
        const snapshot = await getDocs(departmentsRef);
        const departmentNames = snapshot.docs.map(doc => doc.id);
        setDepartments(departmentNames);
      } catch (error) {
        console.error("Error al obtener los departamentos:", error);
      }
    };

    fetchDepartments();
  }, [selectedCompany]);

  // New method to fetch subdepartments when a department is selected
  useEffect(() => {
    const fetchSubdepartments = async () => {
      if (!selectedCompany || !selectedDepartment) return;

      try {
        const subdepartmentsRef = collection(
          db, 
          "Grupo_Pueble", 
          selectedCompany, 
          "Departamentos", 
          selectedDepartment, 
          "SubDepartamento"
        );
        const snapshot = await getDocs(subdepartmentsRef);
        const subdepartmentNames = snapshot.docs.map(doc => doc.id);
        setSubdepartments(subdepartmentNames);
      } catch (error) {
        console.error("Error al obtener los subdepartamentos:", error);
      }
    };

    fetchSubdepartments();
  }, [selectedCompany, selectedDepartment]);

  // Handle Department Creation
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDepartmentError("");
    setDepartmentSuccess("");

    try {
      // Validate inputs
      if (!selectedCompany) {
        throw new Error("Primero selecciona una empresa");
      }
      if (!departmentName.trim()) {
        throw new Error("El nombre del departamento no puede estar vacío");
      }

      // Create department as a document in the Departamentos collection
      const departmentRef = doc(
        db, 
        "Grupo_Pueble", 
        selectedCompany, 
        "Departamentos", 
        departmentName
      );

      // Set an empty document to create the collection
      await setDoc(departmentRef, {});

      // Update local state
      setDepartments(prev => [...prev, departmentName]);
      setDepartmentSuccess(`Departamento ${departmentName} creado exitosamente`);
      setDepartmentName("");
    } catch (err) {
      console.error('Error en handleCreateDepartment:', err);
      setDepartmentError(err instanceof Error ? err.message : "Error al crear el departamento");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Subdepartment Creation
  const handleCreateSubdepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubdepartmentError("");
    setSubdepartmentSuccess("");

    try {
      // Validate inputs
      if (!selectedCompany) {
        throw new Error("Primero selecciona una empresa");
      }
      if (!selectedDepartment) {
        throw new Error("Primero selecciona un departamento");
      }
      if (!subdepartmentName.trim()) {
        throw new Error("El nombre del subdepartamento no puede estar vacío");
      }

      // Create subdepartment as a document in the SubDepartamento collection
      const subdepartmentRef = doc(
        db, 
        "Grupo_Pueble", 
        selectedCompany, 
        "Departamentos", 
        selectedDepartment,
        "SubDepartamento",
        subdepartmentName
      );

      // Set an empty document to create the collection
      await setDoc(subdepartmentRef, {});

      // Update local state
      setSubdepartments(prev => [...prev, subdepartmentName]);
      setSubdepartmentSuccess(`Subdepartamento ${subdepartmentName} creado exitosamente`);
      setSubdepartmentName("");
    } catch (err) {
      console.error('Error en handleCreateSubdepartment:', err);
      setSubdepartmentError(err instanceof Error ? err.message : "Error al crear el subdepartamento");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Job Position Creation
  const handleCreateJobPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setJobPositionError("");
    setJobPositionSuccess("");

    try {
      // Validate inputs
      if (!selectedCompany) {
        throw new Error("Primero selecciona una empresa");
      }
      if (!selectedDepartment) {
        throw new Error("Primero selecciona un departamento");
      }
      if (!selectedSubdepartment) {
        throw new Error("Primero selecciona un subdepartamento");
      }
      if (!jobPositionName.trim()) {
        throw new Error("El nombre del puesto no puede estar vacío");
      }

      // Create job position as a document in the Puestos collection
      const jobPositionRef = doc(
        db, 
        "Grupo_Pueble", 
        selectedCompany, 
        "Departamentos", 
        selectedDepartment,
        "SubDepartamento",
        selectedSubdepartment,
        "Puestos",
        jobPositionName
      );

      // Set an empty document to create the collection
      await setDoc(jobPositionRef, {});

      setJobPositionSuccess(`Puesto ${jobPositionName} creado exitosamente`);
      setJobPositionName("");
    } catch (err) {
      console.error('Error en handleCreateJobPosition:', err);
      setJobPositionError(err instanceof Error ? err.message : "Error al crear el puesto");
    } finally {
      setIsLoading(false);
    }
  };


  
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
       <Card className="w-full max-w-2xl mx-auto shadow-2xl hover:shadow-3xl transition-all duration-300 ease-in-out">
        <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-6">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-blue-800 dark:text-blue-200">
            {t('adminPanel.title')}
          </CardTitle>
          </div>
          <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid grid-cols-3 gap-2 mb-6 bg-blue-100 dark:bg-gray-700 p-1 rounded-xl">
            <TabsTrigger 
              value="user" 
              className="flex items-center justify-center space-x-2 rounded-lg transition-all duration-300 
                         data-[state=active]:bg-white data-[state=active]:shadow-md 
                         data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('adminPanel.userTab')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="company" 
              className="flex items-center justify-center space-x-2 rounded-lg transition-all duration-300 
                         data-[state=active]:bg-white data-[state=active]:shadow-md 
                         data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('adminPanel.companyTab')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="deptos" 
              className="flex items-center justify-center space-x-2 rounded-lg transition-all duration-300 
                         data-[state=active]:bg-white data-[state=active]:shadow-md 
                         data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300"
            >
              <Container className="h-4 w-4" />
              <span className="hidden sm:inline">{t('adminPanel.deptoTab')}</span>
            </TabsTrigger>
          </TabsList>
            
            {/* User Creation Tab */}
          <TabsContent value="user" className="space-y-4">
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-blue-800 dark:text-blue-200">
                      {t('adminPanel.emailLabel')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('adminPanel.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 
                                 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-blue-800 dark:text-blue-200">
                      {t('adminPanel.passwordLabel')}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 
                                 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-blue-800 dark:text-blue-200">
                      {t('adminPanel.roleLabel')}
                    </Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="w-full transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
                        <SelectValue placeholder={t('adminPanel.selectRolePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="ADMIN">{t('adminPanel.roleAdmin')}</SelectItem>
                        <SelectItem value="rrhh">{t('adminPanel.roleRrhh')}</SelectItem>
                        <SelectItem value="nominas">{t('adminPanel.roleNominas')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white 
                               transition-all duration-300 ease-in-out transform hover:scale-[1.02] 
                               dark:bg-blue-800 dark:hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? t('adminPanel.loadingCreateUserButton') : t('adminPanel.createUserButton')}
                  </Button>
                </div>
              </form>
            </CardContent>
            {error && (
              <CardFooter>
                <Alert variant="destructive" className="w-full animate-shake">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </CardFooter>
            )}
            {success && (
              <CardFooter>
                <Alert className="w-full bg-green-50 text-green-700 border-green-200 animate-bounce">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </TabsContent>
             {/* Company Creation Tab */}
          <TabsContent value="company" className="space-y-4">
            <CardContent>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-blue-800 dark:text-blue-200">
                      {t('adminPanel.companyNameLabel')}
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder={t('adminPanel.companyNamePlaceholder')}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 
                                 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white 
                               transition-all duration-300 ease-in-out transform hover:scale-[1.02] 
                               dark:bg-blue-800 dark:hover:bg-blue-700"
                    disabled={isCompanyLoading}
                  >
                    {isCompanyLoading ? t('adminPanel.loadingCreateCompanyButton') : t('adminPanel.createCompanyButton')}
                  </Button>
                </div>
              </form>
            </CardContent>
            {companyError && (
              <CardFooter>
                <Alert variant="destructive" className="w-full animate-shake">
                  <AlertDescription>{companyError}</AlertDescription>
                </Alert>
              </CardFooter>
            )}
            {companySuccess && (
              <CardFooter>
                <Alert className="w-full bg-green-50 text-green-700 border-green-200 animate-bounce">
                  <AlertDescription>{companySuccess}</AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </TabsContent>

            
            {/* Depto Administration Tab */}
            <TabsContent value="deptos">
            <CardContent className="mt-4 space-y-4">
            <div className="space-y-2">
            <Label className="text-blue-800 dark:text-blue-200">{t('adminPanel.selectCompanyLabel')}</Label>
              <Select 
                value={selectedCompany} 
                onValueChange={setSelectedCompany}
              >
              <SelectTrigger className="w-full transition-all duration-300 
                             bg-white dark:bg-gray-800 
                             border-blue-300 dark:border-gray-700 
                             hover:border-blue-500 focus:ring-2 focus:ring-blue-400">
                <SelectValue 
                        placeholder={t('pagedashboard.selectCompanyPlaceholder')} 
                        className="text-blue-600 dark:text-blue-200"
                      />
              </SelectTrigger>

              <SelectContent className="bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700 shadow-xl">
                {companies.map((company) => (
                  <SelectItem 
                    key={company} 
                    value={company} 
                    className="hover:bg-blue-100 dark:hover:bg-blue-800 focus:bg-blue-200 dark:focus:bg-blue-700 transition-colors"
                  >
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
             {/* Department Creation */}
            <form onSubmit={handleCreateDepartment} className="space-y-2">
                  <Label className="text-blue-800 dark:text-blue-200">
                    {t('adminPanel.departmentNameLabel')}
                  </Label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      type="text"
                      placeholder={t('adminPanel.departmentNamePlaceholder')}
                      value={departmentName}
                      onChange={(e) => setDepartmentName(e.target.value)}
                      required
                      disabled={!selectedCompany}
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
                      disabled={!selectedCompany || isLoading}
                    >
                      {t('adminPanel.createDepartmentButton')}
                    </Button>
                  </div>
                </form>

            {/* Department Selection */}
            {departments.length > 0 && (
              <div className="space-y-2">
                <Label className="text-blue-800 dark:text-blue-200">{t('adminPanel.selectDepartmentLabel')}</Label>
                <Select 
                  value={selectedDepartment} 
                  onValueChange={setSelectedDepartment}
                  disabled={!selectedCompany}
                >
                 <SelectTrigger className="w-full transition-all duration-300 
                             bg-white dark:bg-gray-800 
                             border-blue-300 dark:border-gray-700 
                             hover:border-blue-500 focus:ring-2 focus:ring-blue-400">
                    <SelectValue  placeholder={t('adminPanel.selectDepartmentPlaceholder')} className="text-blue-600 dark:text-blue-200" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700 shadow-xl">
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept} className="hover:bg-blue-100 dark:hover:bg-blue-800 focus:bg-blue-200 dark:focus:bg-blue-700 transition-colors">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Subdepartment Creation */}
            {selectedDepartment && (
              <form onSubmit={handleCreateSubdepartment} className="space-y-2">
                <Label className="text-blue-800 dark:text-blue-200">{t('adminPanel.subdepartmentNameLabel')}</Label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    type="text"
                    placeholder={t('adminPanel.subdepartmentNamePlaceholder')}
                    value={subdepartmentName}
                    onChange={(e) => setSubdepartmentName(e.target.value)}
                    required
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02]" type="submit" disabled={isLoading}>
                    {t('adminPanel.createSubdepartmentButton')}
                  </Button>
                </div>
              </form>
            )}

            {/* Subdepartment Selection */}
            {subdepartments.length > 0 && (
              <div className="space-y-2">
                <Label className="text-blue-800 dark:text-blue-200">{t('adminPanel.selectSubdepartmentLabel')}</Label>
                <Select 
                  value={selectedSubdepartment} 
                  onValueChange={setSelectedSubdepartment}
                >
                  <SelectTrigger className="w-full transition-all duration-300 
                             bg-white dark:bg-gray-800 
                             border-blue-300 dark:border-gray-700 
                             hover:border-blue-500 focus:ring-2 focus:ring-blue-400">
                    <SelectValue placeholder={t('adminPanel.selectSubdepartmentPlaceholder')} className="text-blue-600 dark:text-blue-200" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700 shadow-xl">
                    {subdepartments.map((subDept) => (
                      <SelectItem key={subDept} value={subDept} className="hover:bg-blue-100 dark:hover:bg-blue-800 focus:bg-blue-200 dark:focus:bg-blue-700 transition-colors">
                        {subDept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Job Position Creation */}
            {selectedSubdepartment && (
              <form onSubmit={handleCreateJobPosition} className="space-y-2">
                <Label className="text-blue-800 dark:text-blue-200">{t('adminPanel.jobPositionNameLabel')}</Label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    type="text"
                    placeholder={t('adminPanel.jobPositionNamePlaceholder')}
                    value={jobPositionName}
                    onChange={(e) => setJobPositionName(e.target.value)}
                    required
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02]" type="submit" disabled={isLoading}>
                    {t('adminPanel.createJobPositionButton')}
                  </Button>
                </div>
              </form>
            )}
            {/* Error and Success Messages */}
            {departmentError && (
                <Alert variant="destructive" className="animate-shake">
                  <AlertDescription>{departmentError}</AlertDescription>
                </Alert>
              )}
            {departmentSuccess && (
                <Alert className="bg-green-50 text-green-700 animate-bounce">
                  <AlertDescription>{departmentSuccess}</AlertDescription>
                </Alert>
              )}
            {subdepartmentError && (
              <Alert variant="destructive" className="animate-shake">
                <AlertDescription>{subdepartmentError}</AlertDescription>
              </Alert>
            )}
            {subdepartmentSuccess && (
              <Alert className="bg-green-50 text-green-700 animate-bounce">
                <AlertDescription>{subdepartmentSuccess}</AlertDescription>
              </Alert>
            )}
            {jobPositionError && (
              <Alert variant="destructive" className="animate-shake">
                <AlertDescription>{jobPositionError}</AlertDescription>
              </Alert>
            )}
            {jobPositionSuccess && (
              <Alert className="bg-green-50 text-green-700 animate-bounce">
                <AlertDescription>{jobPositionSuccess}</AlertDescription>
              </Alert>
            )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}