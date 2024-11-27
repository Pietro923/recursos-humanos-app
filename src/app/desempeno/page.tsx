"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Employee {
  id: string;
  name: string;
  department: string;
  pdpStatus?: string;
  selfEvaluation?: string;
  bossEvaluation?: string;
  finalCalibration?: string;
}

export default function PerformancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies] = useState(["Pueble SA - CASE IH", "KIA"]);
  
  
  // State for dialogs
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dialogType, setDialogType] = useState<'self' | 'boss' | 'calibration'| 'asesor' | 'capacitador' | 'calibrationTec' | 'legajo' | null>(null);
  const [evaluationResponses, setEvaluationResponses] = useState({
    self: ['', '', ''],
    boss: ['', '', ''],
    calibration: ['', '', ''],
    calibrationScore: '',
    asesor: ['', '', ''],
    capacitador: ['', '', ''],
    calibrationTec: ['', '', ''],
    legajo: ['', '', ''],
  });
  const [evaluationResults, setEvaluationResults] = useState<Record<string, any>>({});
  const [viewDialogType, setViewDialogType] = useState<'self' | 'boss' | 'calibration'| 'asesor' | 'capacitador' | 'calibrationTec' | 'legajo' | null>(null);
  

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, employeeId: string, fileType: 'pdp' | 'pdc') => {
    const file = e.target.files?.[0];
    if (!file) {
      alert("No se seleccionó ningún archivo.");
      return;
    }
  
    try {
      const storage = getStorage();
      const fileRef = ref(storage, `${fileType}/${employeeId}/${file.name}`);
      
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);
  
      console.log(`Archivo ${fileType.toUpperCase()} subido correctamente:`, fileUrl);
      alert(`Archivo ${fileType.toUpperCase()} subido exitosamente.`);
    } catch (error) {
      console.error(`Error al subir el archivo ${fileType.toUpperCase()}:`, error);
      alert(`Hubo un error al subir el archivo ${fileType.toUpperCase()}.`);
    }
  };

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

  const openDialog = (employee: Employee, type: 'self' | 'boss' | 'calibration'| 'asesor' | 'capacitador' | 'calibrationTec' | 'legajo') => {
    setSelectedEmployee(employee);
    setDialogType(type);
  };

  const openViewDialog = (employee: Employee, type: 'self' | 'boss' | 'calibration'| 'asesor' | 'capacitador' | 'calibrationTec' | 'legajo') => {
    setSelectedEmployee(employee);
    setViewDialogType(type);
  };

  const handleResponseChange = (index: number, value: string) => {
    if (!dialogType) return;

    setEvaluationResponses(prev => ({
      ...prev,
      [dialogType]: prev[dialogType].map((response, i) => 
        i === index ? value : response
      )
    }));
  };

  const handleSaveEvaluation = () => {
    if (!selectedEmployee || !dialogType) return;
  
    // Modificación principal: Incluir la puntuación de calibración cuando el diálogo es de calibración
    const evaluationData = dialogType === 'calibration' 
      ? [...evaluationResponses[dialogType], evaluationResponses.calibrationScore]
      : evaluationResponses[dialogType];
  
    setEvaluationResults((prev) => ({
      ...prev,
      [`${selectedEmployee.id}-${dialogType}`]: evaluationData,
    }));
  
    // Reiniciar los estados después de guardar
    setEvaluationResponses((prev) => ({
      ...prev,
      [dialogType]: ['', '', ''],
      calibrationScore: '' // Reiniciar también la puntuación
    }));
  
    alert(`Evaluación de ${selectedEmployee.name} guardada`);
    setSelectedEmployee(null);
    setDialogType(null);
  };

  const closeDialog = () => {
    setSelectedEmployee(null);
    setDialogType(null);
    setViewDialogType(null); // Asegúrate de limpiar también el estado del diálogo de resultados
  };

  const renderLegajoDialog = () => {
    if (!selectedEmployee || dialogType !== 'legajo') return null;
  
    const legajoYears = [
      { year: '2024', fileTypes: ['Contrato', 'Evaluaciones', 'Documentos Personales'] },
      { year: '2023', fileTypes: ['Contrato', 'Evaluaciones', 'Documentos Personales'] },
      { year: '2022', fileTypes: ['Contrato', 'Evaluaciones'] }
    ];
  
    return (
      <Dialog 
        open={dialogType === 'legajo'} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEmployee(null);
            setDialogType(null);
          }
        }}
      >
        <DialogContent className="bg-white max-w-2xl dark:bg-gray-950 dark:text-white">
          <DialogHeader>
            <DialogTitle>Legajos de {selectedEmployee.name}</DialogTitle>
            <DialogDescription>Seleccione el año y tipo de documento</DialogDescription>
          </DialogHeader>
          
          {legajoYears.map((yearData) => (
            <div key={yearData.year} className="mb-4 border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">Legajo {yearData.year}</h3>
              <div className="grid grid-cols-3 gap-4">
                {yearData.fileTypes.map((fileType) => (
                  <Button 
                    key={fileType} 
                    variant="outline"
                    onClick={() => {
                      // Aquí podrías implementar la lógica para abrir/descargar el documento
                      alert(`Abriendo ${fileType} para ${selectedEmployee.name} del año ${yearData.year}`);
                    }}
                  >
                    {fileType}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const renderEvaluationDialog = () => {
    if (!selectedEmployee || !dialogType) return null;

    const dialogTitles = {
      'self': 'Autoevaluación',
      'boss': 'Evaluación del Jefe',
      'calibration': 'Calibración Final',
      'asesor': 'Evaluacion del Asesor',
      'capacitador': 'Evaluacion del Capacitador',
      'calibrationTec': 'Calibración Final Tecnico',
      'legajo': 'Legajos del Empleado',
    };

    if (dialogType === 'legajo') {
      return renderLegajoDialog();
    }

    const dialogQuestions = {
      'self': [
        "¿Cuáles fueron tus principales logros en el último período?",
        "¿Qué desafíos enfrentaste y cómo los superaste?",
        "¿En qué áreas consideras que necesitas mejorar?"
      ],
      'boss': [
        "Evaluación general del desempeño del empleado",
        "Fortalezas observadas",
        "Áreas de mejora identificadas"
      ],
      'calibration': [
        "Resultado final de la evaluación de desempeño",
        "Puntuación global",
        "Observaciones adicionales"
      ],
      'asesor': [
        "¿Cómo evalúas el nivel de asistencia técnica proporcionada?",
        "¿Qué tan claras fueron las instrucciones y expectativas establecidas?",
        "¿Hubo algún proyecto o actividad donde sentiste que el apoyo técnico fue insuficiente?"
      ],
      'capacitador': [
        "¿Qué tan efectivo consideras el contenido y la metodología de las capacitaciones?",
        "¿Ha recibido suficiente práctica y retroalimentación para aplicar lo aprendido?",
        "¿En qué áreas consideras que debería recibir más capacitación?"
      ],
      'calibrationTec': [
        "Resultado final de la evaluación de desempeño",
        "Puntuación global",
        "Observaciones adicionales"
      ],
      'legajo': [
        
      ]
    };

    return (
      <Dialog 
      open={!!selectedEmployee} 
      onOpenChange={(open) => {
        if (!open) {
          setSelectedEmployee(null);
          setDialogType(null);
        }
      }}
    >
        <DialogContent className="bg-white dark:bg-gray-950 dark:text-white">
          <DialogHeader>
            <DialogTitle>{dialogTitles[dialogType]} - {selectedEmployee.name}</DialogTitle>
            <DialogDescription>Por favor, complete el siguiente cuestionario</DialogDescription>
          </DialogHeader>
          
          {dialogQuestions[dialogType].map((question, index) => (
            <div key={index} className="space-y-2">
              <Label>{question}</Label>
              <Textarea 
                placeholder="Escriba su respuesta aquí" 
                value={evaluationResponses[dialogType][index]}
                onChange={(e) => handleResponseChange(index, e.target.value)}
              />
            </div>
          ))}
          
          {dialogType === 'calibration' && (
            <div className="space-y-2">
              <Label>Puntuación Final</Label>
              <Input 
                type="number" 
                min="1" 
                max="10" 
                placeholder="Ingrese puntuación (1-10)"
                value={evaluationResponses.calibrationScore}
                onChange={(e) => setEvaluationResponses(prev => ({
                  ...prev,
                  calibrationScore: e.target.value
                }))}
              />
            </div>
          )}
          
          <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleSaveEvaluation}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const renderResultsDialog = () => {
    if (!selectedEmployee || !viewDialogType) return null;
  
    const results = evaluationResults[`${selectedEmployee.id}-${viewDialogType}`];
    const dialogQuestions = {
      'self': [
        "¿Cuáles fueron tus principales logros en el último período?",
        "¿Qué desafíos enfrentaste y cómo los superaste?",
        "¿En qué áreas consideras que necesitas mejorar?"
      ],
      'boss': [
        "Evaluación general del desempeño del empleado",
        "Fortalezas observadas",
        "Áreas de mejora identificadas"
      ],
      'calibration': [
        "Resultado final de la evaluación de desempeño",
        "Puntuación global",
        "Observaciones adicionales"
      ], 
      'asesor': [
        "¿Cómo evalúas el nivel de asistencia técnica proporcionada?",
        "¿Qué tan claras fueron las instrucciones y expectativas establecidas?",
        "¿Hubo algún proyecto o actividad donde sentiste que el apoyo técnico fue insuficiente?"
      ],
      'capacitador': [
        "¿Qué tan efectivo consideras el contenido y la metodología de las capacitaciones?",
        "¿Ha recibido suficiente práctica y retroalimentación para aplicar lo aprendido?",
        "¿En qué áreas consideras que debería recibir más capacitación?"
      ],
      'calibrationTec': [
        "Resultado final de la evaluación de desempeño",
        "Puntuación global",
        "Observaciones adicionales"
      ],'legajo': [
        
      ],
    };
  
    return (
      <Dialog 
      open={!!viewDialogType} 
      onOpenChange={(open) => {
        if (!open) {
          setSelectedEmployee(null);
          setViewDialogType(null);
        }
      }}
    >
      {selectedEmployee && viewDialogType && (
        <DialogContent className="bg-white dark:bg-gray-950 dark:text-white">
          <DialogHeader>
            <DialogTitle>Resultados - {selectedEmployee.name}</DialogTitle>
          </DialogHeader>
          {results ? (
            viewDialogType === 'calibration' ? (
              <>
                {results.slice(0, 3).map((response: string, index: number) => (
                  <p key={index}><b>{dialogQuestions[viewDialogType][index]}:</b> {response}</p>
                ))}
                <p><b>Puntuación Final:</b> {results[3]}</p>
              </>
            ) : (
              results.map((response: string, index: number) => (
                <p key={index}><b>{dialogQuestions[viewDialogType][index]}:</b> {response}</p>
              ))
            )
          ) : (
            <p>No hay resultados disponibles.</p>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedEmployee(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      )}
      </Dialog>
    );
  };

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
                      {employee.pdpStatus || ""}
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
                        onChange={(e) => handleFileUpload(e, employee.id, 'pdp')}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => openViewDialog(employee, 'self')}>Resultados Autoevaluacion</Button>
                    </TableCell>
                  <TableCell>
                  <Button variant="outline" onClick={() => openViewDialog(employee, 'boss')}>Resultados Evaluación Jefe</Button>
                    </TableCell>
                  <TableCell>
                  <Button variant="outline" onClick={() => openViewDialog(employee, 'calibration')}>Resultados Calibracion</Button>
                    </TableCell>
                    
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'self')}
                      >
                        Autoevaluar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'boss')}
                      >
                        Evaluación Jefe
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'calibration')}
                      >
                        Calibrar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {renderResultsDialog()}
      {renderEvaluationDialog()}
    </div>
  );

  const renderTechEvaluation = () => (

    // esta parte tiene que ir si o si
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Evaluación de Desempeño - Tecnicos</CardTitle>
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
                <TableHead>PDC</TableHead>
                <TableHead>Evaluación Asesor</TableHead>
                <TableHead>Evaluación Capacitador</TableHead>
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
                      {employee.pdpStatus || ""}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`upload-pdc-${employee.id}`)?.click()}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        PDC
                      </Button>
                      <input
                        type="file"
                        id={`upload-pdc-${employee.id}`}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, employee.id, 'pdc')}
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button variant="outline" onClick={() => openViewDialog(employee, 'asesor')}>R. Evaluación Asesor</Button>
                    </TableCell>
                  <TableCell>
                  <Button variant="outline" onClick={() => openViewDialog(employee, 'capacitador')}>R. Evaluación Capacitador</Button>
                    </TableCell>
                  <TableCell>
                  <Button variant="outline" onClick={() => openViewDialog(employee, 'calibrationTec')}>R. Calibracion</Button>
                    </TableCell>
                    
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'asesor')}
                      >
                        Evaluación Asesor
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'capacitador')}
                      >
                        Evaluación Capacitador
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'calibrationTec')}
                      >
                        Calibrar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'legajo')}
                      >
                        Legajo
                      </Button>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {renderResultsDialog()}
      {renderEvaluationDialog()}
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold dark:text-white">Sistema de Evaluación de Desempeño</h1>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger className="dark:text-white dark:hover:bg-gray-700" value="employees">Empleados</TabsTrigger>
          <TabsTrigger className="dark:text-white dark:hover:bg-gray-700" value="technicians">Técnicos</TabsTrigger>
        </TabsList>
        <TabsContent value="employees">{renderEmployeeEvaluation()}</TabsContent>
        <TabsContent value="technicians">{renderTechEvaluation()}</TabsContent>
      </Tabs>
    </div>
  );
}