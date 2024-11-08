"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

export default function PerformancePage() {
  const [selectedQuarter, setSelectedQuarter] = useState("1")
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
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar trimestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Q1</SelectItem>
              <SelectItem value="2">Q2</SelectItem>
              <SelectItem value="3">Q3</SelectItem>
              <SelectItem value="4">Q4</SelectItem>
            </SelectContent>
          </Select>
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