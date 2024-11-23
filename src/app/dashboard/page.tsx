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
  const companies = ["Todas", "Pueble SA - CASE IH", "KIA"]; // Empresas disponibles

  // Obtener datos de empleados y sueldos
  useEffect(() => {
    const fetchData = async () => {
      let employeeCount = 0;
      let payrollExpense = 0;
      let maleCount = 0;
      let femaleCount = 0;
      let departments: { [key: string]: number[] } = {};

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
            employeesSnapshot.docs.forEach((doc) => {
              const gender = doc.data().genero;
              if (gender === "masculino") maleCount++;
              if (gender === "femenino") femaleCount++;

              // Almacenar los sueldos por departamento
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
          employeeCount = employeesSnapshot.size;
          payrollExpense = employeesSnapshot.docs.reduce(
            (sum, doc) => sum + (doc.data().sueldo || 0),
            0
          );
          employeesSnapshot.docs.forEach((doc) => {
            const gender = doc.data().genero;
            if (gender === "masculino") maleCount++;
            if (gender === "femenino") femaleCount++;

            // Almacenar los sueldos por departamento
            const department = doc.data().departamento;
            if (!departments[department]) departments[department] = [];
            departments[department].push(doc.data().sueldo);
          });
        }

        setTotalEmployees(employeeCount);
        setTotalPayrollExpense(payrollExpense);
        setGenderData({ hombres: maleCount, mujeres: femaleCount });

        // Formatear los datos para el hook
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
  }, [selectedCompany]);

  // Usamos el hook para calcular los sueldos promedio y desviación estándar
  const salaryStats: SalaryStat[] = useSalaryStats(departmentData); // Especificamos el tipo de salaryStats

  return (
  <div className="space-y-8 p-6 bg-slate-50">
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard RRHH</h1>
        <p className="text-sm text-muted-foreground">
          Vista general de recursos humanos
        </p>
      </div>

      <Card className="w-full sm:w-72 bg-white/50 backdrop-blur shadow-sm">
        <CardContent className="pt-4">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Seleccionar Empresa
          </label>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full">
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
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Empleados</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Empleados activos
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Asistencia Promedio</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              Último mes
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Gasto en Nómina</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">${totalPayrollExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total mensual
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Horas de Formación</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">450</div>
            <p className="text-xs text-muted-foreground">
              Horas totales
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Análisis Salarial por Departamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {salaryStats.map((stat: SalaryStat, index: number) => (
            <div key={index} className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-muted-foreground">{stat.name}</h3>
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-slate-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Promedio</p>
                  <p className="text-lg font-bold text-green-600">
                    ${stat.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Desvío Estándar</p>
                  <p className="text-sm font-medium text-red-600">
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
        <CardTitle className="text-xl font-semibold">Distribución por Género</CardTitle>
        <CardDescription>
          Proporción de empleados por género en la organización
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
    <CardTitle className="text-xl font-semibold">Recordatorios</CardTitle>
  </CardHeader>
  <CardContent>
    <Recordatorios />
  </CardContent>
</Card>
  </div>
);
}
