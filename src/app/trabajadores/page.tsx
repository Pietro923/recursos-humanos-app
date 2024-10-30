"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([
    { id: 1, name: "Juan Pérez", email: "juan.perez@ejemplo.com", department: "Ventas" },
    { id: 2, name: "María García", email: "maria.garcia@ejemplo.com", department: "Marketing" },
    { id: 3, name: "Carlos Rodríguez", email: "carlos.rodriguez@ejemplo.com", department: "Desarrollo" },
  ])

  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", department: "" })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmployees([...employees, { id: employees.length + 1, ...newEmployee }])
    setNewEmployee({ name: "", email: "", department: "" })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
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
              placeholder="Nombre completo"
              required
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
          <Button type="submit">Agregar Empleado</Button>
        </form>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Lista de Empleados</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.department}</TableCell>
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
    </div>
  )
}