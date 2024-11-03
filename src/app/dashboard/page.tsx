"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState("Todas");
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPayrollExpense, setTotalPayrollExpense] = useState(0);
  const companies = ["Todas", "Pueble SA - CASE IH", "KIA"]; // Empresas disponibles

  // Obtener datos de empleados y sueldos
  useEffect(() => {
    const fetchData = async () => {
      let employeeCount = 0;
      let payrollExpense = 0;

      try {
        if (selectedCompany === "Todas") {
          // Obtener datos de todas las empresas
          for (const company of companies.slice(1)) { // Ignora "Todas"
            const employeesSnapshot = await getDocs(
              collection(db, "Grupo_Pueble", company, "empleados")
            );
            employeeCount += employeesSnapshot.size;
            payrollExpense += employeesSnapshot.docs.reduce(
              (sum, doc) => sum + (doc.data().sueldo || 0),
              0
            );
          }
        } else {
          // Obtener datos de la empresa seleccionada
          const employeesSnapshot = await getDocs(
            collection(db, "Grupo_Pueble", selectedCompany, "empleados")
          );
          employeeCount = employeesSnapshot.size;
          payrollExpense = employeesSnapshot.docs.reduce(
            (sum, doc) => sum + (doc.data().sueldo || 0),
            0
          );
        }

        setTotalEmployees(employeeCount);
        setTotalPayrollExpense(payrollExpense);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [selectedCompany]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="bg-white shadow-md rounded-lg p-4 w-64">
        <label className="block text-sm font-medium text-gray-700">
          Seleccionar Empresa
        </label>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-full mt-2">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto en Nómina</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayrollExpense.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de Formación</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
