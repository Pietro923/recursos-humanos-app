"use client"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const CompanyChart = () => {
  const { t } = useTranslation();

 // Variants for animation
 const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

return (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="w-full p-6 bg-white rounded-2xl shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800"
  >
    <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-900 dark:text-gray-100 border-b pb-3 border-gray-200 dark:border-gray-700">
      {t('beneficios.organization_chart.title')}
    </h2>

    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top Level - General Manager */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-center mb-6"
      >
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-xl shadow-md text-center w-full max-w-md">
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            Gerente General
          </p>
          <p className="text-blue-800 dark:text-blue-200">Christian de la Vega</p>
        </div>
      </motion.div>

      {/* Second Level Departments */}
      <motion.div 
        variants={itemVariants}
        className="grid md:grid-cols-3 gap-4 lg:grid-cols-5"
      >
        {/* Administrative Manager */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow-md">
          <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">
            Gerente Administrativo
          </h3>
          <p className="text-gray-800 dark:text-gray-300 mb-3">
            Fatima Zamorano
          </p>
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-400">
            <li>📊 Contabilidad: Victoria Lobo</li>
            <li>💰 Tesoreria: Guadalupe Terán Nougues</li>
            <li>🛒 Compras: Carlos Acevedo</li>
            <li>📣 Marketing: Silvina Durso</li>
            <li>🔧 Mantenimiento: Enrique Geréz</li>
            <li>🧹 Limpieza: Romina Salinas</li>
          </ul>
        </div>

        {/* Product Sales */}
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-xl shadow-md">
          <h3 className="font-bold mb-2 text-green-900 dark:text-green-100">
            Vendedor Producto
          </h3>
          <ul className="text-sm space-y-1 text-green-800 dark:text-green-300">
            <li>Cesar Guerra</li>
            <li>Hernan Gómez</li>
            <li>Rogelio Geréz</li>
          </ul>
        </div>

        {/* AFS and CR Leader */}
        <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-xl shadow-md">
          <h3 className="font-bold mb-2 text-purple-900 dark:text-purple-100">
            Lider AFS y CR
          </h3>
          <p className="text-sm text-purple-800 dark:text-purple-300">
            Tecnico CR y Especialista AFS
          </p>
          <p className="text-purple-800 dark:text-purple-300">
            Nicolas Fernández
          </p>
        </div>

        {/* Management and CX Control */}
        <div className="bg-teal-100 dark:bg-teal-900 p-4 rounded-xl shadow-md">
          <h3 className="font-bold mb-2 text-teal-900 dark:text-teal-100">
            Control de Gestion y CX
          </h3>
          <p className="text-teal-800 dark:text-teal-300">
            Agustina Palacios
          </p>
        </div>

        {/* After-Sales Manager */}
        <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-xl shadow-md">
          <h3 className="font-bold mb-2 text-orange-900 dark:text-orange-100">
            Gerente Post Venta
          </h3>
          <p className="text-orange-800 dark:text-orange-300 mb-3">
            Angel Ortiz
          </p>
          <ul className="text-sm space-y-1 text-orange-700 dark:text-orange-400">
            <li>🤝 Asesor Servicios: Gabriel Galván</li>
            <li>📋 Administrativo Taller: Lucas Lanzulli</li>
            <li>🛠️ Ing. Soporte: Ernesto Fernández</li>
            <li>📦 Jefe de Depósito: Juan Jose Medina</li>
            <li>✅ Garantista: Lorena Saavedra</li>
            <li>🔩 Jefe de Repuestos: Maximiliano Dietrich</li>
          </ul>
        </div>
      </motion.div>

      {/* Lower Levels */}
      <motion.div 
        variants={itemVariants}
        className="grid md:grid-cols-3 gap-4"
      >
        {/* Deposit Auxiliary */}
        <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-xl shadow-md">
          <h3 className="font-bold mb-2 text-indigo-900 dark:text-indigo-100">
            Auxiliar Depósito
          </h3>
          <p className="text-indigo-800 dark:text-indigo-300">
            Carlos Zelaya
          </p>
        </div>

        {/* Spare Parts Sales */}
        <div className="bg-pink-100 dark:bg-pink-900 p-4 rounded-xl shadow-md">
          <h3 className="font-bold mb-2 text-pink-900 dark:text-pink-100">
            Vendedores de Repuestos
          </h3>
          <ul className="text-sm space-y-1 text-pink-800 dark:text-pink-300">
            <li>Mostrador: Nicolas Cuadra</li>
            <li>Campo: Luis Geréz</li>
          </ul>
        </div>

        {/* Technical Team */}
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-xl shadow-md">
          <h3 className="font-bold mb-2 text-red-900 dark:text-red-100">
            Equipo Técnico
          </h3>
          <ul className="text-sm space-y-1 text-red-800 dark:text-red-300 grid grid-cols-2">
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
      </motion.div>
    </motion.div>
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