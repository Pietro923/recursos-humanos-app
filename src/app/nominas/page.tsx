// app/nominas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";


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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Nóminas</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nómina Mensual</h2>

          {/* Select para elegir la empresa */}
          <Select value={selectedCompany || ""} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar empresa" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company} value={company}>{company}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de nóminas */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Sueldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Seleccione una empresa para ver los datos de nómina
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.nombre}</TableCell>
                  <TableCell>{employee.apellido}</TableCell>
                  <TableCell>{employee.dni}</TableCell>
                  <TableCell>{employee.correo}</TableCell>
                  <TableCell>{employee.departamento}</TableCell>
                  <TableCell>$ {employee.sueldo.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
