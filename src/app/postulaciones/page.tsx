"use client"
import { useState, useEffect } from "react"
import { collection, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebaseConfig" // Adjust the import path to your Firebase config
import { Card, CardDescription, CardHeader, CardTitle, CardFooter, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Briefcase, Archive, Trash2, Plus, Eye, FileArchive } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface JobPosting {
  id?: string
  title: string
  description: string
  status: 'active' | 'archived'
  createdAt: Date
  companyId: string
  hiredEmployeeId?: string // Nuevo campo para almacenar el ID del empleado contratado
}

interface Employee {
  id?: string;
  nombre: string;
  apellido: string;
  dni: number;
  correo: string;
  departamento: string;
  sueldo: number;
  genero: string;
  fechaNacimiento: string;
  titulo: string;
  estado: 'activo' | 'inactivo';
}

export default function JobPostingsPage() {
  const [postings, setPostings] = useState<JobPosting[]>([])
  const [, setEmployees] = useState<Employee[]>([]) // Added this line
  const [departments, setDepartments] = useState<string[]>([]) // Added this line
  const [, setLoading] = useState(false)
  const [selectedPosting, setSelectedPosting] = useState<JobPosting | null>(null)
  const [showAddPostingDialog, setShowAddPostingDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const { t } = useTranslation()
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [hiredEmployee, setHiredEmployee] = useState<Employee | null>(null)

  // New Posting Form State
  const [newPosting, setNewPosting] = useState({
    title: "",
    description: ""
  })

  // Employee Form State
  const [newEmployee, setNewEmployee] = useState<Employee>({
    nombre: "",
    apellido: "",
    dni: 0,
    correo: "",
    departamento: "",
    sueldo: 0,
    genero: "",
    fechaNacimiento: "",
    titulo: "",
    estado: 'activo'
  });

  const [selectedCompany, setSelectedCompany] = useState(""); 
  const companies = ["Pueble SA - CASE IH", "KIA"];

  // Nueva función para obtener el próximo número de empleado
  const getNewEmployeeId = async () => {
    const counterRef = doc(db, "counters", selectedCompany + "_employeeCounter");
    
    try {
      const counterDoc = await getDoc(counterRef);
      let newEmployeeNumber = 1;

      if (counterDoc.exists()) {
        newEmployeeNumber = counterDoc.data().lastId + 1;
      }

      // Incrementar el contador
      await setDoc(counterRef, { lastNumber: newEmployeeNumber }, { merge: true });

      return newEmployeeNumber;
    } catch (error) {
      console.error("Error al obtener nuevo ID de empleado:", error);
      return 0;
    }
  };

  const loadHiredEmployeeDetails = async (employeeId: string) => {
    try {
      const employeeRef = doc(db, "Grupo_Pueble", selectedCompany, "empleados", employeeId)
      const employeeDoc = await getDoc(employeeRef)
  
      if (employeeDoc.exists()) {
        setHiredEmployee({
          id: employeeDoc.id,
          ...employeeDoc.data()
        } as Employee)
      }
    } catch (error) {
      console.error("Error cargando detalles del empleado:", error)
    }
  }

  // Nueva función para cargar postulaciones de la empresa seleccionada
  const loadPostingsForCompany = async (companyName: string) => {
    try {
      const postingsRef = collection(db, "Grupo_Pueble", companyName, "postulaciones");
      const q = query(postingsRef, where("status", "in", ["active", "archived"]));
      const querySnapshot = await getDocs(q);

      const loadedPostings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as JobPosting));

      setPostings(loadedPostings);
    } catch (error) {
      console.error("Error cargando postulaciones:", error);
      setPostings([]);
    }
  };

  // Cargar postulaciones cuando cambia la empresa
  useEffect(() => {
    if (selectedCompany) {
      loadPostingsForCompany(selectedCompany);
    }
  }, [selectedCompany]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };  

  const handleAddPosting = async () => {
    setLoading(true)
    try {
      const postingData: JobPosting = {
        title: newPosting.title,
        description: newPosting.description,
        status: 'active',
        createdAt: new Date(),
        companyId: selectedCompany
      }

      // Add to Firestore
      const docRef = await addDoc(
        collection(db, "Grupo_Pueble", selectedCompany, "postulaciones"), 
        postingData
      )

      // Update local state
      setPostings(prev => [...prev, { ...postingData, id: docRef.id }])

      // Reset form and close dialog
      setNewPosting({ title: "", description: "" })
      setShowAddPostingDialog(false)

      toast({
        title: t('postulaciones.toast.title2'),
        description: t('postulaciones.toast.description2'),
      })
    } catch (error) {
      toast({
        title: "Error",
        description: t('postulaciones.toast.description3'),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleArchivePosting = async (posting: JobPosting) => {
    try {
      // Update Firestore document
      if (posting.id) {
        const postingRef = doc(db, "Grupo_Pueble", selectedCompany, "postulaciones", posting.id)
        await updateDoc(postingRef, { status: 'archived' })
      }

      // Update local state
      setPostings(prev => 
        prev.map(p => p.id === posting.id ? { ...p, status: 'archived' } : p)
      )

      // Close dialogs
      setShowArchiveDialog(false)
      setSelectedPosting(null)

      toast({
        title: t('postulaciones.toast.title4'),
        description: t('postulaciones.toast.description4'),
      })
    } catch (error) {
      toast({
        title: "Error",
        description: t('postulaciones.toast.description5'),
        variant: "destructive"
      })
    }
  }

  const handleDeletePosting = async (postingId: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "Grupo_Pueble", selectedCompany, "postulaciones", postingId))

      // Update local state
      setPostings(prev => prev.filter(p => p.id !== postingId))
      setSelectedPosting(null)

      toast({
        title: t('postulaciones.toast.title6'),
        description: t('postulaciones.toast.description6'),
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la publicación",
        variant: "destructive"
      })
    }
  }

  const handleRegisterEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    const newEmployeeId = await getNewEmployeeId();

    const newEmployeeData = {
      ...newEmployee,
      dni: parseInt(newEmployee.dni.toString(), 10) || 0,
      sueldo: parseFloat(newEmployee.sueldo.toString()) || 0,
      estado: 'activo' as const,
    };

    try {
      await setDoc(
        doc(collection(db, "Grupo_Pueble", selectedCompany, "empleados"), newEmployeeId.toString()),
        newEmployeeData
      );
      
      const employeeWithId = { id: newEmployeeId.toString(), ...newEmployeeData } as Employee;
      setEmployees(prev => [...prev, employeeWithId]);
      
      // Update departments if it's a new one
      if (!departments.includes(newEmployeeData.departamento)) {
        setDepartments(prev => [...prev, newEmployeeData.departamento]);
      }

      // Reset form
      setNewEmployee({
        nombre: "",
        apellido: "",
        dni: 0,
        titulo: "",
        correo: "",
        departamento: "",
        sueldo: 0,
        genero: "",
        fechaNacimiento: "",
        estado: 'activo'
      });

      // If we have a selected posting, archive it
      if (selectedPosting && selectedPosting.id) {
    const postingRef = doc(db, "Grupo_Pueble", selectedCompany, "postulaciones", selectedPosting.id)
    await updateDoc(postingRef, { 
      status: 'archived', 
      hiredEmployeeId: newEmployeeId.toString() 
    })


    setPostings(prev => 
      prev.map(p => 
        p.id === selectedPosting.id 
          ? { ...p, status: 'archived', hiredEmployeeId: newEmployeeId.toString() } 
          : p
      )
    )
  }
      setShowEmployeeForm(false);

      toast({
        title: t('postulaciones.toast.title8'),
        description: t('postulaciones.toast.description8'),
      })
    } catch (error) {
      toast({
        title: "Error",
        description: t('postulaciones.toast.description9'),
        variant: "destructive"
      })
    }
  }
  useEffect(() => {
    if (showDetailsDialog && selectedPosting && selectedPosting.hiredEmployeeId) {
      loadHiredEmployeeDetails(selectedPosting.hiredEmployeeId);
    }
  }, [showDetailsDialog, selectedPosting]);

  return (
  <div className="container mx-auto py-8 space-y-6 dark:text-white p-6">
  <div className="flex items-center space-x-3 mb-4">
    <Briefcase className="h-10 w-10 text-primary-600 transition-transform hover:scale-110" />
    <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text">
     {t('postulaciones.jobApplications.header.title')}
    </h1>
  </div>


  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  
  <Card className="w-full sm:w-80 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-primary-200 dark:hover:border-blue-700">
      <CardContent className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/70 dark:to-blue-950/80 rounded-xl shadow-lg border border-blue-100 dark:border-blue-800">
        <label className="block text-md font-semibold text-blue-700 dark:text-blue-300 mb-3 transition-colors hover:text-primary-600">
          {t('pagedashboard.selectCompanyLabel')}
        </label>
      
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-full bg-white dark:bg-blue-800/50 border-2 border-blue-200 dark:border-blue-600 hover:border-primary-500 focus:border-primary-600 focus:ring-2 focus:ring-primary-300 transition-all duration-300 rounded-lg shadow-sm hover:shadow-md">
            <SelectValue
              placeholder={t('pagedashboard.selectCompanyPlaceholder')}
              className="text-blue-700 dark:text-blue-200"
            />
          </SelectTrigger>
        
          <SelectContent className="bg-white dark:bg-blue-900 border-blue-200 dark:border-blue-700 rounded-xl shadow-2xl overflow-hidden">
            {companies.map((company) => (
              <SelectItem
                key={company}
                value={company}
                className="px-3 py-2 hover:bg-primary-100 dark:hover:bg-blue-800 focus:bg-primary-200 dark:focus:bg-blue-700 transition-colors duration-200 rounded-md cursor-pointer text-gray-700 dark:text-gray-200 hover:text-primary-700 dark:hover:text-primary-300"
              >
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  
  {/* Add Posting Button */}
  <Button
      variant="outline"
      className="w-full sm:w-auto bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all duration-300 shadow-sm hover:shadow-md rounded-lg px-4 py-2"
      onClick={() => setShowAddPostingDialog(true)}
    >
      <Plus className="mr-2 h-4 w-4" />
      {t('postulaciones.jobApplications.header.searchButton')}
    </Button>
  </div>

  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-2">
  {postings.map((posting) => (
    <Card 
      key={posting.id} 
      className="flex flex-col 
        border border-gray-200 dark:border-gray-700 
        rounded-xl 
        transition-all duration-300 
        hover:shadow-xl 
        hover:scale-[1.02] 
        dark:bg-gray-800/50 
        bg-white 
        overflow-hidden"
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <CardTitle 
              className="
                line-clamp-2 
                text-xl 
                font-bold 
                text-gray-800 
                dark:text-gray-100 
                transition-colors 
                group-hover:text-primary-600"
            >
              {posting.title}
            </CardTitle>
            <CardDescription 
              className="
                line-clamp-3 
                text-gray-600 
                dark:text-gray-400 
                text-sm 
                leading-relaxed"
            >
              {posting.description}
            </CardDescription>
          </div>
          <Badge 
            variant={posting.status === 'active' ? 'default' : 'secondary'}
            className="
              px-3 py-1 
              rounded-full 
              text-xs 
              font-semibold 
              uppercase 
              tracking-wider 
              transition-all 
              group-hover:scale-105"
          >
            {posting.status === 'active' ? t('postulaciones.jobApplications.header.activa') : t('postulaciones.jobApplications.header.archivada')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardFooter 
        className="
          mt-auto 
          pt-4 
          pb-4 
          border-t 
          border-gray-100 
          dark:border-gray-700 
          bg-gray-50 
          dark:bg-gray-800/30 
          flex 
          justify-between 
          items-center"
      >
        {posting.status === 'active' ? (
          <div className="flex space-x-2 w-full">
            <Button 
              variant="destructive"
              className="
                flex-1 
                group 
                transition-all 
                hover:bg-red-600 
                hover:scale-[1.02] 
                space-x-2"
              onClick={() => handleDeletePosting(posting.id!)}
            >
              <Trash2 className="h-4 w-4 transition-transform group-hover:rotate-6" />
              <span>{t('postulaciones.jobApplications.header.eliminar')}</span>
            </Button>
            
            <Button 
              variant="outline"
              className="
                flex-1 
                group 
                border-gray-300 
                dark:border-gray-600 
                hover:border-primary-500 
                transition-all 
                hover:scale-[1.02] 
                space-x-2"
              onClick={() => {
                setSelectedPosting(posting)
                setShowArchiveDialog(true)
              }}
            >
              <Archive className="h-4 w-4 transition-transform group-hover:-rotate-6" />
              <span>{t('postulaciones.jobApplications.header.archivar')}</span>
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline"
            className="
              w-full 
              group 
              border-gray-300 
              dark:border-gray-600 
              hover:border-primary-500 
              transition-all 
              hover:scale-[1.02] 
              space-x-2"
            onClick={() => {
              setSelectedPosting(posting)
              setShowDetailsDialog(true)
            }}
          >
            <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>{t('postulaciones.jobApplications.header.detalles')}</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  ))}
</div>

<Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
  <DialogContent className="
    max-w-xl 
    bg-white 
    dark:bg-gray-900 
    rounded-2xl 
    shadow-2xl 
    border 
    border-gray-200 
    dark:border-gray-700 
    overflow-hidden"
  >
    <DialogHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
      <DialogTitle className="
        text-2xl 
        font-extrabold 
        text-gray-800 
        dark:text-gray-100 
        flex 
        items-center 
        gap-3"
      >
        <FileArchive className="h-7 w-7 text-primary-600" />
        {t('postulaciones.jobApplications.header.detallespublicacion')}
      </DialogTitle>
      <DialogDescription className="
        text-gray-500 
        dark:text-gray-400 
        text-sm"
      >
        {t('postulaciones.jobApplications.header.informaciondetallada')}
      </DialogDescription>
    </DialogHeader>
    
    {selectedPosting && (
      <div className="space-y-6 p-2">
        <div className="
          bg-gray-50 
          dark:bg-gray-800/50 
          p-4 
          rounded-lg 
          border 
          border-gray-200 
          dark:border-gray-700"
        >
          <h3 className="
          dark:text-white
            font-bold 
            text-lg 
            text-primary-600 
            dark:text-primary-400 
            mb-2 
            border-b 
            border-gray-200 
            dark:border-gray-700 
            pb-2"
          >
           {t('postulaciones.jobApplications.header.informacionpublicacion')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('postulaciones.jobApplications.header.titulo')}</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {selectedPosting.title}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('postulaciones.jobApplications.header.descripcion')}</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-3">
                {selectedPosting.description}
              </p>
            </div>
          </div>
        </div>

        {selectedPosting.hiredEmployeeId && hiredEmployee && (
          <div className="
            bg-blue-50 
            dark:bg-blue-900/30 
            p-4 
            rounded-lg 
            border 
            border-blue-200 
            dark:border-blue-800"
          >
            <h3 className="
              font-bold 
              text-lg 
              text-blue-600 
              dark:text-blue-400 
              mb-2 
              border-b 
              border-blue-200 
              dark:border-blue-700 
              pb-2"
            >
              {t('postulaciones.jobApplications.header.empleadocontratado')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('postulaciones.jobApplications.header.nombrecom')}</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {hiredEmployee.nombre} {hiredEmployee.apellido}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('postulaciones.jobApplications.header.dni')}</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {hiredEmployee.dni}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('postulaciones.jobApplications.header.correo')}</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {hiredEmployee.correo}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('postulaciones.jobApplications.header.depto')}</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {hiredEmployee.departamento}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('postulaciones.jobApplications.header.genero')}</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {hiredEmployee.genero}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('postulaciones.jobApplications.header.fechanac')}</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {hiredEmployee.fechaNacimiento}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('postulaciones.jobApplications.header.titulo')}</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {hiredEmployee.titulo}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('postulaciones.jobApplications.header.sueldo')}</p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  ${hiredEmployee.sueldo.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
    
    <DialogFooter className="
      border-t 
      border-gray-100 
      dark:border-gray-800 
      p-4 
      bg-gray-50 
      dark:bg-gray-900/50"
    >
      <Button 
        variant="outline"
        onClick={() => setShowDetailsDialog(false)}
        className="
          w-full 
          dark:bg-gray-700 
          dark:hover:bg-gray-600 
          dark:text-white 
          transition-all 
          hover:scale-[1.02]"
      >
       {t('postulaciones.jobApplications.header.cerrar')}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Add Posting Dialog */}
      <Dialog open={showAddPostingDialog} onOpenChange={setShowAddPostingDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle>{t('postulaciones.jobApplications.header.agg')}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <label htmlFor="">{t('postulaciones.jobApplications.header.descripcion')}</label>
            <Input
              placeholder={t('postulaciones.jobApplications.header.titulodelapubli')}
              value={newPosting.title}
              onChange={(e) => setNewPosting(prev => ({...prev, title: e.target.value}))}
              className="dark:border-gray-500"
            />
            <label htmlFor="">{t('postulaciones.jobApplications.header.descripcion')}</label>
            <Input
              placeholder={t('postulaciones.jobApplications.header.descripcion')}
              value={newPosting.description}
              onChange={(e) => setNewPosting(prev => ({...prev, description: e.target.value}))}
              className="dark:border-gray-500"
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddPostingDialog(false)}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              {t('postulaciones.jobApplications.header.cancelar')}
            </Button>
            <Button 
              onClick={handleAddPosting}
              disabled={!newPosting.title || !newPosting.description}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              {t('postulaciones.jobApplications.header.agregar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle>Archivar Publicación</DialogTitle>
          </DialogHeader>
          
          <p className="text-muted-foreground">
            {t('postulaciones.jobApplications.header.contrataste')}
          </p>

          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                if (selectedPosting) handleArchivePosting(selectedPosting)
              }}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
               {t('postulaciones.jobApplications.header.no')}
            </Button>
            <Button 
              onClick={() => {
                setShowArchiveDialog(false)
                setShowEmployeeForm(true)
              }}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
               {t('postulaciones.jobApplications.header.si')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Registration Dialog */}
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle> {t('postulaciones.jobApplications.header.registrarnuevoempleado')}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Input
              placeholder={t('empleados.addEmployee.form.fields.nombre.placeholder')}
              value={newEmployee.nombre}
              onChange={(e) => setNewEmployee(prev => ({...prev, nombre: e.target.value}))}
              className="dark:border-gray-500"
              required 
            />
            <Input
              placeholder= {t('empleados.addEmployee.form.fields.apellido.placeholder')}
              value={newEmployee.apellido}
              onChange={(e) => setNewEmployee(prev => ({...prev, apellido: e.target.value}))}
              className="dark:border-gray-500"
              required 
            />
            <Input
              placeholder= {t('empleados.addEmployee.form.fields.dni.placeholder')}
              type="number"
              value={newEmployee.dni || ''}
              onChange={(e) => setNewEmployee(prev => ({...prev, dni: parseInt(e.target.value) || 0}))}
              className="dark:border-gray-500"
              required 
            />
            <Input
              placeholder= {t('empleados.addEmployee.form.fields.correo.placeholder')}
              value={newEmployee.correo}
              onChange={(e) => setNewEmployee(prev => ({...prev, correo: e.target.value}))}
              className="dark:border-gray-500"
              required 
            />
            <Input
              placeholder={t('empleados.addEmployee.form.fields.departamento.placeholder')}
              value={newEmployee.departamento}
              onChange={(e) => setNewEmployee(prev => ({...prev, departamento: e.target.value}))}
              className="dark:border-gray-500"
              required 
            />
            <Input
              placeholder= {t('empleados.addEmployee.form.fields.sueldo.placeholder')}
              type="number"
              value={newEmployee.sueldo || ''}
              onChange={(e) => setNewEmployee(prev => ({...prev, sueldo: parseFloat(e.target.value) || 0}))}
              className="dark:border-gray-500"
              required 
            />
            <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="genero">
                  {t('empleados.addEmployee.form.fields.genero.label')}
                  </label>
                  <div className="flex items-center space-x-6">
                    <label htmlFor="male" className="flex items-center space-x-2">
                      <input
                        id="male"
                        type="radio"
                        name="genero"
                        value="masculino"
                        checked={newEmployee.genero === "masculino"}
                        onChange={handleInputChange}
                        
                      />
                      <span>{t('empleados.addEmployee.form.fields.genero.options.male')}</span>
                    </label>
                    <label htmlFor="female" className="flex items-center space-x-2">
                      <input
                        id="female"
                        type="radio"
                        name="genero"
                        value="femenino"
                        checked={newEmployee.genero === "femenino"}
                        onChange={handleInputChange}
                      />
                      <span>{t('empleados.addEmployee.form.fields.genero.options.female')}</span>
                    </label>
                  </div>
                </div>
            <Input
              type="date"
              placeholder= {t('empleados.addEmployee.form.fields.fechaNacimiento.label')}
              value={newEmployee.fechaNacimiento}
              onChange={(e) => setNewEmployee(prev => ({...prev, fechaNacimiento: e.target.value}))}
              className="dark:border-gray-500"
              required 
            />
            <Input
              placeholder= {t('empleados.addEmployee.form.fields.titulo.placeholder')}
              value={newEmployee.titulo}
              onChange={(e) => setNewEmployee(prev => ({...prev, titulo: e.target.value}))}
              className="dark:border-gray-500"
              required 
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEmployeeForm(false)}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
               {t('postulaciones.jobApplications.header.cancelar')}
            </Button>
            <Button 
              onClick={handleRegisterEmployee}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
               {t('postulaciones.jobApplications.header.registrar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}