"use client"


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

export default function PerformancePage() {
  const employees = [
    { id: 1, name: "Juan Pérez", department: "Ventas", performance: 85 },
    { id: 2, name: "María García", department: "Marketing", performance: 92 },
    { id: 3, name: "Carlos Rodríguez", department: "Desarrollo", performance: 78 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Evaluación de Desempeño</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Desempeño Trimestral</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Puntuación</TableHead>
              <TableHead>Progreso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.performance}%</TableCell>
                <TableCell>
                  <Progress value={employee.performance} className="w-[60%]" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}