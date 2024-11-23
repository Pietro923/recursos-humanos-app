"use client"
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

  useEffect(() => {
    const fetchArchivedNotifications = async () => {
      try {
        const companies = ["Pueble SA - CASE IH", "KIA"];
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

  const getStatusColor = (fechaFin: Timestamp) => {
    const daysRemaining = differenceInDays(fechaFin.toDate(), new Date());
    
    if (daysRemaining > 5) return "text-green-600";
    if (daysRemaining > 0) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Notificaciones Archivadas</h1>
      <div className="bg-white rounded-lg shadow">
        {archivedNotifications.length > 0 ? (
          <div className="divide-y">
            {archivedNotifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className={`font-medium ${getStatusColor(notification.fechaFin)}`}>
                        {notification.tipo}
                      </span>
                      <span className="text-sm text-gray-500">
                        {notification.empresa}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Archivado el {format(notification.archivedAt.toDate(), "dd MMM yyyy", { locale: es })}
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {notification.descripcion}
                  </p>
                  <div className="flex justify-between items-center">
                {/* Nombre y apellido del empleado */}
                <div className="text-sm text-gray-500">
                    {notification.nombre} {notification.apellido}
                </div>

                {/* Estado del recordatorio */}
                    <div className="text-right">
                        {/* Estado con días restantes o vencido */}
                        <span className={`text-sm font-medium block ${getStatusColor(notification.fechaFin)}`}>
                        {differenceInDays(notification.fechaFin.toDate(), new Date()) === 0
                            ? "Vence hoy"
                            : `${Math.abs(differenceInDays(notification.fechaFin.toDate(), new Date()))} días 
                            ${differenceInDays(notification.fechaFin.toDate(), new Date()) > 0 ? "restantes" : "vencido"}`}
                        </span>

                        {/* Fecha de vencimiento */}
                        <time
                        className="text-xs text-gray-500"
                        dateTime={notification.fechaFin.toDate().toISOString()}
                        >
                        Vence el {format(notification.fechaFin.toDate(), "dd MMM yyyy", { locale: es })}
                        </time>
                    </div>
                </div>
            </div>
        </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No hay notificaciones archivadas
          </div>
        )}
      </div>
    </div>
  );
}