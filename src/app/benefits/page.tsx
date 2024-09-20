import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function BenefitsPage() {
  const benefits = [
    { id: 1, name: "Seguro Médico", description: "Cobertura médica completa para empleados y familiares directos", enrolled: 95 },
    { id: 2, name: "Plan de Pensiones", description: "Contribución del 5% del salario con igualación de la empresa", enrolled: 80 },
    { id: 3, name: "Días de Vacaciones", description: "20 días de vacaciones pagadas al año", enrolled: 100 },
    { id: 4, name: "Gimnasio", description: "Membresía gratuita en gimnasio local", enrolled: 60 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Beneficios para Empleados</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {benefits.map((benefit) => (
          <Card key={benefit.id}>
            <CardHeader>
              <CardTitle>{benefit.name}</CardTitle>
              <CardDescription>{benefit.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{benefit.enrolled}% de empleados inscritos</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}