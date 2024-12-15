"use client"
// PAGE DE HISTORIAL DE NOTIFICACIONES
import { useEffect, useState } from "react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  collection,
  query,
  getDocs,
  Timestamp,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { Archive, Clock, User, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ArchivedNotification {
  id: string;
  tipo: string;
  descripcion: string;
  fechaInicio: Timestamp;
  fechaFin: Timestamp;
  empleadoId: string;
  nombre: string;
  apellido: string;
  empresa: string;
  archivedAt: Timestamp;
}

export default function ArchivedNotifications() {
  const [archivedNotifications, setArchivedNotifications] = useState<ArchivedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation(); // Hook de traducción
  
  useEffect(() => {
    const fetchArchivedNotifications = async () => {
      try {
        // Obtener dinámicamente las empresas
        const collectionRef = collection(db, "Grupo_Pueble");
        const companiesSnapshot = await getDocs(collectionRef);
        const companies = companiesSnapshot.docs.map(doc => doc.id);
  
        let allNotifications: ArchivedNotification[] = [];
        for (const company of companies) {
          const q = query(
            collection(db, "Grupo_Pueble", company, "notificaciones_archivadas"),
            orderBy("archivedAt", "desc")
          );
          const snapshot = await getDocs(q);
          
          const companyNotifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            empresa: company,
          } as ArchivedNotification));
          
          allNotifications = [...allNotifications, ...companyNotifications];
        }
  
        // Ordenar por fecha de archivado
        allNotifications.sort((a, b) => 
          b.archivedAt.toDate().getTime() - a.archivedAt.toDate().getTime()
        );
  
        setArchivedNotifications(allNotifications);
      } catch (error) {
        console.error("Error al obtener notificaciones archivadas:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchArchivedNotifications();
  }, []);
  const getStatusColor = (tipo: string, fechaFin: Timestamp) => {
    if (tipo === "Cumpleaños") return "text-blue-600"; // Azul para cumpleaños
    
    const daysRemaining = differenceInDays(fechaFin.toDate(), new Date());
    
    if (daysRemaining > 5) return "text-green-600";
    if (daysRemaining > 0) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center dark:text-white">
        <Archive className="mr-3 text-gray-600 dark:text-gray-300" size={32} />
        {t('notificaciones.title')}
      </h1>
      
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-gray-950 ">
        {archivedNotifications.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800 ">
            {archivedNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className="p-5 transition-colors duration-200 
                           hover:bg-gray-50 dark:hover:bg-gray-800 
                           group relative"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className={`font-semibold ${getStatusColor(notification.tipo, notification.fechaFin)}`}>
                        {notification.tipo}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {notification.empresa}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Archive className="mr-1.5 opacity-50" size={14} />
                      {format(notification.archivedAt.toDate(), "dd MMM yyyy", { locale: es })}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 dark:text-gray-200 text-sm">
                    {notification.descripcion}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    {/* Employee Name */}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <User className="mr-2 opacity-50" size={16} />
                      {notification.nombre} {notification.apellido}
                    </div>

                    {/* Expiration Details */}
                    <div className="text-right">
                      <span 
                        className={`text-sm font-medium block ${getStatusColor(notification.tipo, notification.fechaFin)}`}
                      >
                        {differenceInDays(notification.fechaFin.toDate(), new Date()) === 0
                          ? "Vence hoy"
                          : `${Math.abs(differenceInDays(notification.fechaFin.toDate(), new Date()))} días 
                             ${differenceInDays(notification.fechaFin.toDate(), new Date()) > 0 ? "restantes" : "vencido"}`}
                      </span>
                      <time
                        className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end"
                        dateTime={notification.fechaFin.toDate().toISOString()}
                      >
                        <Clock className="mr-1.5 opacity-50" size={12} />
                        {t('notificaciones.vence')} {format(notification.fechaFin.toDate(), "dd MMM yyyy", { locale: es })}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-white flex flex-col items-center">
            <AlertTriangle className="mb-4 text-gray-300" size={48} />
            <p>{t('notificaciones.nonotis')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
