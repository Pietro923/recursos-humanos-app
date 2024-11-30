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
      <div className="aspect-video bg-slate-50 dark:bg-gray-950 rounded-lg p-4 flex items-center justify-center border dark:border-gray-800 transition-all hover:shadow-md">
        <p className="text-slate-500 dark:text-gray-400 text-center">
          {t('beneficios.organization_chart.placeholder')}
        </p>
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