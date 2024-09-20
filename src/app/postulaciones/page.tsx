"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input" // Asegúrate de tener este componente
import { Button } from "@/components/ui/button" // Para el botón de agregar
import axios from "axios"

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState([
    { id: 1, name: "Front End Developer (Tucuman)", description: "San Miguel de Tucumán, Tucumán, Argentina · Híbrido Jornada completa · Sin experiencia", enrolled: 95 },
    
  ])

  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)

  // Función para extraer el título del trabajo de la URL
  const handleAddJob = async () => {
    setLoading(true)
    try {
      const response = await axios.get("/api/extract-job-title", { params: { url } })
      const jobTitle = response.data.title

      // Agregar nueva oferta a la lista
      const newBenefit = {
        id: benefits.length + 1,
        name: jobTitle,
        description: "Descripción extraída automáticamente de la publicación de LinkedIn",
        enrolled: 0,
      }
      setBenefits([...benefits, newBenefit])
      setUrl("") // Limpiar el campo de URL
    } catch (error) {
      console.error("Error al extraer el título de la oferta:", error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Postulaciones de trabajo</h1> 

      {/* Input para agregar URL de la publicación */}
      <div className="flex space-x-4 items-center">
        <Input
          type="url"
          placeholder="Pegar URL de LinkedIn"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={handleAddJob} disabled={loading || !url}>
          {loading ? "Cargando..." : "Agregar Publicación"}
        </Button>
      </div>

      {/* Mostrar los beneficios / publicaciones */}
      <div className="grid gap-4 md:grid-cols-2">
        {benefits.map((benefit) => (
          <Card key={benefit.id}>
            <CardHeader>
              <CardTitle>{benefit.name}</CardTitle>
              <CardDescription>{benefit.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
