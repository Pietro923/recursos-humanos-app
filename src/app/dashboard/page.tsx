"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Graficotorta from "@/components/grafico-torta";
import useSalaryStats from "@/hooks/useSalaryStats"; // Importamos el hook
import Recordatorios from "@/components/recordatorio";
import { useTranslation } from "react-i18next";

// Definimos la interfaz para los datos de salarios
interface SalaryStat {
  name: string;
  average: number;
  standardDeviation: number;
}

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState("Todas");
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPayrollExpense, setTotalPayrollExpense] = useState(0);
  const [genderData, setGenderData] = useState({ hombres: 0, mujeres: 0 });
  const [departmentData, setDepartmentData] = useState<{ name: string; salaries: number[] }[]>([]);
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<string[]>([]); // Empresas dinámicas

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
        setCompanies(["Todas", ...companyNames]);
      } catch (error) {
        console.error("Error al obtener las compañías:", error);
      }
    };
  
    fetchCompanies();
  }, []);


  // Obtener datos de empleados y sueldos
  useEffect(() => {
    const fetchData = async () => {
      if (companies.length === 0 || !selectedCompany) return; // Espera hasta que las empresas estén listas
  
      let employeeCount = 0;
      let payrollExpense = 0;
      let maleCount = 0;
      let femaleCount = 0;
      const departments: { [key: string]: number[] } = {};
  
      try {
        if (selectedCompany === "Todas") {
          // Obtener datos de todas las empresas
          for (const company of companies.slice(1)) { // Ignora "Todas"
            const employeesSnapshot = await getDocs(
              collection(db, "Grupo_Pueble", company, "empleados")
            );
  
            const activeEmployees = employeesSnapshot.docs.filter(
              doc => doc.data().estado === "activo"
            );
  
            employeeCount += activeEmployees.length;
            payrollExpense += activeEmployees.reduce(
              (sum, doc) => sum + (doc.data().sueldo || 0),
              0
            );
  
            activeEmployees.forEach((doc) => {
              const gender = doc.data().genero;
              if (gender === "masculino") maleCount++;
              if (gender === "femenino") femaleCount++;
  
              const department = doc.data().departamento;
              if (!departments[department]) departments[department] = [];
              departments[department].push(doc.data().sueldo);
            });
          }
        } else {
          // Obtener datos de la empresa seleccionada
          const employeesSnapshot = await getDocs(
            collection(db, "Grupo_Pueble", selectedCompany, "empleados")
          );
  
          const activeEmployees = employeesSnapshot.docs.filter(
            doc => doc.data().estado === "activo"
          );
  
          employeeCount = activeEmployees.length;
          payrollExpense = activeEmployees.reduce(
            (sum, doc) => sum + (doc.data().sueldo || 0),
            0
          );
  
          activeEmployees.forEach((doc) => {
            const gender = doc.data().genero;
            if (gender === "masculino") maleCount++;
            if (gender === "femenino") femaleCount++;
  
            const department = doc.data().departamento;
            if (!departments[department]) departments[department] = [];
            departments[department].push(doc.data().sueldo);
          });
        }
  
        setTotalEmployees(employeeCount);
        setTotalPayrollExpense(payrollExpense);
        setGenderData({ hombres: maleCount, mujeres: femaleCount });
  
        const formattedDepartments = Object.keys(departments).map((name) => ({
          name,
          salaries: departments[name],
        }));
  
        setDepartmentData(formattedDepartments);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
  
    fetchData();
  }, [companies, selectedCompany]); // Escucha cambios en `companies` y `selectedCompany`

  // Usamos el hook para calcular los sueldos promedio y desviación estándar
  const salaryStats: SalaryStat[] = useSalaryStats(departmentData); // Especificamos el tipo de salaryStats

  return (
  <div className="space-y-8 p-6 bg-slate-50 dark:bg-gray-800 dark:border-gray-700 rounded-2xl  ">
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">{t('pagedashboard.dashboardTitle')}</h1>
        <p className="text-sm text-muted-foreground">
        {t('pagedashboard.dashboardDescription')}
        </p>
      </div>
      <Card className="w-full sm:w-72 bg-white/50 backdrop-blur shadow-sm dark:bg-gray-950"></Card>
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

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
          <CardTitle className="text-sm font-medium text-muted-foreground  ">{t('pagedashboard.totalEmployeesTitle')}</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground ">
            {t('pagedashboard.totalEmployeesDescription')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground"> {t('pagedashboard.averageAttendanceTitle')}</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
            {t('pagedashboard.averageAttendanceDescription')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t('pagedashboard.payrollExpenseTitle')}</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">${totalPayrollExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
            {t('pagedashboard.payrollExpenseDescription')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t('pagedashboard.trainingHoursTitle')}</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">450</div>
            <p className="text-xs text-muted-foreground">
            {t('pagedashboard.trainingHoursDescription')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black dark:text-blue-300">
          {t('pagedashboard.salaryAnalysisTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {salaryStats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 p-5 rounded-xl border-2 border-blue-100 dark:border-blue-900 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-md text-blue-700 dark:text-blue-300">{stat.name}</h3>
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center shadow-md">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-blue-500 dark:text-blue-300">{t('pagedashboard.averageLabel')}</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    ${stat.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-blue-500 dark:text-blue-300">{t('pagedashboard.standardDeviationLabel')}</p>
                  <p className="text-md font-semibold text-red-600 dark:text-red-400">
                    ${stat.standardDeviation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card className="shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{t('pagedashboard.genderDistributionTitle')}</CardTitle>
        <CardDescription>
        {t('pagedashboard.genderDistributionDescription')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="w-full h-[450px] flex items-center justify-center">
          <div className="w-full max-w-[500px]">
            <Graficotorta genderData={genderData} />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="shadow-sm">
  <CardHeader>
    <CardTitle className="text-xl font-semibold">{t('pagedashboard.remindersTitle')}</CardTitle>
  </CardHeader>
  <CardContent>
    <Recordatorios />
  </CardContent>
</Card>
  </div>
);
}
