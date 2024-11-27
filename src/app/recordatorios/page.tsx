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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";

const RecordatoriosForm = () => {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [employees, setEmployees] = useState<any[]>([]); // Lista de empleados
  const [employee, setEmployee] = useState<string>(""); // Empleado seleccionado
  const [type, setType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [description, setDescription] = useState<string>("");
  const companies = ["Pueble SA - CASE IH", "KIA"]; // Empresas disponibles
  const { toast } = useToast();

  // Cargar empleados de la empresa seleccionada
  useEffect(() => {
    const fetchEmployees = async () => {
      if (selectedCompany !== "") {
        // Acceder a la subcolección de empleados en la empresa seleccionada
        const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados");
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesData = employeesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
        description: "Por favor completa todos los campos",
      });
      return;
    }
  
    if (endDate < startDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La fecha de fin no puede ser anterior a la fecha de inicio",
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
          description: "Empleado seleccionado no encontrado",
        });
        return;
      }
  
      // Definir la colección de recordatorios según la empresa seleccionada
      const recordatoriosRef = collection(db, "Grupo_Pueble", selectedCompany, "recordatorios");
  
      // Guardar el recordatorio en la colección correspondiente
      await addDoc(recordatoriosRef, {
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
        title: "¡Éxito!",
        description: "Recordatorio agregado correctamente",
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
        description: "Error al guardar el recordatorio",
      });
      console.error("Error al agregar recordatorio:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Nuevo Recordatorio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de la empresa */}
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empresa" />
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
            <Label htmlFor="employee">Empleado</Label>
            <Select value={employee} onValueChange={setEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empleado" />
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
            <Label htmlFor="type">Tipo de Recordatorio</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacaciones">Vacaciones</SelectItem>
                <SelectItem value="licencia">Licencia</SelectItem>
                <SelectItem value="cumpleaños">Cumpleaños</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales"
              className="h-32"
            />
          </div>

          <Button type="submit" className="w-full dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
            Guardar Recordatorio
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RecordatoriosForm;
