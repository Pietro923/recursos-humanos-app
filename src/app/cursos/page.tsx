"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Plus, Users, Clock, Building2 } from "lucide-react";
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
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

interface Course {
  id: number;
  name: string;
  department: string;
  duration: string;
  description: string;
  status: string;
  employees: string[]; // IDs of assigned employees
}

interface Employee {
  id: string;
  name: string;
}

export default function TrainingPage() {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "Liderazgo Efectivo", department: "Todos", duration: "2 semanas", description: "Curso para desarrollar habilidades de liderazgo.", status: "En progreso", employees: [] },
    { id: 2, name: "Desarrollo Web Avanzado", department: "IT", duration: "4 semanas", description: "Curso avanzado en desarrollo web.", status: "Próximamente", employees: [] },
    { id: 3, name: "Técnicas de Ventas", department: "Ventas", duration: "1 semana", description: "Curso para mejorar técnicas de ventas.", status: "Completado", employees: [] },
  ]);

  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignEmployeeModal, setShowAssignEmployeeModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({ name: "", department: "", duration: "", description: "", status: "Próximamente" });
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies] = useState(["Pueble SA - CASE IH", "KIA"]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  // Fetch employees based on selected company
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedCompany) return;
      const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados");
      const employeesSnapshot = await getDocs(employeesRef);
      const employeesData = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().nombre,
      }));
      setEmployees(employeesData);
    };

    fetchEmployees();
  }, [selectedCompany]);

  // Handle changes in the new course form
  const handleNewCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleAddCourse = () => {
    setCourses([...courses, { id: courses.length + 1, ...newCourse, employees: [] }]);
    setNewCourse({ name: "", department: "", duration: "", description: "", status: "Próximamente" });
    setShowAddCourseModal(false);
  };

  const handleAssignEmployee = async () => {
    if (!selectedCourse || !selectedEmployee) return;

    const updatedCourse = { ...selectedCourse, employees: [...selectedCourse.employees, selectedEmployee] };
    setCourses(courses.map(course => (course.id === selectedCourse.id ? updatedCourse : course)));
    setShowAssignEmployeeModal(false);
  };

  // Función para limpiar los campos de asignación
  const resetAssignmentFields = () => {
    setSelectedCompany("");
    setSelectedEmployee("");
  };


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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Programas de Formación</h1>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-muted/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Cursos Disponibles</CardTitle>
            </div>
            <Button 
              onClick={() => setShowAddCourseModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Nuevo Curso
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-b-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Nombre del Curso</TableHead>
                  <TableHead className="font-semibold">Departamento</TableHead>
                  <TableHead className="font-semibold">Duración</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map(course => (
                  <TableRow key={course.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.department}</TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell>
                      <Badge className={getStatusStyle(course.status)}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        onClick={() => { 
                          setSelectedCourse(course); 
                          setShowDetailsModal(true); 
                        }}
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        onClick={() => { 
                          setSelectedCourse(course); 
                          setShowAssignEmployeeModal(true); 
                        }}
                        variant="outline"
                        size="sm"
                        className="hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        Agregar Empleado
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Agregar Curso */}
      <Dialog open={showAddCourseModal} onOpenChange={setShowAddCourseModal}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Agregar Nuevo Curso
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAddCourse(); }} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Curso</label>
              <Input 
                name="name" 
                placeholder="Ej: Desarrollo de Liderazgo" 
                value={newCourse.name} 
                onChange={handleNewCourseChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Departamento</label>
              <Input 
                name="department" 
                placeholder="Ej: Recursos Humanos" 
                value={newCourse.department} 
                onChange={handleNewCourseChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duración</label>
              <Input 
                name="duration" 
                placeholder="Ej: 4 semanas" 
                value={newCourse.duration} 
                onChange={handleNewCourseChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea 
                name="description" 
                placeholder="Describe el contenido y objetivos del curso..." 
                value={newCourse.description} 
                onChange={handleNewCourseChange} 
                required 
                className="min-h-[100px]"
              />
            </div>
            <Button type="submit" className="w-full">Agregar Curso</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Detalles del Curso */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Detalles del Curso
            </DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Nombre</label>
                  <p className="font-medium">{selectedCourse.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Departamento</label>
                  <p className="font-medium">{selectedCourse.department}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Duración</label>
                  <p className="font-medium">{selectedCourse.duration}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Estado</label>
                  <Badge className={getStatusStyle(selectedCourse.status)}>
                    {selectedCourse.status}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Descripción</label>
                <p className="text-sm">{selectedCourse.description}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Empleados Asignados</label>
                <div className="bg-muted/50 rounded-lg p-3">
                  {selectedCourse.employees.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedCourse.employees.map(empId => (
                        <li key={empId} className="text-sm">
                          {employees.find(emp => emp.id === empId)?.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay empleados asignados</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Asignar Empleado */}
      <Dialog open={showAssignEmployeeModal} onOpenChange={setShowAssignEmployeeModal}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Asignar Empleado a Curso
            </DialogTitle>
          </DialogHeader>
          <form 
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleAssignEmployee();
              resetAssignmentFields();
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Empresa
              </label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
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

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Empleado
              </label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Asignar Empleado
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

