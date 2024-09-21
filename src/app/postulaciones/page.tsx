"use client"
import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react" // Usaremos este icono para la lupa

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
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null)
  const [searchVisible, setSearchVisible] = useState(false) // Estado para mostrar/ocultar el buscador
  const [searchTerm, setSearchTerm] = useState("") // Estado para almacenar el texto de búsqueda

  // Función para extraer el título del trabajo de la URL
  const handleAddJob = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/extract-job-title", { params: { url } });
      const jobTitle = response.data.title;
      const jobDescription = response.data.description;
  
      if (!jobDescription || jobDescription === "Descripción no disponible") {
        console.warn("Descripción no disponible o no extraída correctamente.");
      }
  
      const newBenefit = {
        id: benefits.length + 1,
        name: jobTitle,
        description: jobDescription || "Descripción no disponible",
        enrolled: 0,
      };
      setBenefits([...benefits, newBenefit]);
      setUrl("");
    } catch (error) {
      console.error("Error al extraer el título y la descripción de la oferta:", error);
    }
    setLoading(false);
  };

  // Función para cortar la descripción a solo 3 líneas
  const truncateDescription = (description: string) => {
    const maxLength = 120;
    return description.length > maxLength ? description.slice(0, maxLength) + "..." : description;
  };

  // Función para filtrar las publicaciones según el término de búsqueda
  const filteredBenefits = benefits.filter((benefit) =>
    benefit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Lupa para buscar publicaciones */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          onClick={() => setSearchVisible(!searchVisible)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {searchVisible && (
          <Input
            type="text"
            placeholder="Buscar por título"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        )}
      </div>

      {/* Mostrar las publicaciones extraídas */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredBenefits.length === 0 ? (
          <p className="text-l font-semibold">No hay publicaciones que coincidan con la búsqueda.</p>
        ) : (
          filteredBenefits.map((benefit) => (
            <Card key={benefit.id}>
              <CardHeader>
                <CardTitle>{benefit.name}</CardTitle>
                <CardDescription>{truncateDescription(benefit.description)}</CardDescription>
                {/* Botón para ver más detalles */}
                <Button onClick={() => setSelectedBenefit(benefit)}>
                  Ver detalles
                </Button>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Modal para mostrar la descripción completa */}
      {selectedBenefit && (
        <Dialog open={selectedBenefit !== null} onOpenChange={() => setSelectedBenefit(null)}>
          <DialogContent className="max-w-lg bg-white rounded-lg shadow-lg p-6  overflow-auto" style={{ maxHeight: "600px", width: "600px" }}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">{selectedBenefit.name}</DialogTitle>
              <p className="mt-2 text-sm text-gray-600">{selectedBenefit.description}</p>
            </DialogHeader>
            <Button className="bg-green-500 hover:bg-green-600" type="submit">Archivar</Button>
            <Button className="bg-red-500 hover:bg-red-600" type="submit">Eliminar</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
