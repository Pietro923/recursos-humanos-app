"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

interface Employee {
  id: string;
  nombre: string;
  apellido: string;
}

const RecordatoriossForm = () => {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]); // Lista de empleados con tipo Employee
  const [employee, setEmployee] = useState<string>(""); // Empleado seleccionado
  const [type, setType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [description, setDescription] = useState<string>("");
  const [companies, setCompanies] = useState<string[]>([]); // Empresas dinámicas
  const { toast } = useToast();
  const { t } = useTranslation(); // Hook de traducción
  
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

  // Cargar empleados de la empresa seleccionada
  useEffect(() => {
    const fetchEmployees = async () => {
      if (selectedCompany !== "") {
        // Acceder a la subcolección de empleados en la empresa seleccionada
        const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados");
        const employeesSnapshot = await getDocs(employeesRef);
        
        // Asegurarse de que el mapeo incluye 'nombre' y 'apellido'
        const employeesData = employeesSnapshot.docs
        .filter(doc => doc.data().estado === "activo") // Filter for active employees
        .map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre, // Asumimos que 'nombre' existe en el documento
          apellido: doc.data().apellido, // Asumimos que 'apellido' existe en el documento
        }));
    
        setEmployees(employeesData);
      } else {
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, [selectedCompany]);

  // Manejo del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedCompany || !employee || !type || !startDate || !endDate || !description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t('recordatorios.toast.description1'),
      });
      return;
    }
  
    if (endDate < startDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t('recordatorios.toast.description2'),
      });
      return;
    }
  
    try {
      // Buscar los datos del empleado seleccionado
      const selectedEmployee = employees.find((emp) => emp.id === employee);
  
      if (!selectedEmployee) {
        toast({
          variant: "destructive",
          title: "Error",
          description: t('recordatorios.toast.description3'),
        });
        return;
      }
  
      // Definir la colección de recordatorios según la empresa seleccionada
      const recordatoriossRef = collection(db, "Grupo_Pueble", selectedCompany, "recordatorios");
  
      // Guardar el recordatorio en la colección correspondiente
      await addDoc(recordatoriossRef, {
        empleadoId: employee,
        nombre: selectedEmployee.nombre, // Guardar nombre del empleado
        apellido: selectedEmployee.apellido, // Guardar apellido del empleado
        tipo: type,
        fechaInicio: startDate,
        fechaFin: endDate,
        descripcion: description,
        createdAt: new Date(),
      });
  
      toast({
        title: t('recordatorios.toast.title4'),
        description: t('recordatorios.toast.description4'),
      });
  
      // Limpiar campos después de enviar
      setEmployee("");
      setType("");
      setStartDate(undefined);
      setEndDate(undefined);
      setDescription("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t('recordatorios.toast.description5'),
      });
      console.error("Error al agregar recordatorio:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
      <CardTitle className="text-2xl font-bold flex items-center">
            <InfoIcon className="mr-3 text-blue-600" />
          {t('recordatorios.card.title')}
          </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de la empresa */}
          <div className="space-y-2">
          <Label 
            className="text-lg font-semibold text-gray-800 tracking-wide border-b-2 border-blue-500 pb-1 inline-block dark:text-white"
            htmlFor="company"
          >
            {t('recordatorios.card.label1')}
          </Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder={t('recordatorios.card.label1PlaceHolder')} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((comp) => (
                  <SelectItem key={comp} value={comp}>
                    {comp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selección de empleado */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-gray-800 tracking-wide border-b-2 border-blue-500 pb-1 inline-block dark:text-white" htmlFor="employee">{t('recordatorios.card.label2')}</Label>
            <Select value={employee} onValueChange={setEmployee}>
              <SelectTrigger>
                <SelectValue placeholder={t('recordatorios.card.label2PlaceHolder')} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.nombre} {/* Aquí asegúrate de que el campo sea el correcto */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campos restantes: Tipo, Fechas, Descripción */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-gray-800 tracking-wide border-b-2 border-blue-500 pb-1 inline-block dark:text-white" htmlFor="type">{t('recordatorios.card.label3')}</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder={t('recordatorios.card.label3PlaceHolder1')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacaciones">{t('recordatorios.card.label3PlaceHolder2')}</SelectItem>
                <SelectItem value="licencia">{t('recordatorios.card.label3PlaceHolder3')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fechas */}
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  <div className="space-y-2">
    <Label className="text-lg font-semibold text-gray-800 tracking-wide border-b-2 border-blue-500 pb-1 inline-block dark:text-white" >{t('recordatorios.card.label4')}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal sm:py-2 py-1"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate ? (
            format(startDate, "PPP", { locale: es })
          ) : (
            <span>{t('recordatorios.card.label4PlaceHolder')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-md p-0">
        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
      </PopoverContent>
    </Popover>
  </div>

  <div className="space-y-2">
    <Label className="text-lg font-semibold text-gray-800 tracking-wide border-b-2 border-blue-500 pb-1 inline-block dark:text-white" >{t('recordatorios.card.label5')}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal sm:py-2 py-1"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {endDate ? (
            format(endDate, "PPP", { locale: es })
          ) : (
            <span>{t('recordatorios.card.label5PlaceHolder')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-md p-0">
        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
      </PopoverContent>
    </Popover>
  </div>
</div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-gray-800 tracking-wide border-b-2 border-blue-500 pb-1 inline-block dark:text-white" >{t('recordatorios.card.label6')}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('recordatorios.card.label6PlaceHolder')}
            />
          </div>

          {/* Botón de enviar */}
          <Button className="w-full dark:bg-gray-900 dark:hover:bg-gray-700 dark:text-white" type="submit">{t('recordatorios.card.button')}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RecordatoriossForm;
