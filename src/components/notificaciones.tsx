import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { 
  collection, 
  query, 
  getDocs, 
  Timestamp,
  doc,
  deleteDoc,
  addDoc
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

interface Recordatorio {
  id: string;
  tipo: string;
  descripcion: string;
  fechaInicio: Timestamp;
  fechaFin: Timestamp;
  empleadoId: string;
  nombre: string;
  apellido: string;
  empresa: string;
  archivedAt?: Timestamp;
}

const NotificationBell = () => {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchRecordatorios = async () => {
      try {
        const companies = ["Pueble SA - CASE IH", "KIA"];
        let allRecordatorios: Recordatorio[] = [];

        for (const company of companies) {
          const q = collection(db, "Grupo_Pueble", company, "recordatorios");
          const snapshot = await getDocs(q);
          
          const companyRecordatorios = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            empresa: company,
          } as Recordatorio));
          
          allRecordatorios = [...allRecordatorios, ...companyRecordatorios];
        }

        const activeRecordatorios = allRecordatorios.filter(recordatorio => {
          const daysRemaining = differenceInDays(
            recordatorio.fechaFin.toDate(),
            new Date()
          );
          return daysRemaining >= -1;
        });

        activeRecordatorios.sort((a, b) => 
          differenceInDays(a.fechaFin.toDate(), b.fechaFin.toDate())
        );

        setRecordatorios(activeRecordatorios);
        setUnreadCount(activeRecordatorios.length);
      } catch (error) {
        console.error("Error al obtener recordatorios:", error);
      }
    };

    fetchRecordatorios();
    const interval = setInterval(fetchRecordatorios, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const archiveNotification = async (recordatorio: Recordatorio) => {
    try {
      // Eliminar de la colección original
      const recordatorioRef = doc(db, "Grupo_Pueble", recordatorio.empresa, "recordatorios", recordatorio.id);
      await deleteDoc(recordatorioRef);

      // Agregar a la colección de archivados
      const archivedRef = collection(db, "Grupo_Pueble", recordatorio.empresa, "notificaciones_archivadas");
      await addDoc(archivedRef, {
        ...recordatorio,
        archivedAt: Timestamp.now()
      });

      // Actualizar el estado local
      setRecordatorios(prev => prev.filter(r => r.id !== recordatorio.id));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error("Error al archivar la notificación:", error);
    }
  };

  const getStatusColor = (fechaFin: Timestamp) => {
    const daysRemaining = differenceInDays(fechaFin.toDate(), new Date());
    
    if (daysRemaining > 5) return "text-green-600";
    if (daysRemaining > 0) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">{unreadCount}</span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <p className="font-semibold">Recordatorios</p>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {recordatorios.length > 0 ? (
            recordatorios.map((recordatorio) => (
              <DropdownMenuItem key={recordatorio.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="space-y-1 w-full">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className={`font-medium ${getStatusColor(recordatorio.fechaFin)}`}>
                        {recordatorio.tipo}
                      </span>
                      <span className="text-xs text-gray-500">
                        {recordatorio.empresa}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {format(recordatorio.fechaFin.toDate(), "dd MMM", { locale: es })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          archiveNotification(recordatorio);
                        }}
                      >
                        <Archive className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {recordatorio.descripcion}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {recordatorio.nombre} {recordatorio.apellido}
                    </span>
                    <span className={`text-xs font-medium ${getStatusColor(recordatorio.fechaFin)}`}>
                      {differenceInDays(recordatorio.fechaFin.toDate(), new Date()) === 0 ? (
                        "Vence hoy"
                      ) : (
                        `${Math.abs(differenceInDays(recordatorio.fechaFin.toDate(), new Date()))} días
                        ${differenceInDays(recordatorio.fechaFin.toDate(), new Date()) > 0 ? "restantes" : "vencido"}`
                      )}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              No hay recordatorios pendientes
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;