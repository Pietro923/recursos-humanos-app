"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function PerformancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies] = useState(["Pueble SA - CASE IH", "KIA"]);

  // Definición de los tipos
  interface Employee {
    id: string;
    name: string;
    department: string;
    pdpStatus?: string;
    selfEvaluation?: string;
    bossEvaluation?: string;
    finalCalibration?: string;
  }

  const handlePdpUpload = async (e: React.ChangeEvent<HTMLInputElement>, employeeId: string) => {
    const file = e.target.files?.[0];
    if (!file) {
      alert("No se seleccionó ningún archivo.");
      return;
    }
  
    try {
      // Inicializar Firebase Storage
      const storage = getStorage(); // Obtiene la instancia de Storage desde tu configuración de Firebase
      const fileRef = ref(storage, `pdp/${employeeId}/${file.name}`);
  
      // Subir archivo al Storage
      await uploadBytes(fileRef, file);
  
      // Obtener la URL del archivo subido
      const fileUrl = await getDownloadURL(fileRef);
  
      console.log("Archivo subido correctamente:", fileUrl);
  
      // Aquí puedes guardar la URL en la base de datos, si es necesario
      alert("Archivo PDP subido exitosamente.");
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      alert("Hubo un error al subir el archivo.");
    }
  };

  // Efecto para cargar empleados al cambiar la empresa seleccionada
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedCompany) {
        setEmployees([]);
        return;
      }

      try {
        const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados");
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesData = employeesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().nombre,
          department: doc.data().departamento,
        }));

        setEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, [selectedCompany]);

  const renderEmployeeEvaluation = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Evaluación de Desempeño - Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select onValueChange={(value) => setSelectedCompany(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una empresa" />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>PDP</TableHead>
                <TableHead>Autoevaluación</TableHead>
                <TableHead>Evaluación Jefe</TableHead>
                <TableHead>Calibración Final</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {employee.pdpStatus || "N/A"}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`upload-pdp-${employee.id}`)?.click()}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        PDP
                      </Button>
                      <input
                        type="file"
                        id={`upload-pdp-${employee.id}`}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handlePdpUpload(e, employee.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{employee.selfEvaluation || "N/A"}</TableCell>
                  <TableCell>{employee.bossEvaluation || "N/A"}</TableCell>
                  <TableCell>{employee.finalCalibration || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Autoevaluar
                      </Button>
                      <Button variant="outline" size="sm">
                        Evaluar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderTechEvaluation = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Evaluación de Desempeño - Técnicos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Módulo en desarrollo. Próximamente se agregarán las funcionalidades específicas para técnicos.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Sistema de Evaluación de Desempeño</h1>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="technicians">Técnicos</TabsTrigger>
        </TabsList>
        <TabsContent value="employees">{renderEmployeeEvaluation()}</TabsContent>
        <TabsContent value="technicians">{renderTechEvaluation()}</TabsContent>
      </Tabs>
    </div>
  );
}
