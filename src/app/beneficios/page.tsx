"use client"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const CompanyChart = () => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full p-4 bg-white rounded-lg shadow-lg dark:text-white dark:bg-gray-900 border dark:border-gray-800"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        {t('beneficios.organization_chart.title')}
      </h3>
      <div className="flex flex-col items-center">
        {/* Gerente General */}
        <div className="text-center mb-4">
          <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow">
            <p className="font-bold">Gerente General: Christian de la Vega</p>
          </div>
        </div>

        {/* Nivel 1 */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">

          {/* Gerente Administrativo */}
          <div className="text-center">
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow">
              <p className="font-bold">Gerente Administrativo: Fatima Zamorano</p>
            </div>
            <div className="ml-6 mt-2">
              <ul className="text-sm text-left">
                <li>Contabilidad: Victoria Lobo</li>
                <li>Tesoreria: Guadalupe Terán Nougues</li>
                <li>Compras: Carlos Acevedo</li>
                <li>Marketing: Silvina Durso</li>
                <li>Mantenimiento: Enrique Geréz</li>
                <li>Limpieza: Romina Salinas</li>
              </ul>
            </div>
          </div>

           {/* Vendedor Producto */}
           <div className="text-center">
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow">
              <p className="font-bold">Vendedor Producto</p>
              <p className="text-sm">Cesar Guerra</p>
              <p className="text-sm">Hernan Gómez</p>
              <p className="text-sm">Rogelio Geréz</p>
            </div>
          </div>
          
          {/* Lider AFS y CR */}
          <div className="text-center">
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow">
              <p className="font-bold">Lider AFS y CR</p>
            </div>
            <div className="ml-6 mt-2">
              <p className="text-sm">Tecnico CR y Especialista AFS</p>
              <p className="text-sm">Nicolas Fernández</p>
            </div>
          </div>

          {/* Control de Gestion y CX */}
          <div className="text-center">
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow">
              <p className="font-bold">Control de Gestion y CX</p>
              <p className="text-sm">Agustina Palacios</p>
            </div>
          </div>

          {/* Gerente Post Venta */}
          <div className="text-center">
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow">
              <p className="font-bold">Gerente Post Venta: Angel Ortiz</p>
            </div>
            <div className="ml-6 mt-2">
              <ul className="text-sm text-left">
                <li>Asesor Servicios: Gabriel Galván</li>
                <li>Administrativo Taller: Lucas Lanzulli</li>
                <li>Ing. Soporte: Ernesto Fernández</li>
                <li>Jefe de Depósito: Juan Jose Medina</li>
                <li>Garantista: Lorena Saavedra</li>
                <li>Jefe de Repuestos: Maximiliano Dietrich</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Subniveles */}
        <div className="flex flex-wrap justify-center gap-4">
          {/* Jefe de Depósito */}
          <div className="text-center">
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow">
              <p className="font-bold">Auxiliar Depósito</p>
              <p className="text-sm">Carlos Zelaya</p>
            </div>
          </div>

          {/* Jefe de Repuestos */}
          <div className="text-center">
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow">
              <p className="font-bold">Vendedores de Repuestos</p>
              <ul className="text-sm">
                <li>Mostrador: Nicolas Cuadra</li>
                <li>Campo: Luis Geréz</li>
              </ul>
            </div>
          </div>

          {/* Jefe de Taller */}
          <div className="text-center">
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow">
              <p className="font-bold">Equipo Técnico</p>
              <ul className="text-sm">
                <li>Jesus Abregú</li>
                <li>Ramón Montenegro</li>
                <li>Franco Montenegro</li>
                <li>Augusto Montenegro</li>
                <li>Agustín Castro</li>
                <li>Claudio Gutierrez</li>
                <li>Andrés Sosa</li>
                <li>Rafael Pavon</li>
                <li>Agustin Pereyra</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const PrintableBenefits = () => {
  const { t } = useTranslation();

  const allBenefits = [
    {
      category: t("beneficios.categories.free_time"),
      items: [
        t("beneficios.benefits.free_time1"),
        t("beneficios.benefits.free_time2"),
        t("beneficios.benefits.free_time3"),
        t("beneficios.benefits.free_time4")
      ],
    },
    {
      category: t("beneficios.categories.health_and_wellness"),
      items: [
        t("beneficios.benefits.health1"),
        t("beneficios.benefits.health2")
      ],
    },
    {
      category: t("beneficios.categories.financial_benefits"),
      items: [
        t("beneficios.benefits.financial1"),
        t("beneficios.benefits.financial2"),
        t("beneficios.benefits.financial3")
      ],
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 print:p-4 dark:text-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border dark:border-gray-800"
    >
      <div className="flex justify-between items-center print:hidden">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          {t('beneficios.benefits_list.title')}
        </h3>
        <Button 
          onClick={() => window.print()} 
          variant="outline" 
          size="sm" 
          className="hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Printer className="mr-2 h-4 w-4" />
          {t('beneficios.benefits_list.print_button')}
        </Button>
      </div>
      <div className="space-y-6">
        {allBenefits.map((category, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            className="space-y-2 bg-white dark:bg-gray-950 p-4 rounded-lg shadow-sm"
          >
            <h4 className="font-bold text-lg text-gray-700 dark:text-gray-300 border-b pb-2 dark:border-gray-800">
              {category.category}
            </h4>
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-500 dark:marker:text-blue-400">
              {category.items.map((item, itemIdx) => (
                <li 
                  key={itemIdx} 
                  className="text-slate-600 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default function BenefitsPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-8 space-y-8 dark:text-white">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('beneficios.page_title')}
        </h1>
        <p className="text-slate-600 dark:text-gray-300">
          {t('beneficios.page_description')}
        </p>
      </motion.div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">{t('beneficios.tabs.printable_list')}</TabsTrigger>
          <TabsTrigger value="org">{t('beneficios.tabs.organization_chart')}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <PrintableBenefits />
        </TabsContent>

        <TabsContent value="org">
          <CompanyChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}