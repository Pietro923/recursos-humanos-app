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
import { FaLinkedin } from "react-icons/fa"

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
  id: string;
  nombre: string;
  apellido: string;
  dni: number;
  correo: string;
  departamento: string;
  subdepartamento: string;
  puesto: string;
  sueldo: number;
  genero: string;
  fechaNacimiento: string;
  titulo: string;
  estado: 'activo' | 'inactivo';  // Campo para la baja lógica
  linkedin?: string; // Nuevo campo para LinkedIn
}

export default function JobPostingsPage() {
  const [postings, setPostings] = useState<JobPosting[]>([])
  const [, setEmployees] = useState<Employee[]>([]) // Added this line
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("todos");
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
  const [newEmployee, setNewEmployee] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    titulo: "",
    correo: "",
    departamento: "",
    subdepartamento: "",
    puesto: "",
    sueldo: "",
    genero: "",
    fechaNacimiento: "",
    linkedin: ""
  });

  const [selectedCompany, setSelectedCompany] = useState(""); 
  const [companies, setCompanies] = useState<string[]>([]); // Empresas dinámicas

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Obtén referencia a la colección "Grupo_Pueble"
        const collectionRef = collection(db, "Grupo_Pueble");
        
        // Obtén los documentos dentro de la colección
        const snapshot = await getDocs(collectionRef);
        
        // Extrae los nombres de los documentos
        const companyNames = snapshot.docs.map(doc => doc.id);
        
        // Agrega "Todas" al inicio de la lista
        setCompanies([...companyNames]);
      } catch (error) {
        console.error("Error al obtener las compañías:", error);
      }
    };
  
    fetchCompanies();
  }, []);

  const [departmentos, setDepartmentos] = useState<string[]>([]);
  useEffect(() => {
    const fetchDepartmentos = async () => {
      // Solo intentamos cargar departamentos si hay una empresa seleccionada
      if (!selectedCompany) {
        setDepartmentos([]);
        return;
      }
  
      try {
        // Referencia a la colección de Departamentos dentro de la empresa seleccionada
        const departmentosRef = collection(db, 'Grupo_Pueble', selectedCompany, 'Departamentos');
        
        // Obtener los documentos
        const snapshot = await getDocs(departmentosRef);
        
        // Extraer los nombres de los documentos
        const departmentosList = snapshot.docs.map(doc => doc.id);
  
        setDepartmentos(departmentosList);
      } catch (error) {
        console.error('Error al obtener departamentos:', error);
      }
    };
  
    fetchDepartmentos();
  }, [selectedCompany]);

  const [subdepartmentos, setsubDepartmentos] = useState<string[]>([]);
  const [selectedSubDepartment, setSelectedSubDepartment] = useState<string | null>(null);
  useEffect(() => {
    const fetchSubDepartmentos = async () => {
      // Si no hay un departamento seleccionado, no hacer la consulta
      if (!selectedDepartment) {
        setsubDepartmentos([]);
        return;
      }
  
      try {
        // Referencia a la colección "SubDepartamento" dentro del departamento seleccionado
        const departmentRef = collection(
          db,
          'Grupo_Pueble',
          selectedCompany,
          'Departamentos',
          selectedDepartment,
          'SubDepartamento'
        );
  
        // Obtener los documentos dentro de la subcolección
        const snapshot = await getDocs(departmentRef);
  
        // Extraer los nombres de los subdepartamentos
        const subDepartmentList = snapshot.docs.map(doc => doc.id);
  
        setsubDepartmentos(subDepartmentList);  // Establece el estado con los subdepartamentos obtenidos
      } catch (error) {
        console.error('Error al obtener subdepartamentos:', error);
      }
    };
  
    fetchSubDepartmentos();
  }, [selectedCompany, selectedDepartment]);  // Dependencias: se vuelve a ejecutar cuando cambia selectedCompany o selectedDepartment

  const [puestos, setPuestos] = useState<string[]>([]);
  const [selectedPuesto, setSelectedPuesto] = useState<string | null>(null);
  useEffect(() => {
    const fetchPuestos = async () => {
      if (!selectedSubDepartment) {
        setPuestos([]);
        return;
      }
  
      try {
        const puestosRef = collection(
          db,
          'Grupo_Pueble',
          selectedCompany,
          'Departamentos',
          selectedDepartment,
          'SubDepartamento',
          selectedSubDepartment,
          'Puestos'
        );
  
        const snapshot = await getDocs(puestosRef);
        const puestosList = snapshot.docs.map(doc => doc.id);
        setPuestos(puestosList);
      } catch (error) {
        console.error('Error al obtener puestos:', error);
      }
    };
  
    fetchPuestos();
  }, [selectedCompany, selectedDepartment, selectedSubDepartment]);

  // Función para obtener una ID consecutiva
  const getNewEmployeeId = async () => {
    const counterRef = doc(db, "counters", selectedCompany + "_employeeCounter");

    // Intentar obtener el documento de contador
    const counterSnap = await getDoc(counterRef);
    let newId;

    if (counterSnap.exists()) {
      const lastId = counterSnap.data().lastId;
      newId = lastId + 1;
      await updateDoc(counterRef, { lastId: newId });
    } else {
      newId = 1;
      await setDoc(counterRef, { lastId: newId });
    }
    return newId.toString();
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

  const handleSubmit = async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      const newEmployeeId = await getNewEmployeeId();
      const newEmployeeData = {
        ...newEmployee,
        departamento: selectedDepartment, // Usa los estados de selección
        subdepartamento: selectedSubDepartment,
        puesto: selectedPuesto,
        dni: parseInt(newEmployee.dni, 10) || 0,
        sueldo: parseFloat(newEmployee.sueldo) || 0,
        estado: 'activo',
      };
      try {
        await setDoc(
          doc(collection(db, "Grupo_Pueble", selectedCompany, "empleados"), newEmployeeId),
          newEmployeeData
        );
        
        const employeeWithId = { id: newEmployeeId, ...newEmployeeData } as Employee;
        setEmployees(prev => [...prev, employeeWithId]);
        
        // Actualizar departamentos si es uno nuevo
        if (!departments.includes(newEmployeeData.departamento)) {
          setDepartments(prev => [...prev, newEmployeeData.departamento]);
        }
        
        // Restablecer todos los estados
        setNewEmployee({
          nombre: "",
          apellido: "",
          dni: "",
          titulo: "",
          correo: "",
          departamento: "",
          subdepartamento: "",
          puesto: "",
          sueldo: "",
          genero: "",
          fechaNacimiento: "",
          linkedin: ""
        });
        
        // Restablecer también los estados de selección
        setSelectedDepartment('');
        setSelectedSubDepartment('');
        setSelectedPuesto('');
  
      // Si tenemos una postulación seleccionada, archívala
      if (selectedPosting && selectedPosting.id) {
        const postingRef = doc(db, "Grupo_Pueble", selectedCompany, "postulaciones", selectedPosting.id);
        await updateDoc(postingRef, { 
          status: 'archived', 
          hiredEmployeeId: newEmployeeId.toString() 
        });
  
        setPostings(prev => 
          prev.map(p => 
            p.id === selectedPosting.id 
              ? { ...p, status: 'archived', hiredEmployeeId: newEmployeeId.toString() } 
              : p
          )
        );
      }
  
      setShowEmployeeForm(false);
  
      toast({
        title: t('postulaciones.toast.title8'),
        description: t('postulaciones.toast.description8'),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: t('postulaciones.toast.description9'),
        variant: "destructive"
      });
    }
  };
  
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
    className={`w-full sm:w-auto bg-primary-50 border-primary-200 transition-all duration-300 shadow-sm hover:shadow-md rounded-lg px-4 py-2
      ${!selectedCompany 
        ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700' 
        : 'text-primary-700 hover:bg-primary-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
      }`}
    onClick={() => setShowAddPostingDialog(true)}
    disabled={!selectedCompany}
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
        w-[95vw] 
        max-w-xl 
        h-[90vh] 
        max-h-[90vh]
        bg-white 
        dark:bg-gray-900 
        rounded-2xl 
        shadow-2xl 
        border 
        border-gray-200 
        dark:border-gray-700 
        overflow-hidden
        fixed
        top-[50%]
        left-[50%]
        translate-x-[-50%]
        translate-y-[-50%]
        flex
        flex-col
      ">
        <DialogHeader className="
          border-b 
          border-gray-100 
          dark:border-gray-800 
          p-4
          shrink-0
        ">
          <DialogTitle className="
            text-xl
            md:text-2xl 
            font-extrabold 
            text-gray-800 
            dark:text-gray-100 
            flex 
            items-center 
            gap-3"
          >
            <FileArchive className="h-6 w-6 md:h-7 md:w-7 text-primary-600" />
            {t('postulaciones.jobApplications.header.detallespublicacion')}
          </DialogTitle>
          <DialogDescription className="
            text-gray-500 
            dark:text-gray-400 
            text-xs
            md:text-sm"
          >
            {t('postulaciones.jobApplications.header.informaciondetallada')}
          </DialogDescription>
        </DialogHeader>
        
        {selectedPosting && (
          <div className="
            flex-1 
            overflow-y-auto 
            p-4 
            space-y-4
            scrollbar-thin 
            scrollbar-thumb-gray-300 
            dark:scrollbar-thumb-gray-700
          ">
            <div className="
              bg-gray-50 
              dark:bg-gray-800/50 
              p-3
              md:p-4 
              rounded-lg 
              border 
              border-gray-200 
              dark:border-gray-700"
            >
              <h3 className="
                font-bold 
                text-base
                md:text-lg 
                text-primary-600 
                dark:text-primary-400 
                mb-2 
                border-b 
                border-gray-200 
                dark:border-gray-700 
                dark:text-white
                pb-2"
              >
                {t('postulaciones.jobApplications.header.informacionpublicacion')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    {t('postulaciones.jobApplications.header.titulo')}
                  </p>
                  <p className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200">
                    {selectedPosting.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    {t('postulaciones.jobApplications.header.descripcion')}
                  </p>
                  <p className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200 line-clamp-3">
                    {selectedPosting.description}
                  </p>
                </div>
              </div>
            </div>

            {selectedPosting.hiredEmployeeId && hiredEmployee && (
              <div className="
                bg-blue-50 
                dark:bg-blue-900/30 
                p-3
                md:p-4 
                rounded-lg 
                border 
                border-blue-200 
                dark:border-blue-800"
              >
                <h3 className="
                  font-bold 
                  text-base
                  md:text-lg 
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Employee Info Grid */}
                  {[
                    {
                      label: 'nombrecom',
                      value: `${hiredEmployee.nombre} ${hiredEmployee.apellido}`
                    },
                    { label: 'dni', value: hiredEmployee.dni },
                    { label: 'correo', value: hiredEmployee.correo },
                    { label: 'depto', value: hiredEmployee.departamento },
                    { label: 'subdepto', value: hiredEmployee.subdepartamento },
                    { label: 'puesto', value: hiredEmployee.puesto },
                    { label: 'genero', value: hiredEmployee.genero },
                    { label: 'fechanac', value: hiredEmployee.fechaNacimiento },
                    { label: 'titulo', value: hiredEmployee.titulo }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {t(`postulaciones.jobApplications.header.${item.label}`)}
                      </p>
                      <p className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200">
                        {item.value}
                      </p>
                    </div>
                  ))}
                  
                  {/* LinkedIn */}
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {t('postulaciones.jobApplications.header.linkedin')}
                      </p>
                      <a 
                        href={`https://www.linkedin.com/in/${hiredEmployee.linkedin}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block hover:opacity-80 transition-opacity"
                      >
                        <FaLinkedin className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      </a>
                    </div>
                  </div>
                  
                  {/* Salary */}
                  <div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {t('postulaciones.jobApplications.header.sueldo')}
                    </p>
                    <p className="font-semibold text-sm md:text-base text-green-600 dark:text-green-400">
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
          dark:bg-gray-900/50
          shrink-0
        ">
          <Button 
            variant="outline"
            onClick={() => setShowDetailsDialog(false)}
            className="
              w-full 
              dark:bg-gray-700 
              dark:hover:bg-gray-600 
              dark:text-white 
              transition-all 
              hover:scale-[1.02]
              text-sm
              md:text-base
            "
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
            <label htmlFor="">{t('postulaciones.jobApplications.header.titulo')}</label>
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

      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
      <DialogContent className="
        w-[95vw] 
        max-w-3xl 
        h-[90vh] 
        max-h-[90vh]
        bg-white 
        dark:bg-gray-900 
        dark:text-white
        rounded-lg
        fixed
        top-[50%]
        left-[50%]
        translate-x-[-50%]
        translate-y-[-50%]
        flex
        flex-col
        overflow-hidden
      ">
        <DialogHeader className="
          p-4 
          border-b 
          border-gray-200 
          dark:border-gray-700
          shrink-0
        ">
          <DialogTitle className="text-lg md:text-xl font-semibold">
            {t('postulaciones.jobApplications.header.registrarnuevoempleado')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="
          flex-1
          overflow-y-auto
          scrollbar-thin
          scrollbar-thumb-gray-300
          dark:scrollbar-thumb-gray-700
          p-4
        ">
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
            {/* Basic Information */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground" htmlFor="nombre">
                {t('empleados.addEmployee.form.fields.nombre.label')}
              </label>
              <Input 
                id="nombre" 
                name="nombre" 
                value={newEmployee.nombre} 
                onChange={handleInputChange} 
                placeholder={t('empleados.addEmployee.form.fields.nombre.placeholder')}
                className="focus:ring-2 focus:ring-primary/20 text-sm"
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground" htmlFor="apellido">
                {t('empleados.addEmployee.form.fields.apellido.label')}
              </label>
              <Input 
                id="apellido" 
                name="apellido" 
                value={newEmployee.apellido} 
                onChange={handleInputChange} 
                placeholder={t('empleados.addEmployee.form.fields.apellido.placeholder')}
                className="focus:ring-2 focus:ring-primary/20 text-sm"
                required 
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground" htmlFor="dni">
                {t('empleados.addEmployee.form.fields.dni.label')}
              </label>
              <Input 
                id="dni" 
                name="dni" 
                value={newEmployee.dni} 
                onChange={handleInputChange} 
                placeholder={t('empleados.addEmployee.form.fields.dni.placeholder')}
                className="focus:ring-2 focus:ring-primary/20 text-sm"
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground" htmlFor="correo">
                {t('empleados.addEmployee.form.fields.correo.label')}
              </label>
              <Input 
                id="correo" 
                name="correo" 
                value={newEmployee.correo} 
                onChange={handleInputChange} 
                placeholder={t('empleados.addEmployee.form.fields.correo.placeholder')}
                className="focus:ring-2 focus:ring-primary/20 text-sm"
                required 
              />
            </div>

            {/* Professional Information */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground" htmlFor="titulo">
                {t('empleados.addEmployee.form.fields.titulo.label')}
              </label>
              <Input 
                id="titulo" 
                name="titulo" 
                value={newEmployee.titulo} 
                onChange={handleInputChange} 
                placeholder={t('empleados.addEmployee.form.fields.titulo.placeholder')}
                className="focus:ring-2 focus:ring-primary/20 text-sm"
                required 
              />
            </div>

            {/* Department Selection */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground" htmlFor="departamentos">
                {t('empleados.addEmployee.form.fields.departamento.label')}
              </label>
              <Select value={selectedDepartment || ''} onValueChange={setSelectedDepartment}>
                <SelectTrigger id="departamento" className="focus:ring-2 focus:ring-primary/20 text-sm">
                  <SelectValue placeholder={t('empleados.addEmployee.form.fields.departamento.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {departmentos.length === 0 ? (
                    <SelectItem value="no-departments" disabled>No hay departamentos disponibles</SelectItem>
                  ) : (
                    departmentos.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Sub-department Selection */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground" htmlFor="subdepartamento">
                {t('empleados.addEmployee.form.fields.subdepartamento.label')}
              </label>
              <Select value={selectedSubDepartment || ''} onValueChange={setSelectedSubDepartment}>
                <SelectTrigger id="subdepartamento" className="focus:ring-2 focus:ring-primary/20 text-sm">
                  <SelectValue placeholder={t('empleados.addEmployee.form.fields.subdepartamento.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {subdepartmentos.length === 0 ? (
                    <SelectItem value="no-Subdepartments" disabled>No hay SubDepartamentos disponibles</SelectItem>
                  ) : (
                    subdepartmentos.map((subDep) => (
                      <SelectItem key={subDep} value={subDep}>{subDep}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Position Selection */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground" htmlFor="puesto">
                {t('empleados.addEmployee.form.fields.puesto.label')}
              </label>
              <Select value={selectedPuesto || ''} onValueChange={setSelectedPuesto}>
                <SelectTrigger id="puesto" className="focus:ring-2 focus:ring-primary/20 text-sm">
                  <SelectValue placeholder={t('empleados.addEmployee.form.fields.puesto.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {puestos.length === 0 ? (
                    <SelectItem value="no-jobs" disabled>No hay puestos disponibles</SelectItem>
                  ) : (
                    puestos.map((puesto) => (
                      <SelectItem key={puesto} value={puesto}>{puesto}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground" htmlFor="sueldo">
                {t('empleados.addEmployee.form.fields.sueldo.label')}
              </label>
              <Input 
                id="sueldo" 
                name="sueldo" 
                value={newEmployee.sueldo} 
                onChange={handleInputChange} 
                placeholder={t('empleados.addEmployee.form.fields.sueldo.placeholder')}
                className="focus:ring-2 focus:ring-primary/20 text-sm"
                required 
              />
            </div>

            {/* Gender Selection */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground">
                {t('empleados.addEmployee.form.fields.genero.label')}
              </label>
              <div className="flex items-center space-x-4 md:space-x-6 text-sm">
                <label htmlFor="male" className="flex items-center space-x-2">
                  <input
                    id="male"
                    type="radio"
                    name="genero"
                    value="masculino"
                    checked={newEmployee.genero === "masculino"}
                    onChange={handleInputChange}
                    className="w-4 h-4"
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
                    className="w-4 h-4"
                  />
                  <span>{t('empleados.addEmployee.form.fields.genero.options.female')}</span>
                </label>
              </div>
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground" htmlFor="fechaNacimiento">
                {t('empleados.addEmployee.form.fields.fechaNacimiento.label')}
              </label>
              <Input 
                id="fechaNacimiento" 
                name="fechaNacimiento" 
                type="date" 
                value={newEmployee.fechaNacimiento} 
                onChange={handleInputChange} 
                className="focus:ring-2 focus:ring-primary/20 text-sm"
                required 
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-muted-foreground" htmlFor="linkedin">
                {t('empleados.addEmployee.form.fields.linkedin.label')}
              </label>
              <Input 
                id="linkedin" 
                name="linkedin" 
                value={newEmployee.linkedin} 
                onChange={handleInputChange} 
                placeholder={t('empleados.addEmployee.form.fields.linkedin.placeholder')}
                className="focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>
        </form>

        {/* Footer Buttons */}
        <div className="
          mt-4
          p-4
          border-t
          border-gray-200
          dark:border-gray-700
          bg-gray-50
          dark:bg-gray-900/50
          shrink-0
          flex
          flex-col
          sm:flex-row
          gap-2
          sm:justify-end
        ">
          <Button 
            variant="outline" 
            onClick={() => setShowEmployeeForm(false)}
            className="w-full sm:w-auto dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white order-2 sm:order-1"
          >
            {t('postulaciones.jobApplications.header.cancelar')}
          </Button>
          <Button 
            type="submit" 
            className="w-full sm:w-auto order-1 sm:order-2"
            onClick={handleSubmit}
          >
            {t('empleados.buttons.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  )
}