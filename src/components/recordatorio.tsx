"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
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

  useEffect(() => {
    const fetchRecordatorios = async () => {
      try {
        const q = collection(db, "Grupo_Pueble", selectedCompany, "recordatorios");
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log("No se encontraron recordatorios");
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

  const getStatusColor = (startDate: number | Date, endDate: number | Date) => {
    const today = new Date();
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    const daysRemaining = differenceInDays(end, today); // Días restantes hasta el final

    // Si faltan más de 5 días
    if (daysRemaining > 5) {
      return "bg-green-50 text-green-600 border-green-200";
    }

    // Si quedan 5 días o menos
    if (daysRemaining > 0) {
      return "bg-yellow-50 text-yellow-600 border-yellow-200";
    }

    // Si la fecha es hoy o ya ha pasado
    return "bg-red-50 text-red-600 border-red-200";
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-primary" />
            <span>Recordatorios</span>
          </CardTitle>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Seleccionar empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pueble SA - CASE IH">Pueble SA - CASE IH</SelectItem>
              <SelectItem value="KIA">KIA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {recordatorios.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordatorios.map((recordatorio) => {
              const startDate = recordatorio.fechaInicio.toDate();
              const endDate = recordatorio.fechaFin.toDate();
              const daysRemaining = differenceInDays(endDate, new Date());
              const statusColor = getStatusColor(startDate, endDate);

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
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="capitalize">
                      <InfoIcon className="w-4 h-4 mr-2" />
                      {recordatorio.tipo}
                    </Badge>
                    <div className="flex items-center text-xs space-x-2">
                      <UserIcon className="w-4 h-4" />
                      <span>
                        {`${recordatorio.nombre} ${recordatorio.apellido}`}
                      </span>
                    </div>
                  </div>

                  <p className="text-base font-semibold line-clamp-2">
                    {recordatorio.descripcion}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Inicio:</span>
                      </div>
                      <span>
                        {format(startDate, "PPP", { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Fin:</span>
                      </div>
                      <span>
                        {format(endDate, "PPP", { locale: es })}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs font-medium">
                      {daysRemaining > 0 
                        ? `${daysRemaining} días restantes` 
                        : daysRemaining === 0 
                          ? "Hoy" 
                          : "Vencido"}
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRecordatorio(recordatorio)} // Establece el recordatorio seleccionado
                        >
                          Detalles
                        </Button>
                      </DialogTrigger>

                      <DialogContent className={`
                    ${statusColor} 
                    border rounded-xl p-5 space-y-4 
                    transform transition-all duration-300 
                    hover:scale-105 hover:shadow-xl
                  `}>
                        <DialogHeader>
                          <DialogTitle>Detalles del Recordatorio</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                          {selectedRecordatorio && (
                            <>
                              <p><strong>Tipo:</strong> {selectedRecordatorio.tipo}</p>
                              <p><strong>Descripción:</strong> {selectedRecordatorio.descripcion}</p>
                              <p><strong>Empleado:</strong> {selectedRecordatorio.nombre} {selectedRecordatorio.apellido}</p>
                              <p><strong>Fecha de Inicio:</strong> {format(selectedRecordatorio.fechaInicio.toDate(), "PPP", { locale: es })}</p>
                              <p><strong>Fecha de Fin:</strong> {format(selectedRecordatorio.fechaFin.toDate(), "PPP", { locale: es })}</p>
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
          <div className="text-center py-10 space-y-4">
            <ClockIcon className="mx-auto w-12 h-12 text-gray-300" />
            <p className="text-base text-gray-500">
              No hay recordatorios próximos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Recordatorios;
