"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTranslation } from "react-i18next";
import { FileManagementDialog } from "@/components/FileManagementDialog";

interface Employee {
  id: string;
  name: string;
  apellido: string;
  department: string;
  puesto:string;
  pdpStatus?: string;
  pdcStatus?: string;
}

export default function PerformancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies, setCompanies] = useState<string[]>([]); // Empresas dinámicas
  const { t } = useTranslation();
  
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
    const fetchEmployees = async () => {
      if (!selectedCompany) {
        setEmployees([]);
        return;
      }

      try {
        const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados");
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesData = employeesSnapshot.docs
        .filter(doc => doc.data().estado === "activo") // Filter for active employees
        .map((doc) => ({
          id: doc.id,
          name: doc.data().nombre,
          apellido: doc.data().apellido,
          department: doc.data().departamento,
          puesto: doc.data().puesto,
        }));

        setEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, [selectedCompany]);

  const renderEmployeeEvaluation = () => {
    // Filtro para solo No Tecnicos
    const filteredEmployees = employees.filter(employee => 
      !employee.puesto.toLowerCase().includes('tecnico')
    );

    return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('desempeño.evaluationPage.general.employeeTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
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
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.employee.0')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.employee.1')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.employee.2')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.employee.3')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.employee.4')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.employee.5')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.employee.6')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.employee.7')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.apellido}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.puesto}</TableCell>
                  <TableCell>
                    <FileManagementDialog 
                      employeeId={employee.id} 
                      fileType="pdp"
                      onFileUploaded={(url) => {
                        // Opcional: Actualizar estado de pdpStatus si lo necesitas
                      }}
                    />
                  </TableCell>
                  <TableCell>
                  <FileManagementDialog 
                      employeeId={employee.id} 
                      fileType="self_evaluation"
                    />
                    </TableCell>
                  <TableCell>
                  <FileManagementDialog 
                    employeeId={employee.id} 
                    fileType="boss_evaluation"
                  />
                    </TableCell>
                  <TableCell>
                  <FileManagementDialog 
                    employeeId={employee.id} 
                    fileType="calibration"
                  />
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

  const renderTechEvaluation = () => {
    // Filtro para solo Tecnicos
    const techEmployees = employees.filter(employee => 
      employee.puesto.toLowerCase().includes('tecnico')
    );
  
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('desempeño.evaluationPage.general.techTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Select 
                value={selectedCompany} 
                onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-full bg-white dark:bg-blue-800 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all duration-300">
                  <SelectValue 
                    placeholder={t('pagedashboard.selectCompanyPlaceholder')} 
                    className="text-blue-600 dark:text-blue-200"/>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-blue-900 border-blue-200 dark:border-blue-700 shadow-xl">
                  {companies.map((company) => (
                    <SelectItem 
                      key={company} 
                      value={company} 
                      className="hover:bg-blue-100 dark:hover:bg-blue-800 focus:bg-blue-200 dark:focus:bg-blue-700 transition-colors">
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> 
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.0')}</TableHead>
                  <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.1')}</TableHead>
                  <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.2')}</TableHead>
                  <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.3')}</TableHead>
                  <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.4')}</TableHead>
                  <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.5')}</TableHead>
                  <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.6')}</TableHead>
                  <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.7')}</TableHead>
                  <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.8')}</TableHead>
                </TableRow>
              </TableHeader>
  
              <TableBody>
                {techEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.apellido}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.puesto}</TableCell>
                    <TableCell>
                      <FileManagementDialog 
                        employeeId={employee.id} 
                        fileType="pdc"
                        onFileUploaded={(url) => {
                          // Opcional: Actualizar estado de pdcStatus si lo necesitas
                        }}
                      />
                    </TableCell>
                    <TableCell>
                    <FileManagementDialog 
                      employeeId={employee.id} 
                      fileType="asesor_evaluation"
                    />
                    </TableCell>
                    <TableCell>
                    <FileManagementDialog 
                      employeeId={employee.id} 
                      fileType="capacitador_evaluation"
                    />
                    </TableCell>
                    <TableCell>
                    <FileManagementDialog 
                      employeeId={employee.id} 
                      fileType="final_calibration"
                    />
                    </TableCell>
                    <TableCell>
                      <FileManagementDialog 
                        employeeId={employee.id} 
                        fileType="legajo"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold dark:text-white">{t('desempeño.title')}</h1>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger className="dark:text-white dark:hover:bg-gray-700" value="employees">{t('desempeño.tabs.employe')}</TabsTrigger>
          <TabsTrigger className="dark:text-white dark:hover:bg-gray-700" value="technicians">{t('desempeño.tabs.employeTec')}</TabsTrigger>
        </TabsList>
        <TabsContent value="employees">{renderEmployeeEvaluation()}</TabsContent>
        <TabsContent value="technicians">{renderTechEvaluation()}</TabsContent>
      </Tabs>
    </div>
  );
}