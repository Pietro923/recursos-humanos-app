"use client"
import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from "axios"

// Definir el tipo de "benefit"
interface Benefit {
  id: number
  name: string
  description: string
  enrolled: number
}

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]) // Lista vacía con tipado correcto
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)

  // Función para extraer el título del trabajo de la URL
  const handleAddJob = async () => {
    setLoading(true)
    try {
      const response = await axios.get("/api/extract-job-title", { params: { url } })
      const jobTitle = response.data.title

      // Agregar nueva oferta a la lista
      const newBenefit: Benefit = {
        id: benefits.length + 1, // Incrementa el ID de forma dinámica
        name: jobTitle,
        description: "Descripción extraída automáticamente de la publicación de LinkedIn",
        enrolled: 0, // Puedes cambiar este valor o manejarlo de otra manera si lo necesitas
      }
      setBenefits([...benefits, newBenefit]) // Actualiza la lista con la nueva oferta
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

      {/* Mostrar las publicaciones extraídas */}
      <div className="grid gap-4 md:grid-cols-2">
        {benefits.length === 0 ? (
          <p className="text-l font-semibold">No hay publicaciones aún. Agrega una nueva.</p>
        ) : (
          benefits.map((benefit) => (
            <Card key={benefit.id}>
              <CardHeader>
                <CardTitle>{benefit.name}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
