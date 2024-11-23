// app/nominas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2 } from "lucide-react"; // Importamos List además de los íconos ya presentes


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

export default function PayrollPage() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies] = useState<string[]>(["Pueble SA - CASE IH", "KIA"]);

  useEffect(() => {
    if (selectedCompany) {
      console.log("Fetching employees for company:", selectedCompany);
      const fetchEmployees = async () => {
        try {
          const employeesSnapshot = await getDocs(collection(db, "Grupo_Pueble", selectedCompany, "empleados"));
          console.log("Employees snapshot:", employeesSnapshot);
          const employeeData: Employee[] = employeesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as Employee[];
          console.log("Parsed employee data:", employeeData);
          setEmployees(employeeData);
        } catch (error) {
          console.error("Error fetching employees:", error);
        }
      };
  
      fetchEmployees();
    }
  }, [selectedCompany]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Encabezado de la sección */}
      <div className="flex items-center gap-2 mb-8">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Gestión de Nóminas</h1>
      </div>
  
      {/* Tarjeta para la nómina */}
      <Card className="border-none shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-muted/50">
          <div className="flex justify-between items-center">
            {/* Sección de título */}
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-semibold text-gray-700">Nómina Mensual</CardTitle>
            </div>
  
            {/* Selector de empresa */}
            <Select value={selectedCompany || ""} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[250px] bg-white rounded-md shadow-sm">
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
        </CardHeader>
  
        {/* Contenido de la tarjeta con la tabla */}
        <CardContent className="p-6">
          <div className="rounded-b-lg overflow-hidden bg-white shadow-sm">
            <Table className="min-w-full table-auto">
              {/* Encabezado de la tabla */}
              <TableHeader>
                <TableRow className="bg-muted/50 text-sm text-gray-700">
                  <TableHead className="font-semibold">Nombre</TableHead>
                  <TableHead className="font-semibold">Apellido</TableHead>
                  <TableHead className="font-semibold">DNI</TableHead>
                  <TableHead className="font-semibold">Correo</TableHead>
                  <TableHead className="font-semibold">Departamento</TableHead>
                  <TableHead className="font-semibold text-right">Sueldo</TableHead>
                </TableRow>
              </TableHeader>
  
              {/* Cuerpo de la tabla */}
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground italic"
                    >
                      Seleccione una empresa para ver los datos de nómina
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-muted/50">
                      <TableCell>{employee.nombre}</TableCell>
                      <TableCell>{employee.apellido}</TableCell>
                      <TableCell className="font-mono">{employee.dni}</TableCell>
                      <TableCell>{employee.correo}</TableCell>
                      <TableCell>{employee.departamento}</TableCell>
                      <TableCell className="text-right font-medium text-green-700">
                      $ {Math.floor(employee.sueldo)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
