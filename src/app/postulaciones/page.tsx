"use client"
import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

  // Estados para el popup de registro de empleados
  const [showEmployeePopup, setShowEmployeePopup] = useState(false) // Controla la visibilidad del segundo popup
  const [employeeName, setEmployeeName] = useState("")
  const [employeeLastName, setEmployeeLastName] = useState("")
  const [employeeDepartment, setEmployeeDepartment] = useState("")

  // Estado para el popup intermedio de confirmación
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)

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

  // Función para registrar el empleado
  const handleRegisterEmployee = async () => {
    try {
      // Lógica para enviar datos a la API
      await axios.post("/api/register-employee", {
        name: employeeName,
        lastName: employeeLastName,
        department: employeeDepartment,
      })
      console.log("Empleado registrado exitosamente")
      // Limpiar los campos y cerrar el popup
      setEmployeeName("")
      setEmployeeLastName("")
      setEmployeeDepartment("")
      setShowEmployeePopup(false)
    } catch (error) {
      console.error("Error al registrar el empleado:", error)
    }
  }

  // Función para mostrar el popup de confirmación antes de registrar
  const handleConfirmRegister = () => {
    setShowConfirmPopup(true) // Muestra el popup intermedio
  }

  // Función para manejar la respuesta del popup de confirmación
  const handleConfirmResponse = (response: boolean) => {
    setShowConfirmPopup(false) // Cierra el popup intermedio
    if (response) {
      setShowEmployeePopup(true) // Si la respuesta es "Sí", muestra el popup de registro
    }
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

      {/* Lupa para buscar publicaciones */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => setSearchVisible(!searchVisible)}>
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
                <Button onClick={() => setSelectedBenefit(benefit)}>Ver detalles</Button>
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
            <Button
              className="bg-green-500 hover:bg-green-600"
              type="button"
              onClick={handleConfirmRegister} // Muestra el popup intermedio
            >
              Archivar
            </Button>
            <Button className="bg-red-500 hover:bg-red-600" type="submit">Eliminar</Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Popup intermedio para confirmar si desea registrar */}
      {showConfirmPopup && (
        <Dialog open={showConfirmPopup} onOpenChange={() => setShowConfirmPopup(false)}>
          <DialogContent className="max-w-md bg-white rounded-lg shadow-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">¿Registrar al empleado?</DialogTitle>
              <p className="mt-2 text-gray-600">¿Deseas registrar al empleado ahora?</p>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button className="bg-gray-500 hover:bg-gray-600" onClick={() => handleConfirmResponse(false)}>
                No
              </Button>
              <Button className="bg-green-500 hover:bg-green-600" onClick={() => handleConfirmResponse(true)}>
                Sí
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Popup para registrar el nuevo empleado */}
      {showEmployeePopup && (
        <Dialog open={showEmployeePopup} onOpenChange={setShowEmployeePopup}>
          <DialogContent className="max-w-md bg-white rounded-lg shadow-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Registrar nuevo empleado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Nombre"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Apellido"
                value={employeeLastName}
                onChange={(e) => setEmployeeLastName(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Departamento"
                value={employeeDepartment}
                onChange={(e) => setEmployeeDepartment(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button className="bg-gray-500 hover:bg-gray-600" onClick={() => setShowEmployeePopup(false)}>
                Cancelar
              </Button>
              <Button className="bg-green-500 hover:bg-green-600" onClick={handleRegisterEmployee}>
                Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
