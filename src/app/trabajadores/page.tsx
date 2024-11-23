"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebaseConfig";
import { collection, doc, getDocs, getDoc, updateDoc, setDoc, addDoc } from "firebase/firestore";
import { Trash2, Users, List, Search, Cake } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, differenceInYears, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Employee {
  id: string;
  nombre: string;
  apellido: string;
  dni: number;
  correo: string;
  departamento: string;
  sueldo: number;
  genero: string;
  fechaNacimiento: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("todos");
  const [departments, setDepartments] = useState<string[]>([]);
  const [birthdayEmployees, setBirthdayEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    correo: "",
    departamento: "",
    sueldo: "",
    genero: "",
    fechaNacimiento: ""
  });
  const [selectedCompany, setSelectedCompany] = useState("");
  const [view, setView] = useState("list");

  const companies = ["Pueble SA - CASE IH", "KIA"];

  /* Función para verificar cumpleaños
  const checkBirthdays = (employeesData: Employee[]) => {
    const today = new Date();
    const birthdays = employeesData.filter(employee => {
      const birthDate = new Date(employee.fechaNacimiento);
      return isSameDay(
        new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      );
    });
    setBirthdayEmployees(birthdays);

    // Crear notificaciones de cumpleaños
    birthdays.forEach(async (employee) => {
      const birthDate = new Date(employee.fechaNacimiento);
      const age = differenceInYears(new Date(), birthDate);
      
      try {
        await addDoc(collection(db, "Grupo_Pueble", selectedCompany, "recordatorios"), {
          tipo: "Cumpleaños",
          descripcion: `¡${employee.nombre} ${employee.apellido} cumple ${age} años hoy!`,
          fechaInicio: new Date(),
          fechaFin: new Date(new Date().setHours(23, 59, 59, 999)),
          empleadoId: employee.id,
          nombre: employee.nombre,
          apellido: employee.apellido
        });
      } catch (error) {
        console.error("Error al crear notificación de cumpleaños:", error);
      }
    });
  };*/

  // Obtener los empleados de Firebase
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedCompany) return;

      try {
        const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados");
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesData = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Employee[];

        // Obtener departamentos únicos
        const uniqueDepartments = Array.from(
          new Set(employeesData.map(emp => emp.departamento))
        ).filter(Boolean);
        setDepartments(uniqueDepartments);
        
        setEmployees(employeesData);
        setFilteredEmployees(employeesData);
       // checkBirthdays(employeesData);
      } catch (error) {
        console.error("Error al obtener los empleados:", error);
      }
    };

    fetchEmployees();
  }, [selectedCompany]);

  // Filtrar por departamento
  useEffect(() => {
    const filtered = employees.filter(
      emp => selectedDepartment === "todos" || emp.departamento === selectedDepartment
    );
    setFilteredEmployees(filtered);
  }, [selectedDepartment, employees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
  };

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

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const newEmployeeId = await getNewEmployeeId();

    const newEmployeeData = {
      ...newEmployee,
      dni: parseInt(newEmployee.dni, 10) || 0,
      sueldo: parseFloat(newEmployee.sueldo) || 0,
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

      setNewEmployee({
        nombre: "",
        apellido: "",
        dni: "",
        correo: "",
        departamento: "",
        sueldo: "",
        genero: "",
        fechaNacimiento: ""
      });
      setView("list");
    } catch (error) {
      console.error("Error al agregar el empleado:", error);
    }
  };


  return (
    <div className="space-y-6 p-6 bg-slate-50">
      {birthdayEmployees.length > 0 && (
        <div className="space-y-2">
          {birthdayEmployees.map((employee) => (
            <Alert key={employee.id} className="bg-blue-50 border-blue-200">
              <Cake className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">¡Cumpleaños!</AlertTitle>
              <AlertDescription className="text-blue-700">
                Hoy es el cumpleaños de {employee.nombre} {employee.apellido}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Empleados</h1>
          <p className="text-sm text-muted-foreground">
            Administra la información del personal
          </p>
        </div>
  
        <Card className="w-full sm:w-72 bg-white/50 backdrop-blur shadow-sm">
          <CardContent className="pt-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Seleccionar Empresa
            </label>
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
          </CardContent>
        </Card>
      </div>
  
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button 
          onClick={() => setView("add")} 
          className={`flex-1 sm:flex-none ${view === "add" 
            ? "bg-primary hover:bg-primary/90" 
            : "bg-white text-primary hover:bg-slate-100"}`}>
          <Users className="mr-2 h-4 w-4" />
          Agregar Nuevo Empleado
        </Button>
        <Button 
          onClick={() => setView("list")} 
          className={`flex-1 sm:flex-none ${view === "list" 
            ? "bg-primary hover:bg-primary/90" 
            : "bg-white text-primary hover:bg-slate-100"}`}>
          <List className="mr-2 h-4 w-4" />
          Ver Lista de Empleados
        </Button>
      </div>

      {view === "list" && (
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Filtrar por Departamento
                </label>
                <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los departamentos</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {view === "add" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Agregar Nuevo Empleado</CardTitle>
            <CardDescription>
              Ingresa los datos del nuevo empleado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="nombre">
                    Nombre
                  </label>
                  <Input 
                    id="nombre" 
                    name="nombre" 
                    value={newEmployee.nombre} 
                    onChange={handleInputChange} 
                    placeholder="Juan" 
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="apellido">
                    Apellido
                  </label>
                  <Input 
                    id="apellido" 
                    name="apellido" 
                    value={newEmployee.apellido} 
                    onChange={handleInputChange} 
                    placeholder="Pérez" 
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="dni">
                    DNI
                  </label>
                  <Input 
                    id="dni" 
                    name="dni" 
                    value={newEmployee.dni} 
                    onChange={handleInputChange} 
                    placeholder="12345678" 
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="correo">
                    Correo
                  </label>
                  <Input 
                    id="correo" 
                    name="correo" 
                    value={newEmployee.correo} 
                    onChange={handleInputChange} 
                    placeholder="juan.perez@ejemplo.com" 
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="departamento">
                    Departamento
                  </label>
                  <Input 
                    id="departamento" 
                    name="departamento" 
                    value={newEmployee.departamento} 
                    onChange={handleInputChange} 
                    placeholder="Ventas" 
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="sueldo">
                    Sueldo
                  </label>
                  <Input 
                    id="sueldo" 
                    name="sueldo" 
                    value={newEmployee.sueldo} 
                    onChange={handleInputChange} 
                    placeholder="30000" 
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="genero">
                    Género
                  </label>
                  <div className="flex items-center space-x-6">
                    <label htmlFor="male" className="flex items-center space-x-2">
                      <input
                        id="male"
                        type="radio"
                        name="genero"
                        value="Masculino"
                        checked={newEmployee.genero === "Masculino"}
                        onChange={handleInputChange}
                      />
                      <span>Masculino</span>
                    </label>
                    <label htmlFor="female" className="flex items-center space-x-2">
                      <input
                        id="female"
                        type="radio"
                        name="genero"
                        value="Femenino"
                        checked={newEmployee.genero === "Femenino"}
                        onChange={handleInputChange}
                      />
                      <span>Femenino</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="fechaNacimiento">
                    Fecha de Nacimiento
                  </label>
                  <Input 
                    id="fechaNacimiento" 
                    name="fechaNacimiento" 
                    type="date" 
                    value={newEmployee.fechaNacimiento} 
                    onChange={handleInputChange} 
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="w-full sm:w-auto">
                  Guardar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {view === "list" && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Sueldo</TableHead>
              <TableHead>Género</TableHead>
              <TableHead>Fecha de Nacimiento</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.nombre}</TableCell>
                <TableCell>{employee.apellido}</TableCell>
                <TableCell>{employee.dni}</TableCell>
                <TableCell>{employee.correo}</TableCell>
                <TableCell>{employee.departamento}</TableCell>
                <TableCell>${employee.sueldo}</TableCell>
                <TableCell>{employee.genero}</TableCell>
                <TableCell>
                  {employee.fechaNacimiento
                    ? format(new Date(employee.fechaNacimiento + 'T00:00:00'), "dd/MM/yyyy", { locale: es })
                    : "Fecha no disponible"}
                </TableCell>
                <TableCell>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
