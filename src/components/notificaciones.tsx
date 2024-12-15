import { useState, useEffect } from "react";
// ESTE ES EL COMPONENTE QUE MUESTRA EN LA CAMPANITAAA
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
  getDocs, 
  Timestamp,
  doc,
  deleteDoc,
  addDoc
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
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
  empresa: string;
  archivedAt?: Timestamp;
}

const NotificationBell = () => {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [, setCompanies] = useState<string[]>([]); // Empresas dinámicas
  const { t } = useTranslation(); // Hook de traducción dentro del componente funcional

  useEffect(() => {
  const fetchCompaniesAndRecordatorios = async () => {
    try {
      // Obtener dinámicamente las empresas
      const collectionRef = collection(db, "Grupo_Pueble");
      const snapshot = await getDocs(collectionRef);
      const companyNames = snapshot.docs.map(doc => doc.id);
      
      // Actualizar estado de empresas
      setCompanies(companyNames);

      // Obtener recordatorios para todas las empresas obtenidas
      let allRecordatorios: Recordatorio[] = [];
      for (const company of companyNames) {
        const q = collection(db, "Grupo_Pueble", company, "recordatorios");
        const recordatorioSnapshot = await getDocs(q);
        
        const companyRecordatorios = recordatorioSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          empresa: company,
        } as Recordatorio));
        
        allRecordatorios = [...allRecordatorios, ...companyRecordatorios];
      }

      // Filtrar recordatorios activos
      const activeRecordatorios = allRecordatorios.filter(recordatorio => {
        const daysRemaining = differenceInDays(
          recordatorio.fechaFin.toDate(),
          new Date()
        );
        return daysRemaining >= -1;
      });

      // Ordenar recordatorios
      activeRecordatorios.sort((a, b) => 
        differenceInDays(a.fechaFin.toDate(), b.fechaFin.toDate())
      );

      // Actualizar estados
      setRecordatorios(activeRecordatorios);
      setUnreadCount(activeRecordatorios.length);

    } catch (error) {
      console.error("Error al obtener recordatorios:", error);
    }
  };

  // Llamada inicial
  fetchCompaniesAndRecordatorios();

  // Configurar intervalo de actualización
  const interval = setInterval(fetchCompaniesAndRecordatorios, 2 * 60 * 1000);

  // Limpiar intervalo al desmontar el componente
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

  const getStatusColor = (recordatorio: Recordatorio) => {
    // Si la notificación es de tipo "Cumpleaños"
    if (recordatorio.tipo === "Cumpleaños") {
      return "text-blue-600"; // Color azul para "Cumpleaños"
    }
  
    // Si no es "Cumpleaños", se aplica la lógica existente
    const daysRemaining = differenceInDays(recordatorio.fechaFin.toDate(), new Date());
    
    if (daysRemaining > 5) return "text-green-600";
    if (daysRemaining > 0) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative dark:text-white">
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
          <p className="font-semibold">{t('notificationBell.title')}</p>
        </div>
        <div className="max-h-[70vh] overflow-y-auto ">
          {recordatorios.length > 0 ? (
            recordatorios.map((recordatorio) => (
              <DropdownMenuItem key={recordatorio.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600">
                <div className="space-y-1 w-full ">
                  <div className="flex justify-between items-start ">
                    <div className="flex flex-col ">
                      <span className={`font-medium ${getStatusColor(recordatorio)}`}>
                        {recordatorio.tipo}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-white">
                        {recordatorio.empresa}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-white">
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
                        <Archive className="h-4 w-4 text-gray-500 dark:text-white" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 dark:text-white">
                    {recordatorio.descripcion}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-white">
                      {recordatorio.nombre} {recordatorio.apellido}
                    </span>
                    <span className={`font-medium ${getStatusColor(recordatorio)}`}>
                      {differenceInDays(recordatorio.fechaFin.toDate(), new Date()) === 0 ? (
                        t('notificationBell.status.todayExpires')
                      ) : (
                        `${Math.abs(differenceInDays(recordatorio.fechaFin.toDate(), new Date()))} ${t('notificationBell.status.daysRemaining', { days: Math.abs(differenceInDays(recordatorio.fechaFin.toDate(), new Date())) })}`
                      )}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              {t('notificationBell.noReminders')}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
