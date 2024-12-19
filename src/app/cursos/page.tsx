"use client";
import { useState, useEffect } from "react";
import { GraduationCap, Plus, Users, Calendar, List } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/firebaseConfig";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { Archive } from "lucide-react";
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next";

interface Course {
  fechaArchivado: string | number | Date;
  id: string;
  name: string;
  department: string;
  duration: string;
  description: string;
  status: string;
  employees: string[];
  startDate: string;
  endDate: string;
  companyId: string;
  
}

interface Employee {
  id: string;
  name: string;
  company: string;
  department: string; // Add this field
}

export default function TrainingPage() {
  // Estados principales
  const [courses, setCourses] = useState<Course[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies, setCompanies] = useState<string[]>([]); // Empresas dinámicas
  const [archivedCourses, setArchivedCourses] = useState<Course[]>([]);
  const { t } = useTranslation(); // Hook de traducción
  
  // Estados para modales
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignEmployeeModal, setShowAssignEmployeeModal] = useState(false);
  
  // Estados para selección
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  
  // Estados para calendario
  const [selectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());
  
  // Estado para nuevo curso
  const [newCourse, setNewCourse] = useState({
    name: "",
    department: "",
    duration: "",
    description: "",
    status: "Próximamente",
    startDate: "",
    endDate: "",
    employees: [] as string[],
    companyId: ""
  });

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

  const fetchCourses = async () => {
    if (!selectedCompany) return;
  
    try {
      const coursesRef = collection(db, "Grupo_Pueble", selectedCompany, "cursos");
      const coursesSnapshot = await getDocs(coursesRef);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
  
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };
  
  // Llamar a fetchCourses en el efecto
  useEffect(() => {
    fetchCourses();
  }, [selectedCompany]);

  // Efecto para cargar empleados
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedCompany) return;
      
      try {
        const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados");
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesData = employeesSnapshot.docs
          .filter(doc => doc.data().estado === "activo")
          .map(doc => ({
            id: doc.id,
            name: doc.data().nombre,
            company: selectedCompany,
            department: doc.data().departamento // Add this field
          }));
        
        setEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, [selectedCompany]);
  
  // Efecto para cargar cursos archivados/finalizados
  useEffect(() => {
    const fetchArchivedCourses = async () => {
      if (!selectedCompany) return;
      
      try {
        const archivedRef = collection(db, "Grupo_Pueble", selectedCompany, "cursos_finalizados");
        const archivedSnapshot = await getDocs(archivedRef);
        const archivedData = archivedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[];
        
        setArchivedCourses(archivedData);
      } catch (error) {
        console.error("Error fetching archived courses:", error);
      }
    };
  
    fetchArchivedCourses();
  }, [selectedCompany]);
  
  // Función para agregar nuevo curso
  const handleAddCourse = async () => {
    if (!selectedCompany) return;
    
    try {
      const coursesRef = collection(db, "Grupo_Pueble", selectedCompany, "cursos");
      const courseData = {
        ...newCourse,
        companyId: selectedCompany,
        employees: []
      };
      
      await addDoc(coursesRef, courseData);
      
      // Recargar cursos
      const coursesSnapshot = await getDocs(coursesRef);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      
      setCourses(coursesData);
      setShowAddCourseModal(false);
      setNewCourse({
        name: "",
        department: "",
        duration: "",
        description: "",
        status: "Próximamente",
        startDate: "",
        endDate: "",
        employees: [],
        companyId: ""
      });
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  // Función para asignar empleado a curso
  const handleAssignEmployee = async () => {
    if (!selectedCourse || !selectedEmployee || !selectedCompany) return;
    
    try {
      const courseRef = doc(db, "Grupo_Pueble", selectedCompany, "cursos", selectedCourse.id);
      const updatedEmployees = [...selectedCourse.employees, selectedEmployee];
      
      await updateDoc(courseRef, {
        employees: updatedEmployees
      });
      
      // Actualizar estado local
      setCourses(courses.map(course => 
        course.id === selectedCourse.id 
          ? { ...course, employees: updatedEmployees }
          : course
      ));
      
      setShowAssignEmployeeModal(false);
      setSelectedEmployee("");
    } catch (error) {
      console.error("Error assigning employee:", error);
    }
  };

  const archivarCurso = async (course: Course) => {
    if (!selectedCompany) return;
  
    try {
      // Crear referencia a la colección de cursos finalizados
      const cursosFinalizadosRef = collection(db, "Grupo_Pueble", selectedCompany, "cursos_finalizados");
  
      // Crear referencia al curso actual
      const cursoRef = doc(db, "Grupo_Pueble", selectedCompany, "cursos", course.id);
  
      // Obtener los datos actuales del curso
      const cursoDoc = await getDoc(cursoRef);
      if (!cursoDoc.exists()) {
        throw new Error("Curso no encontrado");
      }
  
      // Añadir metadatos de archivo
      const cursoFinalizado = {
        ...cursoDoc.data(),
        fechaArchivado: new Date().toISOString(),
        archivedFrom: course.id,
      };
  
      // Añadir a la colección de cursos finalizados
      await addDoc(cursosFinalizadosRef, cursoFinalizado);
  
      // Eliminar de la colección de cursos activos
      await deleteDoc(cursoRef);
  
      // Actualizar los cursos llamando a fetchCourses
      await fetchCourses();
  
      // Cerrar el modal de detalles si está abierto
      setShowDetailsModal(false);
  
      // Mostrar notificación de éxito
      toast({
        title: t('cursos.toast.title_course_completed'),
        description: t('cursos.toast.description_course_completed'),
        variant: "default",
      });
    } catch (error) {
      console.error("Error archivando curso:", error);
      // Mostrar notificación de error
      toast({
        title: t('cursos.toast.title_error_archiving_course'),
        description: t('cursos.toast.description_error_archiving_course'),
        variant: "destructive",
      });
    }
  };

  // Función para obtener el estilo del status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completado":
        return "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25";
      case "En progreso":
        return "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25";
      default:
        return "bg-slate-500/15 text-slate-700 hover:bg-slate-500/25";
    }
  };

  // Componente de Vista de Calendario
  const CalendarView = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 gap-1">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
          <div
            key={day}
            className="p-2 text-center font-medium bg-muted dark:bg-gray-800 dark:text-gray-200"
          >
            {day}
          </div>
        ))}
        {Array(firstDay)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}
        {days.map(day => {
          const date = new Date(selectedYear, selectedMonth, day);
          const coursesOnDay = courses.filter(course => {
            const start = new Date(course.startDate);
            const end = new Date(course.endDate);
            return date >= start && date <= end;
          });
    
          return (
            <div
              key={day}
              className={`p-2 min-h-[80px] border rounded-lg ${
                coursesOnDay.length > 0
                  ? "bg-blue-50 dark:bg-blue-900"
                  : "dark:bg-gray-700"
              }`}
            >
              <div className="font-medium dark:text-gray-200">{day}</div>
              {coursesOnDay.map(course => (
                <div
                  key={course.id}
                  className="text-xs p-1 bg-blue-100 rounded mt-1 cursor-pointer dark:bg-blue-800 dark:text-gray-200"
                  title={course.name}
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowDetailsModal(true);
                  }}
                >
                  {course.name.substring(0, 15)}...
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

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


  const GlobalView = () => {
  return (
    <Card className="w-full">
  <CardHeader className="p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <CardTitle className="text-lg sm:text-xl">
        {t('cursos.global_view.card_title')}
      </CardTitle>
    </div>
  </CardHeader>
  <CardContent className="p-2 sm:p-6">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3 text-xs sm:text-sm">
              {t('cursos.global_view.table_headers.employee')}
            </TableHead>
            <TableHead className="w-1/3 text-xs sm:text-sm">
              {t('cursos.global_view.table_headers.assigned_courses')}
            </TableHead>
            <TableHead className="w-1/3 text-xs sm:text-sm text-right">
              {t('cursos.global_view.table_headers.progress')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map(employee => {
            const employeeCourses = courses.filter(course => 
              course.employees.includes(employee.id)
            );
            return (
              <TableRow key={employee.id}>
                <TableCell className="align-top w-1/3">
                  {employee.name}
                </TableCell>
                <TableCell className="align-top w-1/3">
                  <div className="flex flex-wrap gap-2">
                    {employeeCourses.map(course => (
                      <Badge 
                        key={course.id} 
                        className={`${getStatusStyle(course.status)} dark:text-white text-xs sm:text-sm cursor-pointer`}
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowDetailsModal(true);
                        }}
                      >
                        {course.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="align-top w-1/3 text-right">
                  {employeeCourses.length} curso(s) asignado(s)
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>
  );
};

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-0 space-y-6 sm:space-y-8">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between dark:text-white gap-4 sm:gap-0">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight dark:text-white">
          {t('cursos.title')}
        </h1>
      </div>
        
      <div className="w-full sm:w-auto">
        <Select 
          value={selectedCompany} 
          onValueChange={setSelectedCompany}
        >
          <SelectTrigger className="w-full sm:w-[250px] bg-white dark:bg-blue-800 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all duration-300">
            <SelectValue 
              placeholder={t('pagedashboard.selectCompanyPlaceholder')} 
              className="text-blue-600 dark:text-blue-200"
            />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-blue-900 border-blue-200 dark:border-blue-700 shadow-xl">
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
    </div>
    <Tabs defaultValue="list" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-3 p-1 bg-gray-100 dark:bg-gray-800 dark:text-white rounded-lg">
        {[
          { value: 'list', icon: List, label: t('cursos.tabs.courses_list') },
          { value: 'calendar', icon: Calendar, label: t('cursos.tabs.calendar') },
          { value: 'global', icon: Users, label: t('cursos.tabs.global_view') },
          { value: 'archived', icon: Archive, label: t('cursos.tabs.archived_courses') }
        ].map(({ value, icon: Icon, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="list">
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-bold">
                  {t('cursos.courses_list.courses')}
                </CardTitle>
              </div>
              <Button
                onClick={() => setShowAddCourseModal(true)}
                className="group transition-all duration-300 hover:scale-105"
                disabled={!selectedCompany}
              >
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                {t('cursos.courses_list.add_new_course')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900">
                    {['course_name', 'duration', 'status', 'actions'].map((header) => (
                      <TableHead key={header} className="py-4 px-6 text-sm font-semibold">
                        {t(`cursos.courses_list.table_headers.${header}`)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map(course => (
                    <TableRow 
                      key={course.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.duration}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusStyle(course.status)} px-3 py-1 rounded-full dark:text-white`}>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-primary hover:text-white transition-colors dark:hover:bg-gray-600"
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowDetailsModal(true);
                            }}
                          >
                            {t('cursos.courses_list.buttons.details')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-primary hover:text-white transition-colors dark:hover:bg-gray-600"
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowAssignEmployeeModal(true);
                            }}
                          >
                            {t('cursos.courses_list.buttons.assign')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="calendar">
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <CardTitle>{t('cursos.calendar.card_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarView />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="global">
        <GlobalView />
      </TabsContent>

      <TabsContent value="archived">
  <Card className="border-none shadow-xl">
    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center gap-3">
        <Archive className="h-6 w-6 text-primary" />
        <CardTitle>{t('cursos.archived_courses.card_title')}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="p-6">
      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900">
              <TableHead className="w-1/3 py-4 px-6 text-sm font-semibold">
                {t('cursos.archived_courses.table_headers.course_name')}
              </TableHead>
              <TableHead className="w-1/3 py-4 px-6 text-sm font-semibold">
                {t('cursos.archived_courses.table_headers.archived_date')}
              </TableHead>
              <TableHead className="w-1/3 py-4 px-6 text-sm font-semibold">
                {t('cursos.archived_courses.table_headers.final_status')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archivedCourses.map(course => (
              <TableRow 
                key={course.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <TableCell className="w-1/3 py-4 px-6">
                  <div className="font-medium">{course.name}</div>
                </TableCell>
                <TableCell className="w-1/3 py-4 px-6">
                  {new Date(course.fechaArchivado).toLocaleDateString()}
                </TableCell>
                <TableCell className="w-1/3 py-4 px-6">
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800"
                  >
                    {t('cursos.archived_courses.table_headers.badge')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {archivedCourses.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={3} 
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  {t('cursos.archived_courses.no_courses')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</TabsContent>
    </Tabs>

      <Dialog open={showAddCourseModal} onOpenChange={setShowAddCourseModal}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white p-3 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-2xl font-semibold">
            {t('cursos.modal.add_course.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-3 py-3 sm:gap-4 sm:py-4">
          {/* Course Name */}
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="course_name" className="text-sm sm:text-base font-medium">
              {t('cursos.modal.add_course.fields.course_name')}
            </label>
            <Input
              id="course_name"
              className={`w-full text-sm sm:text-base dark:border-gray-500 ${
                !newCourse.name.trim() ? 'border-red-500' : ''
              }`}
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              placeholder={t('cursos.modal.add_course.fields.course_nameplaceholder')}
              required
            />
            {!newCourse.name.trim() && (
              <p className="text-red-500 text-xs">
                {t('cursos.modal.add_course.errors.name_required')}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="start_date" className="text-sm sm:text-base font-medium">
                {t('cursos.modal.add_course.fields.dateStart')}
              </label>
              <Input
                id="start_date"
                className={`w-full text-sm sm:text-base dark:border-gray-500 ${
                  !newCourse.startDate ? 'border-red-500' : ''
                }`}
                type="date"
                value={newCourse.startDate}
                onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
                required
              />
              {!newCourse.startDate && (
                <p className="text-red-500 text-xs">
                  {t('cursos.modal.add_course.errors.start_date_required')}
                </p>
              )}
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="end_date" className="text-sm sm:text-base font-medium">
                {t('cursos.modal.add_course.fields.dateEnd')}
              </label>
              <Input
                id="end_date"
                className={`w-full text-sm sm:text-base dark:border-gray-500 ${
                  !newCourse.endDate || new Date(newCourse.startDate) > new Date(newCourse.endDate)
                    ? 'border-red-500'
                    : ''
                }`}
                type="date"
                value={newCourse.endDate}
                onChange={(e) => setNewCourse({ ...newCourse, endDate: e.target.value })}
                required
              />
              {!newCourse.endDate && (
                <p className="text-red-500 text-xs">
                  {t('cursos.modal.add_course.errors.end_date_required')}
                </p>
              )}
              {newCourse.startDate && 
               newCourse.endDate && 
               new Date(newCourse.startDate) > new Date(newCourse.endDate) && (
                <p className="text-red-500 text-xs">
                  {t('cursos.modal.add_course.errors.invalid_date_range')}
                </p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="duration" className="text-sm sm:text-base font-medium">
              {t('cursos.modal.add_course.fields.duration')}
            </label>
            <Input
              id="duration"
              className={`w-full text-sm sm:text-base dark:border-gray-500 ${
                !newCourse.duration.trim() ? 'border-red-500' : ''
              }`}
              value={newCourse.duration}
              onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
              placeholder="Ej: 2 semanas"
              required
            />
            {!newCourse.duration.trim() && (
              <p className="text-red-500 text-xs">
                {t('cursos.modal.add_course.errors.duration_required')}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="description" className="text-sm sm:text-base font-medium">
              {t('cursos.modal.add_course.fields.description')}
            </label>
            <Textarea
              id="description"
              className={`w-full min-h-[80px] sm:min-h-[100px] text-sm sm:text-base dark:border-gray-500 ${
                !newCourse.description.trim() ? 'border-red-500' : ''
              }`}
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              placeholder={t('cursos.modal.add_course.fields.descriptionplaceholder')}
              required
            />
            {!newCourse.description.trim() && (
              <p className="text-red-500 text-xs">
                {t('cursos.modal.add_course.errors.description_required')}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-2 sm:mt-4">
            <Button
              className="w-full sm:w-auto text-sm sm:text-base dark:bg-gray-600 dark:hover:bg-gray-700"
              variant="outline"
              onClick={() => setShowAddCourseModal(false)}
            >
              {t('cursos.modal.add_course.fields.button1')}
            </Button>
            <Button
              className="w-full sm:w-auto text-sm sm:text-base dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white"
              onClick={handleAddCourse}
              disabled={
                !newCourse.name.trim() ||
                !newCourse.startDate ||
                !newCourse.endDate ||
                new Date(newCourse.startDate) > new Date(newCourse.endDate) ||
                !newCourse.duration.trim() ||
                !newCourse.description.trim()
              }
            >
              {t('cursos.modal.add_course.fields.button2')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

      {/* Modal de detalles del curso */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
  <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white">
    <DialogHeader>
      <DialogTitle>{t('cursos.details.title')}</DialogTitle>
    </DialogHeader>
    {selectedCourse && (
      <div className="flex flex-col h-full space-y-4">
        {/* Información principal del curso */}
        <div className="flex-grow space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">{t('cursos.modal.add_course.fields.course_name')}</h3>
              <p>{selectedCourse.name}</p>
            </div>
            <div>
              <h3 className="font-medium">{t('cursos.modal.add_course.fields.course_name')}</h3>
              <p>{selectedCourse.department}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium">{t('cursos.modal.add_course.fields.description')}</h3>
            <p>{selectedCourse.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium">{t('cursos.modal.add_course.fields.duration')}</h3>
              <p>{selectedCourse.duration}</p>
            </div>
            <div>
              <h3 className="font-medium">{t('cursos.modal.add_course.fields.dateStart')}</h3>
              <p>{selectedCourse.startDate}</p>
            </div>
            <div>
              <h3 className="font-medium">{t('cursos.modal.add_course.fields.dateEnd')}</h3>
              <p>{selectedCourse.endDate}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium">{t('cursos.details.employeeAssing')}</h3>
            <div className="mt-2 space-y-2">
              {selectedCourse.employees.map((employeeId) => {
                const employee = employees.find((e) => e.id === employeeId);
                return (
                  <Badge key={employeeId} variant="outline">
                    {employee?.name || t('cursos.details.employeenofound')}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="destructive"
            onClick={() => {
              if (selectedCourse) {
                archivarCurso(selectedCourse);
              }
            }}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            {t('cursos.details.archiveButton')}
          </Button>
        </div>
      </div>
    )}
    </DialogContent>
  </Dialog>


      {/* Modal para asignar empleado */}
<Dialog open={showAssignEmployeeModal} onOpenChange={setShowAssignEmployeeModal}>
  <DialogContent className="bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white">
    <DialogHeader>
      <DialogTitle>{t('cursos.details.selectemployeetitle')}</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <label>Selecciona Departamento</label>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona Depto" />
          </SelectTrigger>
          <SelectContent>
            {departmentos.map((depto) => (
              <SelectItem key={depto} value={depto}>
                {depto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    <div className="space-y-4">
      <div className="space-y-2">
        <label>{t('cursos.details.selectemployee')}</label>
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger>
            <SelectValue placeholder={t('cursos.details.selectemployeeplaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {employees
              .filter(employee => 
                (!selectedCourse?.employees.includes(employee.id)) && 
                (!selectedDepartment || employee.department === selectedDepartment)
              )
              .map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setShowAssignEmployeeModal(false)}>
          {t('cursos.modal.add_course.fields.button1')}
        </Button>
        <Button 
          className="dark:text-white dark:bg-gray-900 dark:border-gray-300 dark:hover:bg-gray-700" 
          onClick={handleAssignEmployee}
        >
          {t('cursos.details.selectbutton')}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}