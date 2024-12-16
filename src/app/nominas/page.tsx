"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
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
  subdepartamento: string;
  puesto: string;
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
  const [subdepartments, setSubdepartments] = useState<string[]>([]);
  const [selectedSubdepartment, setSelectedSubdepartment] = useState("");
  const [companies, setCompanies] = useState<string[]>([]); // Empresas dinámicas
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(); // Hook de traducción
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [incentivoPromedio, setIncentivoPromedio] = useState<string>("0");
  const [bono, setBono] = useState<string>("0");
  
  // New state for group increases
  const [departamentoIncrease, setDepartamentoIncrease] = useState<string>("0");
  const [subdepartamentoIncrease, setSubdepartamentoIncrease] = useState<string>("0");
  const [globalIncrease, setGlobalIncrease] = useState<string>("0");
  

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

  // New method to fetch departments when a company is selected
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!selectedCompany) return;

      try {
        const departmentsRef = collection(db, "Grupo_Pueble", selectedCompany, "Departamentos");
        const snapshot = await getDocs(departmentsRef);
        const departmentNames = snapshot.docs.map(doc => doc.id);
        setDepartments(departmentNames);
      } catch (error) {
        console.error("Error al obtener los departamentos:", error);
      }
    };

    fetchDepartments();
  }, [selectedCompany]);

  // New method to fetch subdepartments when a department is selected
  useEffect(() => {
    const fetchSubdepartments = async () => {
      if (!selectedCompany || !selectedDepartment) return;

      try {
        const subdepartmentsRef = collection(
          db, 
          "Grupo_Pueble", 
          selectedCompany, 
          "Departamentos", 
          selectedDepartment, 
          "SubDepartamento"
        );
        const snapshot = await getDocs(subdepartmentsRef);
        const subdepartmentNames = snapshot.docs.map(doc => doc.id);
        setSubdepartments(subdepartmentNames);
      } catch (error) {
        console.error("Error al obtener los subdepartamentos:", error);
      }
    };

    fetchSubdepartments();
  }, [selectedCompany, selectedDepartment]);

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

