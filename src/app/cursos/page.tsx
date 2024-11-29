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
}

export default function TrainingPage() {
  // Estados principales
  const [courses, setCourses] = useState<Course[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies] = useState(["Pueble SA - CASE IH", "KIA"]);
  const [archivedCourses, setArchivedCourses] = useState<Course[]>([]);
  const { t } = useTranslation(); // Hook de traducción
  
  // Estados para modales
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignEmployeeModal, setShowAssignEmployeeModal] = useState(false);
  
  // Estados para selección
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  
  // Estados para calendario
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
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

  // Efecto para cargar cursos
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedCompany) return;
      
      try {
        const coursesRef = collection(db, "Grupo_Pueble", selectedCompany, "cursos");
        const coursesSnapshot = await getDocs(coursesRef);
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[];
        
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [selectedCompany]);

  // Efecto para cargar empleados
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedCompany) return;
      
      try {
        const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados");
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesData = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().nombre,
          company: selectedCompany
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
      // 1. Crear referencia a la colección de cursos finalizados
      const cursosFinalizadosRef = collection(db, "Grupo_Pueble", selectedCompany, "cursos_finalizados");
      
      // 2. Crear referencia al curso actual
      const cursoRef = doc(db, "Grupo_Pueble", selectedCompany, "cursos", course.id);
      
      // 3. Obtener los datos actuales del curso
      const cursoDoc = await getDoc(cursoRef);
      if (!cursoDoc.exists()) {
        throw new Error("Curso no encontrado");
      }
      
      // 4. Añadir metadatos de archivo
      const cursoFinalizado = {
        ...cursoDoc.data(),
        fechaArchivado: new Date().toISOString(),
        archivedFrom: course.id,
      };
      
      // 5. Añadir a la colección de cursos finalizados
      await addDoc(cursosFinalizadosRef, cursoFinalizado);
      
      // 6. Eliminar de la colección de cursos activos
      await deleteDoc(cursoRef);
      
      // 7. Actualizar el estado local
      setCourses(prevCourses => prevCourses.filter(c => c.id !== course.id));
      
      // 8. Cerrar el modal de detalles si está abierto
      setShowDetailsModal(false);
      
      // 9. Mostrar notificación de éxito (opcional, necesitarías implementar un sistema de notificaciones)
      toast({
        title: t('cursos.toast.title_course_completed'),
        description: t('cursos.toast.description_course_completed'),
        variant: "default"
      })
      
    } catch (error) {
      console.error("Error archivando curso:", error);
      // Mostrar notificación de error (opcional)
      toast({
        title:  t('cursos.toast.title_error_archiving_course'),
        description: t('cursos.toast.description_error_archiving_course'),
        variant: "destructive"
      })
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
          <div key={day} className="p-2 text-center font-medium bg-muted">
            {day}
          </div>
        ))}
        {Array(firstDay).fill(null).map((_, i) => (
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
                coursesOnDay.length > 0 ? "bg-blue-50" : ""
              }`}
            >
              <div className="font-medium">{day}</div>
              {coursesOnDay.map(course => (
                <div
                  key={course.id}
                  className="text-xs p-1 bg-blue-100 rounded mt-1 cursor-pointer"
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

  // Componente de Vista Global
  const GlobalView = () => {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('cursos.global_view.card_title')}</CardTitle>
            <div className="flex gap-2">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('cursos.global_view.select_month_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {new Date(2024, i, 1).toLocaleString('es', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t('cursos.global_view.select_year_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025].map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('cursos.global_view.table_headers.employee')}</TableHead>
                <TableHead>{t('cursos.global_view.table_headers.assigned_courses')}</TableHead>
                <TableHead>{t('cursos.global_view.table_headers.progress')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(employee => {
                const employeeCourses = courses.filter(course => 
                  course.employees.includes(employee.id)
                );
                return (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {employeeCourses.map(course => (
                          <Badge 
                            key={course.id} 
                            className={getStatusStyle(course.status)}
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
                    <TableCell>
                      {employeeCourses.length} curso(s) asignado(s)
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight dark:text-white">{t('cursos.title')}</h1>
        </div>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-[250px] dark:text-white dark:bg-gray-950">
            <SelectValue placeholder={t('cursos.selectcompany')} />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="dark:text-white dark:bg-gray-950 ">
          <TabsTrigger value="list" className="flex items-center gap-2 dark:hover:bg-gray-800">
            <List className="h-4 w-4" />
            {t('cursos.tabs.courses_list')}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2 dark:hover:bg-gray-800 ">
            <Calendar className="h-4 w-4 " />
            {t('cursos.tabs.calendar')}
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2 dark:hover:bg-gray-800">
            <Users className="h-4 w-4" />
            {t('cursos.tabs.global_view')}
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2 dark:hover:bg-gray-800">
            <Archive className="h-4 w-4" />
            {t('cursos.tabs.archived_courses')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-muted/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <CardTitle> {t('cursos.courses_list.courses')}</CardTitle>
                </div>
                <Button
                  onClick={() => setShowAddCourseModal(true)}
                  className="gap-2 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  disabled={!selectedCompany}
                >
                  <Plus className="h-4 w-4 dark:text-white" />
                  {t('cursos.courses_list.add_new_course')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="dark:text-white">{t('cursos.courses_list.table_headers.course_name')}</TableHead>
                    <TableHead className="dark:text-white">{t('cursos.courses_list.table_headers.department')}</TableHead>
                    <TableHead className="dark:text-white">{t('cursos.courses_list.table_headers.duration')}</TableHead>
                    <TableHead className="dark:text-white">{t('cursos.courses_list.table_headers.status')}</TableHead>
                    <TableHead className="dark:text-white text-right">{t('cursos.courses_list.table_headers.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.department}</TableCell>
                      <TableCell>{course.duration}</TableCell>
                      <TableCell>
                      <Badge className={`dark:text-white ${getStatusStyle(course.status)}`}>
                        {course.status}
                      </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle> {t('cursos.calendar.card_title')}</CardTitle>
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
          <Card>
            <CardHeader>
            <div className="flex items-center gap-2">
                  <Archive className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>{t('cursos.archived_courses.card_title')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('cursos.archived_courses.table_headers.course_name')}</TableHead>
                    <TableHead>{t('cursos.archived_courses.table_headers.department')}</TableHead>
                    <TableHead>{t('cursos.archived_courses.table_headers.archived_date')}</TableHead>
                    <TableHead>{t('cursos.archived_courses.table_headers.final_status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedCourses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.department}</TableCell>
                      <TableCell>{new Date(course.fechaArchivado).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{t('cursos.archived_courses.badge')}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para agregar curso */}
      <Dialog open={showAddCourseModal} onOpenChange={setShowAddCourseModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white">
          <DialogHeader>
            <DialogTitle>{t('cursos.modal.add_course.title')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>{t('cursos.modal.add_course.fields.course_name')}</label>
                <Input
                  className="dark:border-gray-500"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  placeholder={t('cursos.modal.add_course.fields.course_nameplaceholder')}
                />
              </div>
              <div className="space-y-2">
                <label>{t('cursos.modal.add_course.fields.department')}</label>
                <Input
                className="dark:border-gray-500"
                  value={newCourse.department}
                  onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                  placeholder={t('cursos.modal.add_course.fields.departmentplaceholder')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>{t('cursos.modal.add_course.fields.dateStart')}</label>
                <Input
                className="dark:border-gray-500 "
                  type="date"
                  value={newCourse.startDate}
                  onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2 ">
                <label>{t('cursos.modal.add_course.fields.dateEnd')}</label>
                <Input
                className="dark:border-gray-500"
                  type="date"
                  value={newCourse.endDate}
                  onChange={(e) => setNewCourse({ ...newCourse, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label>{t('cursos.modal.add_course.fields.duration')}</label>
              <Input
              className="dark:border-gray-500"
                value={newCourse.duration}
                onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                placeholder="Ej: 2 semanas"
              />
            </div>
            <div className="space-y-2">
              <label>{t('cursos.modal.add_course.fields.description')}</label>
              <Textarea
              className="dark:border-gray-500"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder={t('cursos.modal.add_course.fields.descriptionplaceholder')}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button className="dark:bg-gray-600 dark:hover:bg-gray-700" variant="outline" onClick={() => setShowAddCourseModal(false)}>
              {t('cursos.modal.add_course.fields.button1')}
              </Button>
              <Button className="dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white" onClick={handleAddCourse}>{t('cursos.modal.add_course.fields.button2')}</Button>
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
              <label>{t('cursos.details.selectemployee')}</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cursos.details.selectemployeeplaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(employee => !selectedCourse?.employees.includes(employee.id))
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
              <Button className="dark:text-white dark:bg-gray-900 dark:border-gray-300 dark:hover:bg-gray-700" onClick={handleAssignEmployee}>{t('cursos.details.selectbutton')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}