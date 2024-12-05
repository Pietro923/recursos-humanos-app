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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
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
  const [evaluationResults, setEvaluationResults] = useState<Record<string, string[]>>({});
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
        const employeesData = employeesSnapshot.docs
        .filter(doc => doc.data().estado === "activo") // Filter for active employees
        .map((doc) => ({
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
      { year: '2024', fileTypes: [t('desempeño.legajosection.tipo1'), t('desempeño.legajosection.tipo2'),, t('desempeño.legajosection.tipo3'),] },
      { year: '2023', fileTypes: [t('desempeño.legajosection.tipo1'), t('desempeño.legajosection.tipo2'),, t('desempeño.legajosection.tipo3'),] },
      { year: '2022', fileTypes:[t('desempeño.legajosection.tipo1'), t('desempeño.legajosection.tipo2'),, t('desempeño.legajosection.tipo3'),] }
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
            <DialogTitle>{t('desempeño.dialogs.legajo.title')} {selectedEmployee.name}</DialogTitle>
            <DialogDescription>{t('desempeño.dialogs.legajo.description')}</DialogDescription>
          </DialogHeader>
          
          {legajoYears.map((yearData) => (
            <div key={yearData.year} className="mb-4 border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">{t('desempeño.legajosection.leg')} {yearData.year}</h3>
              <div className="grid grid-cols-3 gap-4">
                {yearData.fileTypes.map((fileType) => (
                  <Button 
                    key={fileType} 
                    variant="outline"
                    onClick={() => {
                      alert(
                        t('desempeño.dialogs.legajo.fileButtonAlert', {
                          fileType: fileType,
                          employeeName: selectedEmployee.name,
                          year: yearData.year
                        })
                      );
                    }}
                  >
                    {fileType}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>{t('desempeño.dialogs.legajo.closeButton')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const renderEvaluationDialog = () => {
    if (!selectedEmployee || !dialogType) return null;

    const dialogTitles = {
      'self': t('desempeño.dialogs.evaluation.titles.self'),
      'boss':  t('desempeño.dialogs.evaluation.titles.boss'),
      'calibration': t('desempeño.dialogs.evaluation.titles.calibration'),
      'asesor': t('desempeño.dialogs.evaluation.titles.asesor'),
      'capacitador': t('desempeño.dialogs.evaluation.titles.capacitador'),
      'calibrationTec': t('desempeño.dialogs.evaluation.titles.calibrationTec'),
      'legajo':t('desempeño.dialogs.evaluation.titles.legajo'),
    };

    if (dialogType === 'legajo') {
      return renderLegajoDialog();
    }

    const dialogQuestions = {
      
      'self': [
        t('desempeño.dialogs.evaluation.questions.self.0'),
        t('desempeño.dialogs.evaluation.questions.self.1'),
        t('desempeño.dialogs.evaluation.questions.self.2'),
      ],
      'boss': [
        t('desempeño.dialogs.evaluation.questions.boss.0'),
        t('desempeño.dialogs.evaluation.questions.boss.1'),
        t('desempeño.dialogs.evaluation.questions.boss.2'),
      ],
      'calibration': [
        t('desempeño.dialogs.evaluation.questions.calibration.0'),
        t('desempeño.dialogs.evaluation.questions.calibration.1'),
        t('desempeño.dialogs.evaluation.questions.calibration.2'),
      ],
      'asesor': [
        t('desempeño.dialogs.evaluation.questions.asesor.0'),
        t('desempeño.dialogs.evaluation.questions.asesor.1'),
        t('desempeño.dialogs.evaluation.questions.asesor.2'),
      ],
      'capacitador': [
        t('desempeño.dialogs.evaluation.questions.capacitador.0'),
        t('desempeño.dialogs.evaluation.questions.capacitador.1'),
        t('desempeño.dialogs.evaluation.questions.capacitador.2'),
      ],
      'calibrationTec': [
        t('desempeño.dialogs.evaluation.questions.calibrationTec.0'),
        t('desempeño.dialogs.evaluation.questions.calibrationTec.1'),
        t('desempeño.dialogs.evaluation.questions.calibrationTec.2'),
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
            <DialogDescription>{t('desempeño.dialogs.evaluation.description')}</DialogDescription>
          </DialogHeader>
          
          {dialogQuestions[dialogType].map((question, index) => (
            <div key={index} className="space-y-2">
              <Label>{question}</Label>
              <Textarea 
                placeholder={t('desempeño.dialogs.evaluation.questions.placeholder1')}
                value={evaluationResponses[dialogType][index]}
                onChange={(e) => handleResponseChange(index, e.target.value)}
              />
            </div>
          ))}
          
          {dialogType === 'calibration' && (
            <div className="space-y-2">
              <Label>{t('desempeño.dialogs.evaluation.scoreInput.label')}</Label>
              <Input 
                type="number" 
                min="1" 
                max="10" 
                placeholder={t('desempeño.dialogs.evaluation.scoreInput.placeholder')}
                value={evaluationResponses.calibrationScore}
                onChange={(e) => setEvaluationResponses(prev => ({
                  ...prev,
                  calibrationScore: e.target.value
                }))}
              />
            </div>
          )}
          
          <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>{t('desempeño.dialogs.evaluation.footerButtons.cancel')}</Button>
            <Button onClick={handleSaveEvaluation}>{t('desempeño.dialogs.evaluation.footerButtons.save')}</Button>
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
        t('desempeño.dialogs.evaluation.questions.self.0'),
        t('desempeño.dialogs.evaluation.questions.self.1'),
        t('desempeño.dialogs.evaluation.questions.self.2'),
      ],
      'boss': [
        t('desempeño.dialogs.evaluation.questions.boss.0'),
        t('desempeño.dialogs.evaluation.questions.boss.1'),
        t('desempeño.dialogs.evaluation.questions.boss.2'),
      ],
      'calibration': [
        t('desempeño.dialogs.evaluation.questions.calibration.0'),
        t('desempeño.dialogs.evaluation.questions.calibration.1'),
        t('desempeño.dialogs.evaluation.questions.calibration.2'),
      ],
      'asesor': [
        t('desempeño.dialogs.evaluation.questions.asesor.0'),
        t('desempeño.dialogs.evaluation.questions.asesor.1'),
        t('desempeño.dialogs.evaluation.questions.asesor.2'),
      ],
      'capacitador': [
        t('desempeño.dialogs.evaluation.questions.capacitador.0'),
        t('desempeño.dialogs.evaluation.questions.capacitador.1'),
        t('desempeño.dialogs.evaluation.questions.capacitador.2'),
      ],
      'calibrationTec': [
        t('desempeño.dialogs.evaluation.questions.calibrationTec.0'),
        t('desempeño.dialogs.evaluation.questions.calibrationTec.1'),
        t('desempeño.dialogs.evaluation.questions.calibrationTec.2'),
      ],
      'legajo': [
        
      ]
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
            <DialogTitle>{t('desempeño.dialogs.results.title')}{selectedEmployee.name}</DialogTitle>
          </DialogHeader>
          {results ? (
            viewDialogType === 'calibration' ? (
              <>
                {results.slice(0, 3).map((response: string, index: number) => (
                  <p key={index}><b>{dialogQuestions[viewDialogType][index]}:</b> {response}</p>
                ))}
                <p><b>{t('desempeño.dialogs.evaluation.scoreInput.label2')}</b> {results[3]}</p>
              </>
            ) : (
              results.map((response: string, index: number) => (
                <p key={index}><b>{dialogQuestions[viewDialogType][index]}:</b> {response}</p>
              ))
            )
          ) : (
            <p>{t('desempeño.dialogs.results.noResults')}</p>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedEmployee(null)}>{t('desempeño.dialogs.results.closeButton')}</Button>
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
                        {t('desempeño.evaluationPage.actions.uploadPDP')}
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
                    <Button variant="outline" onClick={() => openViewDialog(employee, 'self')}>{t('desempeño.evaluationPage.actions.viewSelfResults')}</Button>
                    </TableCell>
                  <TableCell>
                  <Button variant="outline" onClick={() => openViewDialog(employee, 'boss')}>{t('desempeño.evaluationPage.actions.viewBossResults')}</Button>
                    </TableCell>
                  <TableCell>
                  <Button variant="outline" onClick={() => openViewDialog(employee, 'calibration')}>{t('desempeño.evaluationPage.actions.viewCalibrationResults')}</Button>
                    </TableCell>
                    
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'self')}
                      >
                        {t('desempeño.evaluationPage.actions.evaluate.self')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'boss')}
                      >
                         {t('desempeño.evaluationPage.actions.evaluate.boss')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'calibration')}
                      >
                        {t('desempeño.evaluationPage.actions.evaluate.calibration')}
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
          <CardTitle>{t('desempeño.evaluationPage.general.techTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select onValueChange={(value) => setSelectedCompany(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('desempeño.evaluationPage.general.selectCompany')} />
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
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.0')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.1')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.2')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.3')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.4')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.5')}</TableHead>
                <TableHead>{t('desempeño.evaluationPage.tableHeaders.tech.6')}</TableHead>
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
                        {t('desempeño.evaluationPage.actions.uploadPDC')}
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
                    <Button variant="outline" onClick={() => openViewDialog(employee, 'asesor')}>{t('desempeño.evaluationPage.actions.viewCalibrationAsesor')}</Button>
                    </TableCell>
                  <TableCell>
                  <Button variant="outline" onClick={() => openViewDialog(employee, 'capacitador')}>{t('desempeño.evaluationPage.actions.viewCalibrationCapacitador')}</Button>
                    </TableCell>
                  <TableCell>
                  <Button variant="outline" onClick={() => openViewDialog(employee, 'calibrationTec')}>{t('desempeño.evaluationPage.actions.viewCalibrationTec')}</Button>
                    </TableCell>
                    
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'asesor')}
                      >
                         {t('desempeño.evaluationPage.actions.evaluate.asesor')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'capacitador')}
                      >
                        {t('desempeño.evaluationPage.actions.evaluate.capacitador')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'calibrationTec')}
                      >
                        {t('desempeño.evaluationPage.actions.evaluate.calibrationTec')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDialog(employee, 'legajo')}
                      >
                      {t('desempeño.evaluationPage.actions.evaluate.Legajo')}
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