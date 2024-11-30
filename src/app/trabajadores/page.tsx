"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebaseConfig";
import { collection, doc, getDocs, getDoc, updateDoc, setDoc, addDoc } from "firebase/firestore";
import { Trash2, Users, List, Cake } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInYears, isSameDay } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Employee {
  id: string;
  nombre: string;
  apellido: string;
  dni: number;
  correo: string;
  departamento: string;
  sueldo: number;
  genero: string;
  fechaNacimiento: string;
  estado: 'activo' | 'inactivo';  // Campo para la baja lógica
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("todos");
  const [departments, setDepartments] = useState<string[]>([]);
  const [birthdayEmployees, setBirthdayEmployees] = useState<Employee[]>([]);
  const { t } = useTranslation();
  const [newEmployee, setNewEmployee] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    correo: "",
    departamento: "",
    sueldo: "",
    genero: "",
    fechaNacimiento: ""
  });
  const [selectedCompany, setSelectedCompany] = useState(""); // Aca podes colocar una empresa que sea la que va a cargar de entrada
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  // Función para cambiar el estado del empleado a inactivo
  const handleDeactivate = async (employeeId: string) => {
    if (!employeeId) return;

    try {
      const employeeRef = doc(db, "Grupo_Pueble", selectedCompany, "empleados", employeeId);
      await updateDoc(employeeRef, {
        estado: 'inactivo'
      });

      // Actualiza el estado local de los empleados
      setEmployees(prevEmployees =>
        prevEmployees.map(employee =>
          employee.id === employeeId ? { ...employee, estado: 'inactivo' } : employee
        )
      );
      setSelectedEmployee(null); // Cerrar el dialog después de actualizar
    } catch (error) {
      console.error("Error al desactivar el empleado:", error);
    }
  };

  const [view, setView] = useState("list");

  const companies = ["Pueble SA - CASE IH", "KIA"];

  const checkBirthdays = (employeesData: Employee[]) => {
    const today = new Date();
  
    // Filtrar empleados que cumplen años hoy
    const birthdays = employeesData.filter(employee => {
      const birthDate = new Date(employee.fechaNacimiento + 'T00:00:00');
      return isSameDay(
        new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      );
    });
    
    setBirthdayEmployees(birthdays);
  
    // Crear notificaciones de cumpleaños si no existen ya
birthdays.forEach(async (employee) => {
  const birthDate = new Date(employee.fechaNacimiento + 'T00:00:00');
  const age = differenceInYears(new Date(), birthDate);

  // Verificar si ya existe un recordatorio en la colección "notificaciones_archivadas"
  const archivedNotificationsRef = collection(db, "Grupo_Pueble", selectedCompany, "notificaciones_archivadas");
  const archivedQuery = await getDocs(archivedNotificationsRef);
  const existingArchivedNotification = archivedQuery.docs.find(doc => {
    const notification = doc.data();
    return (
      notification.empleadoId === employee.id && // Verificar ID del empleado
      isSameDay(notification.fecha.toDate(), new Date()) && // Mismo día
      notification.tipo === "Cumpleaños" // Verificar que sea de cumpleaños
    );
  });

  // Si ya existe un recordatorio de cumpleaños archivado, no creamos uno nuevo
  if (existingArchivedNotification) {
    console.log(`Ya existe un recordatorio de cumpleaños archivado para ${employee.nombre} ${employee.apellido} hoy.`);
    return;
  }

  // Verificar si ya existe un recordatorio de cumpleaños en la colección "recordatorios"
  const remindersRef = collection(db, "Grupo_Pueble", selectedCompany, "recordatorios");
  const remindersQuery = await getDocs(remindersRef);
  const existingBirthdayReminder = remindersQuery.docs.find(doc => {
    const reminder = doc.data();
    return (
      reminder.empleadoId === employee.id && // Verificar ID del empleado
      isSameDay(reminder.fechaInicio.toDate(), new Date()) && // Mismo día
      reminder.tipo === "Cumpleaños" // Verificar que sea de cumpleaños
    );
  });

  // Si ya existe un recordatorio de cumpleaños, no lo volvemos a crear
  if (existingBirthdayReminder) {
    console.log(`Ya existe un recordatorio de cumpleaños para ${employee.nombre} ${employee.apellido} hoy.`);
    return;
  }

  // Crear un nuevo recordatorio de cumpleaños
  try {
    await addDoc(remindersRef, {
      tipo: "Cumpleaños",
      descripcion: `¡${employee.nombre} ${employee.apellido} cumple ${age} años hoy!`,
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setHours(23, 59, 59, 999)), // Finaliza al final del día
      empleadoId: employee.id,
      nombre: employee.nombre,
      apellido: employee.apellido
    });
    console.log(`Recordatorio de cumpleaños creado para ${employee.nombre} ${employee.apellido}.`);
  } catch (error) {
    console.error("Error al crear notificación de cumpleaños:", error);
  }
});
  };

  // Obtener los empleados de Firebase
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedCompany) return;

      try {
        const employeesRef = collection(db, "Grupo_Pueble", selectedCompany, "empleados");
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesData = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Employee[];

        // Obtener departamentos únicos
        const uniqueDepartments = Array.from(
          new Set(employeesData.map(emp => emp.departamento))
        ).filter(Boolean);
        setDepartments(uniqueDepartments);
        
        setEmployees(employeesData);
        setFilteredEmployees(employeesData);
       checkBirthdays(employeesData);
      } catch (error) {
        console.error("Error al obtener los empleados:", error);
      }
    };

    fetchEmployees();
  }, [selectedCompany]);

  // Filtrar por departamento
  useEffect(() => {
    const filtered = employees.filter(
      emp => selectedDepartment === "todos" || emp.departamento === selectedDepartment
    );
    setFilteredEmployees(filtered);
  }, [selectedDepartment, employees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
  };

  // Función para obtener una ID consecutiva
  const getNewEmployeeId = async () => {
    const counterRef = doc(db, "counters", selectedCompany + "_employeeCounter");

    // Intentar obtener el documento de contador
    const counterSnap = await getDoc(counterRef);
    let newId;

    if (counterSnap.exists()) {
      const lastId = counterSnap.data().lastId;
      newId = lastId + 1;
      await updateDoc(counterRef, { lastId: newId });
    } else {
      newId = 1;
      await setDoc(counterRef, { lastId: newId });
    }
    return newId.toString();
  };
  
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const newEmployeeId = await getNewEmployeeId();

    const newEmployeeData = {
      ...newEmployee,
      dni: parseInt(newEmployee.dni, 10) || 0,
      sueldo: parseFloat(newEmployee.sueldo) || 0,
      estado: 'activo', // Aquí estamos agregando el campo 'estado'
    };

    try {
      await setDoc(
        doc(collection(db, "Grupo_Pueble", selectedCompany, "empleados"), newEmployeeId),
        newEmployeeData
      );
      
      const employeeWithId = { id: newEmployeeId, ...newEmployeeData } as Employee;
      setEmployees(prev => [...prev, employeeWithId]);
      
      // Actualizar departamentos si es uno nuevo
      if (!departments.includes(newEmployeeData.departamento)) {
        setDepartments(prev => [...prev, newEmployeeData.departamento]);
      }

      setNewEmployee({
        nombre: "",
        apellido: "",
        dni: "",
        correo: "",
        departamento: "",
        sueldo: "",
        genero: "",
        fechaNacimiento: ""
      });
      setView("list");
    } catch (error) {
      console.error("Error al agregar el empleado:", error);
    }
  };
  

  return (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-2xl">
      {birthdayEmployees.length > 0 && (
        <div className="space-y-4">
        {birthdayEmployees.map((employee) => (
          <Alert 
            key={employee.id} 
            className="bg-white dark:bg-gray-700 border-blue-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full">
                <Cake className="h-6 w-6 text-blue-600 dark:text-white animate-bounce" />
              </div>
              <div>
                <AlertTitle className="text-blue-900 dark:text-white font-semibold text-lg">
                  {t('empleados.birthday.title')}
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-200 text-base">
                  {t('empleados.birthday.description')} <span className="font-bold">{employee.nombre} {employee.apellido}</span>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 ">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t('empleados.employeesManagement.title')}</h1>
          <p className="text-sm text-muted-foreground">
          {t('empleados.employeesManagement.description')}
          </p>
        </div>
  
        <Card className="w-full sm:w-72 bg-white/50 backdrop-blur shadow-sm dark:bg-gray-950 dark:border-gray-700 dark:text-white">
          <CardContent className="pt-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
            {t('empleados.companySelection.label')}
            </label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder=  {t('empleados.companySelection.placeholder')}  />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
  
      <div className="flex flex-col sm:flex-row gap-4 mb-6  ">
        <Button 
          onClick={() => setView("add")} 
          className={`flex-1 sm:flex-none ${view === "add" 
            ? "bg-primary hover:bg-primary/80 text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200" 
            : "bg-white text-primary hover:bg-slate-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 dark:text-white"}`}>
          <Users className="mr-2 h-4 w-4" />
          {t('empleados.buttons.addEmployee')}
        </Button>
        <Button 
          onClick={() => setView("list")} 
          className={`flex-1 sm:flex-none ${view === "list" 
            ? "bg-primary hover:bg-primary/80 text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200" 
            : "bg-white text-primary hover:bg-slate-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 dark:text-white"}`}>
          <List className="mr-2 h-4 w-4" />
          {t('empleados.buttons.viewEmployeesList')}
        </Button>
      </div>

      {view === "list" && (
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4 ">
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('empleados.filters.departmentFilterLabel')}
                </label>
                <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder= {t('empleados.filters.departmentFilterPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">{t('empleados.filters.allDepartments')}</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {view === "add" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t('empleados.addEmployee.title')}</CardTitle>
            <CardDescription>
              {t('empleados.addEmployee.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="nombre">
                  {t('empleados.addEmployee.form.fields.nombre.label')}
                  </label>
                  <Input 
                    id="nombre" 
                    name="nombre" 
                    value={newEmployee.nombre} 
                    onChange={handleInputChange} 
                    placeholder={t('empleados.addEmployee.form.fields.nombre.placeholder')}
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="apellido">
                  {t('empleados.addEmployee.form.fields.apellido.label')}
                  </label>
                  <Input 
                    id="apellido" 
                    name="apellido" 
                    value={newEmployee.apellido} 
                    onChange={handleInputChange} 
                    placeholder= {t('empleados.addEmployee.form.fields.apellido.placeholder')}
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="dni">
                  {t('empleados.addEmployee.form.fields.dni.label')}
                  </label>
                  <Input 
                    id="dni" 
                    name="dni" 
                    value={newEmployee.dni} 
                    onChange={handleInputChange} 
                    placeholder= {t('empleados.addEmployee.form.fields.dni.placeholder')}
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="correo">
                  {t('empleados.addEmployee.form.fields.correo.label')}
                  </label>
                  <Input 
                    id="correo" 
                    name="correo" 
                    value={newEmployee.correo} 
                    onChange={handleInputChange} 
                    placeholder= {t('empleados.addEmployee.form.fields.correo.placeholder')}
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="departamento">
                  {t('empleados.addEmployee.form.fields.departamento.label')}
                  </label>
                  <Input 
                    id="departamento" 
                    name="departamento" 
                    value={newEmployee.departamento} 
                    onChange={handleInputChange} 
                    placeholder={t('empleados.addEmployee.form.fields.departamento.placeholder')}
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="sueldo">
                  {t('empleados.addEmployee.form.fields.sueldo.label')}
                  </label>
                  <Input 
                    id="sueldo" 
                    name="sueldo" 
                    value={newEmployee.sueldo} 
                    onChange={handleInputChange} 
                    placeholder= {t('empleados.addEmployee.form.fields.sueldo.placeholder')}
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="genero">
                  {t('empleados.addEmployee.form.fields.genero.label')}
                  </label>
                  <div className="flex items-center space-x-6">
                    <label htmlFor="male" className="flex items-center space-x-2">
                      <input
                        id="male"
                        type="radio"
                        name="genero"
                        value="Masculino"
                        checked={newEmployee.genero === "Masculino"}
                        onChange={handleInputChange}
                      />
                      <span>{t('empleados.addEmployee.form.fields.genero.options.male')}</span>
                    </label>
                    <label htmlFor="female" className="flex items-center space-x-2">
                      <input
                        id="female"
                        type="radio"
                        name="genero"
                        value="Femenino"
                        checked={newEmployee.genero === "Femenino"}
                        onChange={handleInputChange}
                      />
                       <span>{t('empleados.addEmployee.form.fields.genero.options.female')}</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="fechaNacimiento">
                  {t('empleados.addEmployee.form.fields.fechaNacimiento.label')}
                  </label>
                  <Input 
                    id="fechaNacimiento" 
                    name="fechaNacimiento" 
                    type="date" 
                    value={newEmployee.fechaNacimiento} 
                    onChange={handleInputChange} 
                    className="focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="w-full sm:w-auto">
                {t('empleados.buttons.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

{view === "list" && (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{t('empleados.employeesList.headers.nombre')}</TableHead>
        <TableHead>{t('empleados.employeesList.headers.apellido')}</TableHead>
        <TableHead>{t('empleados.employeesList.headers.dni')}</TableHead>
        <TableHead>{t('empleados.employeesList.headers.correo')}</TableHead>
        <TableHead>{t('empleados.employeesList.headers.departamento')}</TableHead>
        <TableHead>{t('empleados.employeesList.headers.sueldo')}</TableHead>
        <TableHead>{t('empleados.employeesList.headers.genero')}</TableHead>
        <TableHead>{t('empleados.employeesList.headers.fechaNacimiento')}</TableHead>
        <TableHead>{t('empleados.employeesList.headers.acciones')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody className="dark:hover:backdrop-brightness-125 dark:hover:text-primary dark:hover:shadow-md dark:transition-all dark:duration-300 rounded-lg">
      {filteredEmployees
        .filter(employee => employee.estado === 'activo')  // Filtra solo empleados activos
        .map((employee) => (
          <TableRow key={employee.id}>
            <TableCell>{employee.nombre}</TableCell>
            <TableCell>{employee.apellido}</TableCell>
            <TableCell>{employee.dni}</TableCell>
            <TableCell>{employee.correo}</TableCell>
            <TableCell>{employee.departamento}</TableCell>
            <TableCell>${employee.sueldo}</TableCell>
            <TableCell>{employee.genero}</TableCell>
            <TableCell>
              {employee.fechaNacimiento ? (
                <>
                  {/* Verificar si la fecha es un valor válido antes de crear el objeto Date */}
                  {console.log(employee.fechaNacimiento)} 
                  {isNaN(new Date(employee.fechaNacimiento).getTime()) ? (
                    // Si la fecha no es válida, mostrar un mensaje de error
                    t('empleados.employeesList.invalidDate')
                  ) : (
                    // Si la fecha es válida, formatearla usando la zona horaria local
                    new Date(employee.fechaNacimiento).toLocaleDateString('es-ES', {
                      timeZone: 'UTC',  // Esto asegura que se use UTC para la fecha
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })
                  )}
                </>
              ) : (
                t('empleados.employeesList.noDate')
              )}
            </TableCell>
            <TableCell>


                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          onClick={() => setSelectedEmployee(employee)}  // Guardamos el empleado seleccionado
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-gray-950 dark:text-white">
                        <AlertDialogTitle>{`¿Seguro de dar de baja a ${employee.nombre}?`}</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción cambiará el estado del empleado a "inactivo".
                        </AlertDialogDescription>
                        <div className="flex justify-end space-x-2">
                          <AlertDialogCancel onClick={() => setSelectedEmployee(null)}>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeactivate(employee.id)}>Sí, dar de baja</AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>

                    
                  </TableCell>
          </TableRow>
        ))}
    </TableBody>
  </Table>
)}
    </div>
  );
};
