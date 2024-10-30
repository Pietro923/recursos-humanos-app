// /app/asistencia/page.jsx
"use client"

import { Button } from "@/components/ui/button"
import { Table } from "@/components/ui/table"
import { useState } from "react"

const sampleData = [
  { id: 1, name: "Juan Pérez", date: "2024-10-30", status: "Presente" },
  { id: 2, name: "Ana Gómez", date: "2024-10-30", status: "Ausente" },
  { id: 3, name: "Luis Martínez", date: "2024-10-30", status: "Presente" },
  // Agrega más datos de ejemplo aquí
]

export default function Asistencia() {
  const [data, setData] = useState(sampleData)

  const handleAddAttendance = () => {
    // Lógica para agregar asistencia (puedes implementar un modal o formulario)
    alert("Agregar asistencia no implementado")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registro de Asistencia</h1>
      <Button onClick={handleAddAttendance} className="mb-4">
        Agregar Asistencia
      </Button>
      <Table>
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Fecha</th>
            <th className="px-4 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{item.date}</td>
              <td className="px-4 py-2">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
