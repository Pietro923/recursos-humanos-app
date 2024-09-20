"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TrainingPage() {
  const [courses, setCourses] = useState([
    { id: 1, name: "Liderazgo Efectivo", department: "Todos", duration: "2 semanas", status: "En progreso" },
    { id: 2, name: "Desarrollo Web Avanzado", department: "IT", duration: "4 semanas", status: "Próximamente" },
    { id: 3, name: "Técnicas de Ventas", department: "Ventas", duration: "1 semana", status: "Completado" },
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Programas de Formación</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Cursos Disponibles</h2>
          <Button>Agregar Nuevo Curso</Button>
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
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.department}</TableCell>
                <TableCell>{course.duration}</TableCell>
                <TableCell>
                  <Badge
                  
                  className={
                    course.status === "Completado"
                      ? "bg-green-500 text-white"
                      : course.status === "En progreso"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-500 text-white"
                  }
                  >
                    {course.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
