"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebaseConfig"; // Asegúrate de importar tu configuración de Firebase
import { collection, doc, getDocs, getDoc, updateDoc, setDoc, addDoc } from "firebase/firestore";

// Definición de los tipos
interface Employee {
  id: string;
  nombre: string;
  apellido: string;
  dni: number;
  correo: string;
  departamento: string;
  sueldo: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    correo: "",
    departamento: "",
    sueldo: "",
  });
  const [selectedCompany, setSelectedCompany] = useState("");
  const [view, setView] = useState("list");

  const companies = ["Pueble SA - CASE IH", "KIA"]; // Opciones de empresas

  // Obtener los empleados de Firebase
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedCompany) return;

      try {
        const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados");
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesData = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre || "",
          apellido: doc.data().apellido || "",
          dni: doc.data().dni || 0,
          correo: doc.data().correo || "",
          departamento: doc.data().departamento || "",
          sueldo: doc.data().sueldo || 0,
        }));
        setEmployees(employeesData as Employee[]);
      } catch (error) {
        console.error("Error al obtener los empleados:", error);
      }
    };

    fetchEmployees();
  }, [selectedCompany]);

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
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

  // Función de envío de nuevo empleado
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Obtener el nuevo ID de empleado
    const newEmployeeId = await getNewEmployeeId();

    const newEmployeeData = {
      ...newEmployee,
      dni: parseInt(newEmployee.dni, 10) || 0,
      sueldo: parseFloat(newEmployee.sueldo) || 0,
    };

    try {
      await setDoc(doc(collection(db, "Grupo_Pueble", selectedCompany, "empleados"), newEmployeeId), newEmployeeData);
      
      // Actualizar la lista local de empleados
      setEmployees([
        ...employees,
        { id: newEmployeeId, ...newEmployeeData }
      ]);

      // Restablecer el formulario
      setNewEmployee({ nombre: "", apellido: "", dni: "", correo: "", departamento: "", sueldo: "" });
      setView("list");
    } catch (error) {
      console.error("Error al agregar el empleado:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Empleados</h1>

      <div className="flex space-x-4 mb-6">
        <Button onClick={() => setView("add")} className={view === "add" ? "solid" : "outline"}>
          Agregar Nuevo Empleado
        </Button>
        <Button onClick={() => setView("list")} className={view === "list" ? "solid" : "outline"}>
          Ver Lista de Empleados
        </Button>
      </div>

      {/* Selector de empresa estilizado */}
      <div className="bg-white shadow-md rounded-lg p-6 max-w-60">
        <label htmlFor="company-selector" className="block text-sm font-medium text-gray-700">
          Seleccionar Empresa
        </label>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-[200px] mt-2">
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

      {view === "add" && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Agregar Nuevo Empleado</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos de formulario */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="nombre">Nombre</label>
              <Input id="nombre" name="nombre" value={newEmployee.nombre} onChange={handleInputChange} placeholder="Nombre" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="apellido">Apellido</label>
              <Input id="apellido" name="apellido" value={newEmployee.apellido} onChange={handleInputChange} placeholder="Apellido" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="dni">DNI</label>
              <Input id="dni" name="dni" value={newEmployee.dni} onChange={handleInputChange} placeholder="DNI" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="correo">Correo</label>
              <Input id="correo" name="correo" value={newEmployee.correo} onChange={handleInputChange} placeholder="Correo" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="departamento">Departamento</label>
              <Input id="departamento" name="departamento" value={newEmployee.departamento} onChange={handleInputChange} placeholder="Departamento" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="sueldo">Sueldo</label>
              <Input id="sueldo" name="sueldo" value={newEmployee.sueldo} onChange={handleInputChange} placeholder="Sueldo" required />
            </div>
            <Button type="submit">Agregar Empleado</Button>
          </form>
        </div>
      )}

      {view === "list" && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Empleados</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.nombre}</TableCell>
                  <TableCell>{employee.apellido}</TableCell>
                  <TableCell>{employee.dni}</TableCell>
                  <TableCell>{employee.correo}</TableCell>
                  <TableCell>{employee.departamento}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive">Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
