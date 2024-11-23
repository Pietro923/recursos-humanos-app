// app/admin/page.tsx
import { RequireAuth } from "@/components/auth/RequireAuth"
import AdminPanel from "@/components/admin/page"
// Se llama a RequireAuth que esta en carpeta auth para tener un verificador de roles.
// aqui se llama al componente creado en components en la carpeta admin, para una mejor seguridad
export default function AdminPage() {
  return (
    <RequireAuth>
      <AdminPanel />
    </RequireAuth>
  )
}