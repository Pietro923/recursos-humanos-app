"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Save } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: string;
  nombre: string;
  apellido: string;
  dni: number;
  correo: string;
  departamento: string;
  sueldo: number;
  sueldoBasico: number;
  incentivo: number;
  incentivoMensual: number;
  bono: number;
}

interface AbsenceRecord {
  nombre: string;
  apellido: string;
  employeeId: string;
  dias: number;
}

interface AbsenceMap {
  [key: string]: AbsenceRecord;
}

export default function PayrollPage() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("todos");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [companies] = useState<string[]>(["Pueble SA - CASE IH", "KIA"]);
  const [absences, setAbsences] = useState<AbsenceMap>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtener el mes y año actual para el registro de inasistencias
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const periodId = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

  useEffect(() => {
    if (selectedCompany) {
      console.log("Fetching employees for company:", selectedCompany);
      const fetchEmployeesAndAbsences = async () => {
        try {
          setIsLoading(true);
          // Obtener empleados
          const employeesSnapshot = await getDocs(collection(db, "Grupo_Pueble", selectedCompany, "empleados"));
          const employeeData: Employee[] = employeesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as Employee[];
          setEmployees(employeeData);
          
          // Obtener inasistencias del período actual
          const absencesDoc = doc(db, "Grupo_Pueble", selectedCompany, "inasistencias", periodId);
          const absencesSnapshot = await getDoc(absencesDoc);
          if (absencesSnapshot.exists()) {
            setAbsences(absencesSnapshot.data() as AbsenceMap);
          } else {
            // Inicializar con registros vacíos para todos los empleados
            const initialAbsences: AbsenceMap = {};
            employeeData.forEach(emp => {
              initialAbsences[emp.id] = {
                nombre: emp.nombre,
                apellido: emp.apellido,
                employeeId: emp.id,
                dias: 0
              };
            });
            setAbsences(initialAbsences);
          }
          
          const departmentMap: { [key: string]: boolean } = {};
          employeeData.forEach(emp => {
            if (emp.departamento) {
              departmentMap[emp.departamento] = true;
            }
          });
          const uniqueDepartments = Object.keys(departmentMap).sort();
          setDepartments(uniqueDepartments);
          
          setSelectedDepartment("todos");
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Error al cargar los datos");
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchEmployeesAndAbsences();
    }
  }, [selectedCompany, periodId]);

  useEffect(() => {
    if (selectedDepartment === "todos") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp => emp.departamento === selectedDepartment);
      setFilteredEmployees(filtered);
    }
  }, [selectedDepartment, employees]);

  const formatCurrency = (amount: number) => {
    return `$ ${Math.floor(amount).toLocaleString('es-AR')}`;
  };

  const handleAbsenceChange = (employee: Employee, value: string) => {
    const dias = parseInt(value) || 0;
    setAbsences(prev => ({
      ...prev,
      [employee.id]: {
        nombre: employee.nombre,
        apellido: employee.apellido,
        employeeId: employee.id,
        dias: dias
      }
    }));
  };

  const calcularDescuentoPorInasistencias = (sueldoBasico: number, diasInasistencia: number) => {
    const valorDiario = sueldoBasico / 30; // Asumiendo mes de 30 días
    return valorDiario * diasInasistencia;
  };

  const saveAbsences = async () => {
    if (!selectedCompany) return;
    
    try {
      setIsLoading(true);
      
      // Filtrar solo los registros con días > 0 para guardar
      const absencesToSave: AbsenceMap = {};
      Object.values(absences).forEach(record => {
        if (record.dias > 0) {
          absencesToSave[record.employeeId] = record;
        }
      });

      // Guardar las inasistencias en un documento con el ID del período
      await setDoc(
        doc(db, "Grupo_Pueble", selectedCompany, "inasistencias", periodId),
        absencesToSave
      );
      toast.success("Inasistencias guardadas correctamente");
    } catch (error) {
      console.error("Error saving absences:", error);
      toast.error("Error al guardar las inasistencias");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-8">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Gestión de Nóminas</h1>
      </div>
  
      <Card className="border-none shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Nómina Mensual - Período {periodId}
                </CardTitle>
              </div>
    
              <div className="flex items-center gap-4">
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

                <Button 
                  onClick={saveAbsences} 
                  disabled={isLoading || !selectedCompany}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Guardar Inasistencias
                </Button>
              </div>
            </div>

            {selectedCompany && (
              <div className="flex justify-end">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[250px] bg-white rounded-md shadow-sm">
                    <SelectValue placeholder="Filtrar por departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los departamentos</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
  
        <CardContent className="p-6">
          <div className="rounded-b-lg overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table className="min-w-full table-auto">
                <TableHeader>
                  <TableRow className="bg-muted/50 text-sm text-gray-700">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Apellido</TableHead>
                    <TableHead className="font-semibold">DNI</TableHead>
                    <TableHead className="font-semibold">Correo</TableHead>
                    <TableHead className="font-semibold">Departamento</TableHead>
                    <TableHead className="font-semibold text-right">Sueldo Básico</TableHead>
                    <TableHead className="font-semibold text-right">Incentivo Promedio</TableHead>
                    <TableHead className="font-semibold text-right">Incentivo Mensual</TableHead>
                    <TableHead className="font-semibold text-center">Días Inasistencia</TableHead>
                    <TableHead className="font-semibold text-right">Descuento Inasistencias</TableHead>
                    <TableHead className="font-semibold text-right">Total Básico + Incentivo</TableHead>
                    <TableHead className="font-semibold text-right">Bono</TableHead>
                    <TableHead className="font-semibold text-right">Total Final</TableHead>
                  </TableRow>
                </TableHeader>
  
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={13}
                        className="text-center py-8 text-muted-foreground italic"
                      >
                        {selectedCompany ? "No hay empleados para mostrar" : "Seleccione una empresa para ver los datos de nómina"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => {
                      const absenceRecord = absences[employee.id];
                      const diasInasistencia = absenceRecord?.dias || 0;
                      const descuentoInasistencias = calcularDescuentoPorInasistencias(
                        employee.sueldoBasico, 
                        diasInasistencia
                      );
                      const totalBasicoIncentivo = employee.sueldoBasico + employee.incentivoMensual - descuentoInasistencias;
                      const totalFinal = totalBasicoIncentivo + employee.bono;
                      
                      return (
                        <TableRow key={employee.id} className="hover:bg-muted/50">
                          <TableCell>{employee.nombre}</TableCell>
                          <TableCell>{employee.apellido}</TableCell>
                          <TableCell className="font-mono">{employee.dni}</TableCell>
                          <TableCell>{employee.correo}</TableCell>
                          <TableCell>{employee.departamento}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(employee.sueldo)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(employee.incentivo)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(employee.incentivoMensual)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min="0"
                              max="31"
                              value={diasInasistencia || ""}
                              onChange={(e) => handleAbsenceChange(employee, e.target.value)}
                              className="w-20 text-center mx-auto text-red-600"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            {formatCurrency(descuentoInasistencias)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-blue-700">
                            {formatCurrency(totalBasicoIncentivo)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(employee.bono)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-700">
                            {formatCurrency(totalFinal)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}