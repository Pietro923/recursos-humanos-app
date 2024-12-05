// /app/asistencia/page.jsx
"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/firebaseConfig" // Asegúrate de importar tu configuración de Firebase
import { collection, getDocs } from "firebase/firestore"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card";
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
        const employeesData: Employee[] = employeesSnapshot.docs
          .filter(doc => doc.data().estado === "activo") // Only fetch active employees
          .map(doc => {
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
      <div className="mb-6 flex justify-center p-6 ">
      <Card className="w-full sm:w-72 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
      <CardContent className="pt-4 space-y-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 rounded-lg shadow-lg">
        <label className="block text-md font-semibold text-blue-700 dark:text-blue-300 mb-2 transition-colors">
          {t('pagedashboard.selectCompanyLabel')}
        </label>
        <Select 
          value={selectedCompany} 
          onValueChange={setSelectedCompany}
        >
          <SelectTrigger className="w-full bg-white dark:bg-blue-800 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all duration-300">
            <SelectValue 
              placeholder={t('pagedashboard.selectCompanyPlaceholder')} 
              className="text-blue-600 dark:text-blue-200"
            />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-blue-900 border-blue-200 dark:border-blue-700 shadow-xl">
            {companies.map((company) => (
              <SelectItem 
                key={company} 
                value={company} 
                className="hover:bg-blue-100 dark:hover:bg-blue-800 focus:bg-blue-200 dark:focus:bg-blue-700 transition-colors"
              >
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
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
