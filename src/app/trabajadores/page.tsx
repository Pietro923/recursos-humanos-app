"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Juan Pérez",
      surname: "Pérez",
      dni: "12345678",
      email: "juan.perez@ejemplo.com",
      department: "Ventas",
      company: "empresa1",
      salary: 50000,
    },
    {
      id: 2,
      name: "María García",
      surname: "García",
      dni: "87654321",
      email: "maria.garcia@ejemplo.com",
      department: "Marketing",
      company: "empresa2",
      salary: 55000,
    },
    {
      id: 3,
      name: "Carlos Rodríguez",
      surname: "Rodríguez",
      dni: "11223344",
      email: "carlos.rodriguez@ejemplo.com",
      department: "Desarrollo",
      company: "empresa3",
      salary: 60000,
    },
  ]);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    surname: "",
    dni: "",
    email: "",
    department: "",
    company: "",
    salary: "",
  });

  const [view, setView] = useState("list"); // Estado para controlar la vista

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployees([...employees, { id: employees.length + 1, ...newEmployee }]);
    setNewEmployee({ name: "", surname: "", dni: "", email: "", department: "", company: "", salary: "" });
    setView("list"); // Regresar a la vista de lista después de agregar
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

      {view === "add" && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Agregar Nuevo Empleado</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="name">
                Nombre
              </label>
              <Input
                id="name"
                name="name"
                value={newEmployee.name}
                onChange={handleInputChange}
                placeholder="Nombre"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="surname">
                Apellido
              </label>
              <Input
                id="surname"
                name="surname"
                value={newEmployee.surname}
                onChange={handleInputChange}
                placeholder="Apellido"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="dni">
                DNI
              </label>
              <Input
                id="dni"
                name="dni"
                value={newEmployee.dni}
                onChange={handleInputChange}
                placeholder="DNI"
                required
                type="text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Correo
              </label>
              <Input
                id="email"
                name="email"
                value={newEmployee.email}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
                required
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="company">
                Empresa
              </label>
              <select
                id="company"
                name="company"
                value={newEmployee.company}
                onChange={handleInputChange}
                required
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="" disabled>
                  Selecciona una empresa
                </option>
                <option value="empresa1">Empresa 1</option>
                <option value="empresa2">Empresa 2</option>
                <option value="empresa3">Empresa 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="department">
                Departamento
              </label>
              <Input
                id="department"
                name="department"
                value={newEmployee.department}
                onChange={handleInputChange}
                placeholder="Departamento"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="salary">
                Sueldo
              </label>
              <Input
                id="salary"
                name="salary"
                value={newEmployee.salary}
                onChange={handleInputChange}
                placeholder="Sueldo"
                required
                type="number"
                min="0"
              />
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
                <TableHead>Empresa</TableHead>
                <TableHead>Sueldo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.surname}</TableCell>
                  <TableCell>{employee.dni}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.company}</TableCell>
                  <TableCell>{employee.salary}</TableCell>
                  <TableCell>
                    <Button className="mr-2" size="sm" variant="outline">
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive">
                      Eliminar
                    </Button>
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
