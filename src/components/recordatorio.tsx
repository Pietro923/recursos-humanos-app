"use client";
// ESTE COMPONENTE ES PARA EL COMPONENTE DEL DASHBOARD
import { useEffect, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // Tu configuración de Firebase
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClockIcon, 
  CalendarIcon, 
  UserIcon, 
  InfoIcon 
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface Recordatorio {
  id: string;
  tipo: string;
  descripcion: string;
  fechaInicio: Timestamp;
  fechaFin: Timestamp;
  empleadoId: string;
  nombre: string;
  apellido: string;
  empresa: string; // Agregamos este campo
}

function Recordatorios() {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("Pueble SA - CASE IH");
  const [selectedRecordatorio, setSelectedRecordatorio] = useState<Recordatorio | null>(null); // Estado para el recordatorio seleccionado
  const { t } = useTranslation(); // Hook de traducción dentro del componente funcional
  
  useEffect(() => {
    const fetchRecordatorios = async () => {
      try {
        const q = collection(db, "Grupo_Pueble", selectedCompany, "recordatorios");
        const snapshot = await getDocs(q);
  
        if (snapshot.empty) {
          console.log("No se encontraron recordatorios");
          setRecordatorios([]); // Limpia el estado si no hay recordatorios
          return;
        }
  
        const data: Recordatorio[] = snapshot.docs.map((doc) => {
          const record = doc.data();
          return {
            id: doc.id,
            tipo: record.tipo || "",
            descripcion: record.descripcion || "",
            fechaInicio: record.fechaInicio || Timestamp.fromDate(new Date()),
            fechaFin: record.fechaFin || Timestamp.fromDate(new Date()),
            empleadoId: record.empleadoId || "",
            nombre: record.nombre || "",
            apellido: record.apellido || "",
            empresa: selectedCompany, // Agregamos la empresa actual
          };
        });
  
        console.log("Recordatorios obtenidos:", data);
        setRecordatorios(data);
      } catch (error) {
        console.error("Error al obtener recordatorios:", error);
      }
    };
  
    fetchRecordatorios();
  }, [selectedCompany]);

  const getStatusColor = (recordatorio: Recordatorio) => {
    const today = new Date();
    const endDate = recordatorio.fechaFin.toDate(); // Fin de la fecha del recordatorio
    const daysRemaining = differenceInDays(endDate, today); // Calculamos los días restantes
  
    // Si la notificación es de tipo "Cumpleaños", asignar color azul
    if (recordatorio.tipo === "Cumpleaños") {
      return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:border-blue-600";
    }
  
    // Si faltan más de 5 días
    if (daysRemaining > 5) {
      return "bg-green-50 text-green-600 border-green-200 dark:bg-green-700 dark:text-green-100 dark:border-green-600";
    }
  
    // Si quedan 5 días o menos
    if (daysRemaining > 0) {
      return "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-700 dark:text-yellow-100 dark:border-yellow-600";
    }
  
    // Si la fecha es hoy o ya ha pasado
    return "bg-red-50 text-red-600 border-red-200 dark:bg-red-700 dark:text-red-100 dark:border-red-600";
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg ">
      <CardHeader className="bg-gray-50 border-b dark:bg-gray-950 dark:text-gray-100">
        {/* Flex container with responsive behavior */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-primary" />
            <span>{t('notificationBell.title')}</span>
          </CardTitle>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder={t('selectCompany')} />
            </SelectTrigger>
            <SelectContent className="z-50 max-h-60 overflow-y-auto">
              <SelectItem value="Pueble SA - CASE IH">Pueble SA - CASE IH</SelectItem>
              <SelectItem value="KIA">KIA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-6 dark:text-gray-100">
        {recordatorios.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordatorios.map((recordatorio) => {
  const startDate = recordatorio.fechaInicio.toDate();
  const endDate = recordatorio.fechaFin.toDate();
  const daysRemaining = differenceInDays(endDate, new Date()); // Calculamos los días restantes
  const statusColor = getStatusColor(recordatorio);  // Pasa el objeto recordatorio directamente

  return (
    <div
      key={recordatorio.id}
      className={` 
        ${statusColor} 
        border rounded-xl p-5 space-y-4 
        transform transition-all duration-300 
        hover:scale-105 hover:shadow-xl
      `}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        {/* Badge Section */}
        <Badge variant="outline" className="capitalize flex items-center">
          <InfoIcon className="w-4 h-4 mr-2" />
          {recordatorio.tipo}
        </Badge>

        {/* Name Section */}
        <div className="flex items-center text-xs space-x-2 sm:ml-4">
          <UserIcon className="w-4 h-4" />
          <span>{`${recordatorio.nombre} ${recordatorio.apellido}`}</span>
        </div>
      </div>

      <p className="text-base font-semibold line-clamp-2">
        {recordatorio.descripcion}
      </p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span>{t('startDate')}:</span>
          </div>
          <span>{format(startDate, "PPP", { locale: es })}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span>{t('endDate')}:</span>
          </div>
          <span>{format(endDate, "PPP", { locale: es })}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t">
        <span className="text-xs font-medium">
          {daysRemaining > 0
            ? `${daysRemaining} ${t('remainingDays')}`
            : daysRemaining === 0
            ? t('today')
            : t('expired')}
        </span>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedRecordatorio(recordatorio)} // Establece el recordatorio seleccionado
            >
              {t('details')}
            </Button>
          </DialogTrigger>

          <DialogContent className={`
            ${statusColor} 
            border rounded-xl p-5 space-y-4 
            transform transition-all duration-300 
            hover:scale-105 hover:shadow-xl
          `}>
            <DialogHeader>
              <DialogTitle>{t('reminderDetails')}</DialogTitle>
            </DialogHeader>
            <DialogDescription className="dark:text-white">
              {selectedRecordatorio && (
                <>
                  <p><strong>{t('type')}:</strong> {selectedRecordatorio.tipo}</p>
                  <p><strong>{t('description')}:</strong> {selectedRecordatorio.descripcion}</p>
                  <p><strong>{t('employee')}:</strong> {selectedRecordatorio.nombre} {selectedRecordatorio.apellido}</p>
                  <p><strong>{t('startDate')}:</strong> {format(selectedRecordatorio.fechaInicio.toDate(), "PPP", { locale: es })}</p>
                  <p><strong>{t('endDate')}:</strong> {format(selectedRecordatorio.fechaFin.toDate(), "PPP", { locale: es })}</p>
                </>
              )}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
})}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-300">{t('notificationBell.noReminders')}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default Recordatorios;