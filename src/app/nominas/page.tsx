"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Save, Calculator } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Employee {
  id: string;
  nombre: string;
  apellido: string;
  dni: number;
  correo: string;
  departamento: string;
  sueldo: number;
  incentivo: number;
  
  // New fields for dialog input
  incentivoPromedio?: number;
  totalBasicoIncentivo?: number;
  totalFinal?: number;
  bono?: number;
}

export default function PayrollPage() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("todos");
  const [employees, setEmployees] = useState<Employee[]>([]); // Lista de empleados con tipo Employee
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]); // Empresas dinámicas
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(); // Hook de traducción
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [incentivoPromedio, setIncentivoPromedio] = useState<string>("0");
  const [bono, setBono] = useState<string>("0");
  
  

  // Obtener el mes y año actual para el registro de inasistencias
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const periodId = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Obtén referencia a la colección "Grupo_Pueble"
        const collectionRef = collection(db, "Grupo_Pueble");
        
        // Obtén los documentos dentro de la colección
        const snapshot = await getDocs(collectionRef);
        
        // Extrae los nombres de los documentos
        const companyNames = snapshot.docs.map(doc => doc.id);
        
        // Agrega "Todas" al inicio de la lista
        setCompanies([...companyNames]);
      } catch (error) {
        console.error("Error al obtener las compañías:", error);
      }
    };
  
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      console.log("Fetching employees for company:", selectedCompany);
      const fetchEmployeesAndAbsences = async () => {
        try {
          setIsLoading(true);
          // Obtener empleados
          const employeesSnapshot = await getDocs(collection(db, "Grupo_Pueble", selectedCompany, "empleados"));
          const employeeData: Employee[] = employeesSnapshot.docs
          .filter(doc => doc.data().estado === "activo") // Filter for active employees
          .map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as Employee[];
          setEmployees(employeeData);
          
          
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
          toast.error(t('nominas.toast.error'));
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

  const formatCurrency = (amount: number | undefined | null) => {
  if (amount == null) return "$ 0";
  return `$ ${Math.floor(amount).toLocaleString('es-AR')}`;
};


const calculateDialogValues = (employee: Employee) => {
  const totalBasicoIncentivo = employee.sueldo + parseFloat(incentivoPromedio);
  const totalFinal = totalBasicoIncentivo + parseFloat(bono);

  return {
    incentivoPromedio: parseFloat(incentivoPromedio),
    totalBasicoIncentivo,
    bono: parseFloat(bono),
    totalFinal
  };
};

const saveDialogData = async () => {
  if (!selectedCompany || !selectedEmployee) return;
    
  try {
    setIsLoading(true);
      
      // Calculate additional values
      const additionalData = calculateDialogValues(selectedEmployee);
      
      // Update the specific employee document
      const employeeDocRef = doc(db, "Grupo_Pueble", selectedCompany, "empleados", selectedEmployee.id);
    
    await updateDoc(employeeDocRef, additionalData);
      
      // Refresh employees to reflect new data
      const employeesSnapshot = await getDocs(collection(db, "Grupo_Pueble", selectedCompany, "empleados"));
      const updatedEmployeeData: Employee[] = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[];
      setEmployees(updatedEmployeeData);
      
      toast.success(t('nominas.toast.success'));
      
       // Reseteamos solo el input de incentivo promedio
      setIncentivoPromedio("");
    setBono("");
    setSelectedEmployee(null);
  } catch (error) {
    console.error("Error saving dialog data:", error);
    toast.error(t('nominas.toast.errorasistencia'));
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="max-w-screen-2xl container mx-auto py-8 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 mb-8"
      >
        <Users className="h-10 w-10 text-primary-500 transform transition-transform hover:scale-110" />
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight dark:text-white">
          {t('nominas.header.title')}
        </h1>
      </motion.div>
  
      <Card className="max-w-screen-2xl border-none shadow-2xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 dark:from-gray-800 dark:to-gray-900">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary-500" />
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                  {t('nominas.header.sectionTitle')} {periodId}
                </CardTitle>
              </div>
      
              <div className="flex items-center gap-4">
                <Select value={selectedCompany || ""} onValueChange={setSelectedCompany}>
                    <SelectValue placeholder={t('nominas.header.selectCompany')} />
                    <SelectTrigger className="w-[250px] bg-white dark:bg-blue-800 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all duration-300">
            <SelectValue 
              placeholder={t('pagedashboard.selectCompanyPlaceholder')} 
              className="text-blue-600 dark:text-blue-200"
            />
          </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    {companies.map((company) => (
                      <SelectItem 
                        key={company} 
                        value={company}
                        className="hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog>
      <DialogTrigger asChild>
        <Button 
          disabled={isLoading || !selectedCompany}
          className="flex items-center gap-2 dark:bg-gray-950 dark:text-white hover:bg-primary-100 dark:hover:bg-gray-800 transition-colors group"
        >
          <Calculator className="h-5 w-5 dark:text-white group-hover:rotate-6 transition-transform" />
          {t('nominas.dialog.button1')}
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white dark:bg-gray-950 dark:text-white">
        <DialogHeader>
          <DialogTitle>{t('nominas.dialog.title')}</DialogTitle>
          <DialogDescription>
          {t('nominas.dialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
                {/* Selección de empleado */}
                <div className="space-y-2">
            <Label htmlFor="employee">{t('recordatorios.card.label2')}</Label>
            <Select 
              value={selectedEmployee?.id || ""} 
              onValueChange={(id) => {
                const employee = employees.find(emp => emp.id === id);
                setSelectedEmployee(employee || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('recordatorios.card.label2PlaceHolder')} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.nombre} {emp.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

                  {/* Input fields for dialog */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Incentivo Promedio" className="text-right">
            {t('nominas.dialog.incentivoprom')}
            </Label>
            <Input
              id="Incentivo Promedio"
              value={incentivoPromedio}
              onChange={(e) => setIncentivoPromedio(e.target.value)}
              className="col-span-3 border-black dark:border-white"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Bono" className="text-right">
            {t('nominas.dialog.bono')}
            </Label>
            <Input
              id="Bono"
              value={bono}
              onChange={(e) => setBono(e.target.value)}
              className="col-span-3 border-black dark:border-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={saveDialogData}
            disabled={!selectedEmployee}
            className="dark:bg-gray-800 dark:text-white hover:bg-primary-100 dark:hover:bg-gray-700"
          >
            <Save className="h-5 w-5 dark:text-white group-hover:rotate-6 transition-transform" />
            {t('nominas.dialog.button2')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

              </div>
            </div>
  
            {selectedCompany && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-end"
              >

                
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[250px] bg-white dark:bg-blue-800 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all duration-300">
                    <SelectValue placeholder={t('nominas.header.filterDepartment')} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    <SelectItem 
                      value="todos" 
                      className="hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {t('nominas.header.deptos')}
                    </SelectItem>
                    {departments.map((dept) => (
                      <SelectItem 
                        key={dept} 
                        value={dept}
                        className="hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </div>
        </CardHeader>
    
        <CardContent className="p-0">
          <div className="rounded-b-xl overflow-hidden bg-white shadow-sm dark:bg-gray-950 dark:text-white">
            <div className="overflow-x-auto">
              <Table className="min-w-full table-auto">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30 text-sm dark:bg-gray-800">
                  {[
                    'name', 'surname', 'department', 
                    'basicSalary', 'averageIncentive', // Eliminamos 'monthlyIncentive'
                    'totalBasicIncentive', 
                    'bonus', 'finalTotal'
                  ].map((col) => (
                    <TableHead 
                      key={col} 
                      className="font-bold text-center dark:text-white hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t(`nominas.columns.${col}`)}
                    </TableHead>
                  ))}
                  </TableRow>
                </TableHeader>
    
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={13}
                        className="text-center py-8 text-muted-foreground italic dark:text-white"
                      >
                        {selectedCompany ? t('nominas.header.noEmployees') : t('nominas.header.selectCompanyMessage')}
                      </TableCell>
                    </TableRow>
                  ):(
                      filteredEmployees.map((employee) => {
                        console.log(employee); // Verifica los valores de incentivoMensual y bono
                        const totalBasicoIncentivo = employee.totalBasicoIncentivo || 
                        (employee.sueldo + (employee.incentivoPromedio || 0));
                      const totalFinal = employee.totalFinal || 
                        (totalBasicoIncentivo + (employee.bono || 0));
                      
                      return (
                        <TableRow 
                          key={employee.id} 
                          className="hover:bg-primary-50/30 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <TableCell className="text-center">{employee.nombre}</TableCell>
                          <TableCell className="text-center">{employee.apellido}</TableCell>
                          <TableCell className="text-center">{employee.departamento}</TableCell>
                          <TableCell className="text-right font-medium text-gray-700 dark:text-gray-300">
                            {formatCurrency(employee.sueldo)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-700 dark:text-gray-300">
                            {formatCurrency(employee.incentivoPromedio || employee.incentivo)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-blue-700 dark:text-blue-500">
                            {formatCurrency(totalBasicoIncentivo)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-700 dark:text-gray-300">
                            {formatCurrency(employee.bono)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-700 dark:text-green-500">
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