const saveGlobalAndGroupData = async () => {
  if (!selectedCompany) return;

  try {
    setIsLoading(true);
    const batch = writeBatch(db);
    const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados");
    
    const employeesSnapshot = await getDocs(employeesRef);
    
    employeesSnapshot.docs.forEach((document) => {
      const employee = { id: document.id, ...document.data() } as Employee;
      
      // Funciones de seguridad para parsear valores
      const safeParseFloat = (value: string | undefined, fallback: number = 0): number => {
        return value && value !== "0" ? parseFloat(value) : fallback;
      };

      // Inicializar valores seguros
      let newSalary = employee.sueldo;
      let newIncentivo = employee.incentivo || 0;
      let newBono = employee.bono || 0;

      // Global salary increase for all employees
      const globalIncreaseValue = safeParseFloat(globalIncrease);
      if (globalIncreaseValue > 0) {
        newSalary *= (1 + globalIncreaseValue / 100);
      }

      // Department-wide increase
      const departamentoIncreaseValue = safeParseFloat(departamentoIncrease);
      if (departamentoIncreaseValue > 0 && 
          (selectedDepartment === "todos" || employee.departamento === selectedDepartment)) {
        newSalary *= (1 + departamentoIncreaseValue / 100);
        newIncentivo *= (1 + departamentoIncreaseValue / 100);
      }


      // Subdepartment-wide increase
      const subdepartamentoIncreaseValue = safeParseFloat(subdepartamentoIncrease);
      if (subdepartamentoIncreaseValue > 0 && 
          (selectedSubdepartment === "" || employee.subdepartamento === selectedSubdepartment)) {
        newSalary *= (1 + subdepartamentoIncreaseValue / 100);
        newIncentivo *= (1 + subdepartamentoIncreaseValue / 100);
      }

      // Individual incentive and bonus - ONLY for the selected employee
      if (selectedEmployee && employee.id === selectedEmployee.id) {
        const incentivoValue = safeParseFloat(incentivoPromedio);
        const bonoValue = safeParseFloat(bono);

        // Si hay un valor específico, reemplazar completamente
        if (incentivoValue > 0) {
          newIncentivo = incentivoValue;
        }

        if (bonoValue > 0) {
          newBono = bonoValue;
        }
      }

      const employeeDocRef = doc(db, "Grupo_Pueble", selectedCompany, "empleados", employee.id);
      batch.update(employeeDocRef, {
        sueldo: Math.round(newSalary * 100) / 100, // Redondear a 2 decimales
        incentivo: Math.round(newIncentivo * 100) / 100,
        bono: Math.round(newBono * 100) / 100
      });
    });

    await batch.commit();

    // Refresh employees after update
    const updatedSnapshot = await getDocs(employeesRef);
    const updatedEmployeeData: Employee[] = updatedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Employee[];
    setEmployees(updatedEmployeeData);

    toast.success(t('nominas.toast.success'));
    
    // Reset inputs
    setGlobalIncrease("0");
    setDepartamentoIncrease("0");
    setSubdepartamentoIncrease("0");
    setIncentivoPromedio("0");
    setBono("0");
    setSelectedEmployee(null);

  } catch (error) {
    console.error("Error updating salaries:", error);
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
  
      <Card className="w-full max-w-screen-2xl border-none shadow-2xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
  <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6">
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            {t('nominas.header.sectionTitle')} {periodId}
          </CardTitle>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Select 
            value={selectedCompany || ""} 
            onValueChange={setSelectedCompany}
          >
            <SelectTrigger 
              className="w-full sm:w-[250px] bg-white dark:bg-blue-800 
              border-2 border-blue-300 dark:border-blue-600 
              hover:border-blue-500 focus:ring-2 focus:ring-blue-400 
              transition-all duration-300"
            >
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
  className="w-full sm:w-auto 
    bg-gradient-to-r from-blue-500 to-purple-600 
    text-white hover:from-blue-600 hover:to-purple-700 
    transition-all duration-300 
    flex items-center justify-center gap-2 
    group shadow-md hover:shadow-lg 
    text-xs sm:text-sm 
    px-3 sm:px-4 py-2
    truncate"
>
  <Calculator className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:animate-pulse flex-shrink-0" />
  <span className="truncate max-w-full">{t('nominas.dialog.button1')}</span>
</Button>
      </DialogTrigger>

      <DialogContent className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-none  w-full  max-w-3xl mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white text-center sm:text-left">
            {t('nominas.dialog.title')}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 text-center sm:text-left">
            {t('nominas.dialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Global Increase Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-white text-center sm:text-left">
              {t('nominas.dialog.globalGroup')}
            </h3>
            <div className="flex flex-col sm:grid sm:grid-cols-4 gap-4 items-center">
              <Label className="text-gray-600 dark:text-gray-300 text-center sm:text-right">
              {t('nominas.dialog.globalGroupDescription')}
              </Label>
              <Input
                value={globalIncrease}
                onChange={(e) => setGlobalIncrease(e.target.value)}
                type="number"
                className="w-full sm:col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-white"
                placeholder= {t('nominas.dialog.globalGroupPlaceholder')}
              />
            </div>
          </div>

          {/* Department Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-white text-center sm:text-left">
              {t('nominas.dialog.Department')}
            </h3>
              {departments.length > 0 && (
                <div className="flex flex-col sm:grid sm:grid-cols-4 gap-4 items-center dark:text-white">
                  <Label className="text-gray-600 dark:text-gray-300 text-center sm:text-right">
                    {t('adminPanel.selectDepartmentLabel')}
                  </Label>
                  <Select 
                    value={selectedDepartment} 
                    onValueChange={setSelectedDepartment}
                    disabled={!selectedCompany}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('adminPanel.selectDepartmentPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col sm:grid sm:grid-cols-4 gap-4 items-center dark:text-white">
                <Label className="text-gray-600 dark:text-gray-300 text-center sm:text-right">
                {t('nominas.dialog.DepartmentDescription')}
                </Label>
                <Input
                  value={departamentoIncrease}
                  onChange={(e) => setDepartamentoIncrease(e.target.value)}
                  type="number"
                  className="w-full sm:col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  placeholder="Introduce incremento por departamento"
                />
              </div>
            </div>
          </div>

          {/* Subdepartment Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg dark:text-white">
            {subdepartments.length > 0 && (
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-white text-center sm:text-left">
              {t('nominas.dialog.SubDepartment')}
            </h3>
                <div className="flex flex-col sm:grid sm:grid-cols-4 gap-4 items-center">
                  <Label className="text-gray-600 dark:text-gray-300 text-center sm:text-right">
                    {t('adminPanel.selectSubdepartmentLabel')}
                  </Label>
                  <Select 
                    value={selectedSubdepartment} 
                    onValueChange={setSelectedSubdepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('adminPanel.selectSubdepartmentPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {subdepartments.map((subDept) => (
                        <SelectItem key={subDept} value={subDept}>
                          {subDept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:grid sm:grid-cols-4 gap-4 items-center ">
                  <Label className="text-gray-600 dark:text-gray-300 text-center sm:text-right">
                  {t('nominas.dialog.SubDepartmentDescription')}
                  </Label>
                  <Input
                    value={subdepartamentoIncrease}
                    onChange={(e) => setSubdepartamentoIncrease(e.target.value)}
                    type="number"
                    className="w-full sm:col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    placeholder={t('nominas.dialog.SubDepartmentPlaceholder')}
                    />
                </div>
              </div>
            )}
          </div>

          {/* Employee Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg dark:text-white">
            <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-white text-center sm:text-left">
              {t('nominas.dialog.Empleado')}
            </h3>
              <div>
                <Label className="text-gray-600 dark:text-gray-300">
                  {t('recordatorios.card.label2')}
                </Label>
                <Select 
                  value={selectedEmployee?.id || ""} 
                  onValueChange={(id) => {
                    const employee = employees.find(emp => emp.id === id);
                    setSelectedEmployee(employee || null);
                  }}
                >
                  <SelectTrigger className="mt-2">
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

              <div className="flex flex-col sm:grid sm:grid-cols-4 gap-4 items-center">
                <Label className="text-gray-600 dark:text-gray-300 text-center sm:text-right">
                  {t('nominas.dialog.incentivoprom')}
                </Label>
                <Input
                  value={incentivoPromedio}
                  onChange={(e) => setIncentivoPromedio(e.target.value)}
                  className="w-full sm:col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  disabled={!selectedEmployee}
                  placeholder="Incentivo promedio"
                />
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-4 gap-4 items-center">
                <Label className="text-gray-600 dark:text-gray-300 text-center sm:text-right">
                  {t('nominas.dialog.bono')}
                </Label>
                <Input
                  value={bono}
                  onChange={(e) => setBono(e.target.value)}
                  className="w-full sm:col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  disabled={!selectedEmployee}
                  placeholder="Bono"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 border-t pt-4">
          <Button 
            onClick={saveGlobalAndGroupData}
            disabled={!selectedCompany}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Save className="mr-2" />  {t('nominas.dialog.button2')}
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
                    'name', 'surname', 'department', "subdepartment", "puesto",
                    'basicSalary', 'averageIncentive', 
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
                          <TableCell className="text-center">{employee.subdepartamento}</TableCell>
                          <TableCell className="text-center">{employee.puesto}</TableCell>
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