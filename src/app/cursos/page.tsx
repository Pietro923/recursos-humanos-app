"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Programas de Formación</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Cursos Disponibles</h2>
          <Button onClick={() => setShowAddCourseModal(true)}>Agregar Nuevo Curso</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Curso</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map(course => (
              <TableRow key={course.id}>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.department}</TableCell>
                <TableCell>{course.duration}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      course.status === "Completado"
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : course.status === "En progreso"
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-gray-500 text-white hover:bg-gray-600"
                    }
                  >
                    {course.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button onClick={() => { setSelectedCourse(course); setShowDetailsModal(true); }} className="bg-blue-300 mr-2 hover:bg-blue-400" variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                  <Button onClick={() => { setSelectedCourse(course); setShowAssignEmployeeModal(true); }} className="bg-green-300 hover:bg-green-400" variant="outline" size="sm">
                    Agregar Empleado
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal para agregar nuevo curso */}
      <Dialog open={showAddCourseModal} onOpenChange={setShowAddCourseModal}>
        <DialogContent className="bg-white rounded-lg shadow-lg p-6">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Curso</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAddCourse(); }} className="space-y-4">
            <Input name="name" placeholder="Nombre del Curso" value={newCourse.name} onChange={handleNewCourseChange} required />
            <Input name="department" placeholder="Departamento" value={newCourse.department} onChange={handleNewCourseChange} required />
            <Input name="duration" placeholder="Duración" value={newCourse.duration} onChange={handleNewCourseChange} required />
            <Textarea name="description" placeholder="Descripción" value={newCourse.description} onChange={handleNewCourseChange} required />
            <Button type="submit">Agregar Curso</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para ver detalles del curso */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="bg-white rounded-lg shadow-lg p-6">
          <DialogHeader>
            <DialogTitle>Detalles del Curso</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div>
              <p><strong>Nombre:</strong> {selectedCourse.name}</p>
              <p><strong>Departamento:</strong> {selectedCourse.department}</p>
              <p><strong>Duración:</strong> {selectedCourse.duration}</p>
              <p><strong>Estado:</strong> {selectedCourse.status}</p>
              <p><strong>Descripción:</strong> {selectedCourse.description}</p>
              <p><strong>Empleados Asignados:</strong></p>
              <ul>
                {selectedCourse.employees.map(empId => (
                  <li key={empId}>{employees.find(emp => emp.id === empId)?.name}</li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para asignar empleados al curso */}
      <Dialog open={showAssignEmployeeModal} onOpenChange={setShowAssignEmployeeModal}>
        <DialogContent className="bg-white rounded-lg shadow-lg p-6">
          <DialogHeader>
            <DialogTitle>Asignar Empleado a Curso</DialogTitle>
          </DialogHeader>
          <form 
            className="space-y-4" 
            onSubmit={(e) => { 
              e.preventDefault(); 
              handleAssignEmployee(); 
              resetAssignmentFields(); // Llama a la función para limpiar campos
            }}
          >
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-full">
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
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full">
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
            <Button type="submit">Asignar Empleado</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
