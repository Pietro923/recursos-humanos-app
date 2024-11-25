"use client"
import { Button } from "@/components/ui/button"
import { Printer, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CompanyChart = () => (
  <div className="w-full p-4 bg-white rounded-lg shadow">
    <h3 className="text-xl font-semibold mb-4">Organigrama de la Compañía</h3>
    <div className="aspect-video bg-slate-50 rounded-lg p-4 flex items-center justify-center">
      {/* Aquí podrías integrar el organigrama real de la empresa */}
      <p className="text-slate-500">Organigrama de la Empresa</p>
    </div>
  </div>
);

const PrintableBenefits = () => {
  const allBenefits = [
    { category: "Tiempo Libre", items: [
      "20 días de vacaciones pagadas al año",
      "Día de cumpleaños libre",
      "Paternidad extendida",
      "Maternidad extendida"
    ]},
    { category: "Salud y Bienestar", items: [
      "Seguro Médico completo para empleados y familiares directos",
      "Membresía gratuita en gimnasio local"
    ]},
    { category: "Beneficios Financieros", items: [
      "Plan de Pensiones con contribución del 5%",
      "Bono por inicio de clases",
      "Caja navideña"
    ]}
  ];

  return (
    <div className="space-y-6 print:p-4">
      <div className="flex justify-between items-center print:hidden">
        <h3 className="text-xl font-semibold">Lista Completa de Beneficios</h3>
        <Button onClick={() => window.print()} variant="outline" size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </div>
      <div className="space-y-6">
        {allBenefits.map((category, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="font-medium text-lg">{category.category}</h4>
            <ul className="list-disc pl-6 space-y-2">
              {category.items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-slate-600">{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function BenefitsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Beneficios para Empleados</h1>
        <p className="text-slate-600">Descubre todos los beneficios disponibles para nuestro equipo</p>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Lista Imprimible</TabsTrigger>
          <TabsTrigger value="org">Organigrama</TabsTrigger>
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