// /app/asistencia/page.jsx
"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/firebaseConfig" // Asegúrate de importar tu configuración de Firebase
import { collection, getDocs } from "firebase/firestore"
import { useTranslation } from "react-i18next"

// Definición de los tipos
interface Employee {
  id: string
  nombre: string
  apellido: string
  dni: number
  correo: string
  departamento: string
}

export default function Asistencia() {
  const [selectedCompany, setSelectedCompany] = useState("") // Empresa seleccionada
  const [companies] = useState(["Pueble SA - CASE IH", "KIA"]) // Lista de empresas
  const [employees, setEmployees] = useState<Employee[]>([]) // Lista de empleados filtrada por empresa
  const { t } = useTranslation();

  // Obtener empleados de la empresa seleccionada desde la base de datos
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedCompany) return

      try {
        const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados")
        const employeesSnapshot = await getDocs(employeesRef)
        const employeesData: Employee[] = employeesSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            nombre: data.nombre || "Nombre desconocido",
            apellido: data.apellido || "Apellido desconocido",
            dni: data.dni || 0,
            correo: data.correo || "Correo desconocido",
            departamento: data.departamento || "Departamento desconocido"
          }
        })
        setEmployees(employeesData)
      } catch (error) {
        console.error("Error fetching employees:", error)
      }
    }

    fetchEmployees()
  }, [selectedCompany])

  // Función para manejar el botón "Marcar Asistencia"
  const handleMarkAttendance = (employee: Employee) => {
    const currentTime = new Date().toLocaleTimeString()
    alert(`Empleado ${employee.id}, ${employee.nombre} registrado a las ${currentTime}`)
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 justify-center text-center dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-2xl">
        {t("asistencia.page_title")}
      </h1>

      {/* Selector de empresa */}
      <div className="mb-6 flex justify-center bg-white shadow-md rounded-lg p-6 max-w-60 ml-52 dark:bg-gray-950  dark:text-white ">
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-72 text-gray-700 dark:text-white">
            <SelectValue placeholder={t("asistencia.select_company_placeholder")} />
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

      {/* Tabla de asistencia */}
      <div className="overflow-hidden bg-white shadow-lg rounded-lg dark:bg-gray-950">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50 border-b dark:bg-gray-950 ">
              <TableCell className="font-semibold text-gray-600 text-center p-3 dark:text-white">
                {t("asistencia.table_headers.id")}
              </TableCell>
              <TableCell className="font-semibold text-gray-600 text-center p-3 dark:text-white">
                {t("asistencia.table_headers.name")}
              </TableCell>
              <TableCell className="font-semibold text-gray-600 text-center p-3 dark:text-white">
                {t("asistencia.table_headers.dni")}
              </TableCell>
              <TableCell className="font-semibold text-gray-600 text-center p-3 dark:text-white">
                {t("asistencia.table_headers.department")}
              </TableCell>
              <TableCell className="font-semibold text-gray-600 text-center p-3 dark:text-white">
                {t("asistencia.table_headers.attendance")}
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length > 0 ? (
              employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-gray-100 border-b dark:hover:bg-gray-800">
                  <TableCell className="text-center text-gray-700 p-3 dark:text-white">{employee.id}</TableCell>
                  <TableCell className="text-center text-gray-700 p-3 dark:text-white">
                    {employee.nombre} {employee.apellido}
                  </TableCell>
                  <TableCell className="text-center text-gray-700 p-3 dark:text-white">{employee.dni}</TableCell>
                  <TableCell className="text-center text-gray-700 p-3 dark:text-white">{employee.departamento}</TableCell>
                  <TableCell className="text-center p-3">
                    <Button
                      className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-800 dark:hover:bg-blue-900 "
                      onClick={() => handleMarkAttendance(employee)}
                    >
                      {t("asistencia.mark_attendance_button")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : selectedCompany ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 p-4">
                  {t("asistencia.no_employees_in_company")}
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 p-4">
                  {t("asistencia.select_company_message")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
