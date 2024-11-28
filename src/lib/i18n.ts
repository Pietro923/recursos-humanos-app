// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Recursos de traducción
const resources = {
    en: {
        translation: {
          settings: {
            title: 'Settings',
            description: 'Manage your application preferences',
            appearance: 'Appearance and Regional',
            appearanceDescription: 'Customize application appearance and regional preferences'
          },
          theme: {
            label: 'Theme',
            light: 'Light',
            dark: 'Dark',
            system: 'System'
          },
          fontSize: {
            label: 'Font Size',
            small: 'Small',
            normal: 'Normal',
            large: 'Large'
          },
          language: {
            label: 'Language',
            placeholder: 'Select a language',
            es: 'Spanish',
            en: 'English',
            fr: 'French'
          },
          buttons: {
            save: 'Save Changes'
          },
          notifications: {
            saveSuccess: {
              title: 'Settings Updated',
              description: 'Changes have been saved successfully'
            },
            saveError: {
              title: 'Error',
              description: 'Could not update settings'
            }
          },
          loading: {
            label: 'Loading...'
          },
          header: {
            myAccount: "My Account",
            profile: "Profile",
            settings: "Settings",
            notificationsHistory: "Notifications History",
            logout: "Log Out",
            logoutConfirmation: {
              title: "Are you sure?",
              description: "This action will log you out. You will need to log back in to access your account.",
              cancel: "Cancel",
              confirm: "Log Out"
            }
          },
          sidebar: {
            toggle: "Open/Close Sidebar"
          },
          dashboard: {
            welcomeMessage: "Welcome, {{userRole}}",
            selectOptionMessage: "Select one of the following options to get started",
            mainDashboard: "Main Dashboard",
            mainDashboardDescription: "Access the main dashboard of the system",
            access: "Access",
            roles: {
              ADMIN: {
                title: "Administration",
                description: "Access the full system administration panel"
              },
              RRHH: {
                title: "Human Resources",
                description: "Manage HR processes and personnel"
              },
              NOMINAS: {
            title: "Payroll",
                description: "Manage payroll and employee payments"
              }
            }
          },
          menu: {
            ADMIN: [
              { "href": "/dashboard", "label": "Dashboard" },
              { "href": "/trabajadores", "label": "Employees" },
              { "href": "/asistencia", "label": "Attendance" },
              { "href": "/desempeno", "label": "Performance" },
              { "href": "/nominas", "label": "Payroll" },
              { "href": "/beneficios", "label": "Benefits" },
              { "href": "/cursos", "label": "Training" },
              { "href": "/postulaciones", "label": "Applications" },
              { "href": "/recordatorios", "label": "Reminders" }
            ],
            rrhh: [
              { "href": "/asistencia", "label": "Attendance" },
              { "href": "/desempeno", "label": "Performance" },
              { "href": "/beneficios", "label": "Benefits" },
              { "href": "/cursos", "label": "Training" },
              { "href": "/recordatorios", "label": "Reminders" }
            ],
            nominas: [
              { "href": "/trabajadores", "label": "Employees" },
              { "href": "/nominas", "label": "Payroll" },
              { "href": "/recordatorios", "label": "Reminders" }
            ]
          },
          adminPanel: {
                title: "Admin Panel",
                createUserDescription: "Create a new user in the system",
                emailLabel: "Email Address",
                passwordLabel: "Password",
                roleLabel: "User Role",
                selectRolePlaceholder: "Select a role",
                emailPlaceholder: "email@example.com",
                roleAdmin: "Administrator",
                roleRrhh: "Human Resources",
                roleNominas: "Payroll",
                createUserButton: "Create User",
                loadingCreateUserButton: "Creating user...",
                successMessage: "User {email} successfully created with role {role}",
                errorMessage: "Error creating user. Please try again.",
                errorInvalidResponse: "Server error: Invalid response",
                noAdminSession: "No active admin session"
            },
            notificationBell: {
                title: "Reminders",
                noReminders: "No pending reminders",
                status: {
                  todayExpires: "Expires today",
                  daysRemaining: "{days} days remaining",
                  expired: "{days} days expired"
                },
                company: "Company",
                description: "Description",
                archive: "Archive",
                reminder: "Reminder"
              },
              statusColors: {
                green: "text-green-600",
                yellow: "text-yellow-600",
                red: "text-red-600"
              },
              dropdown: {
                reminderHeader: "Reminders",
                archiveNotification: "Archive notification"
              },
              selectCompany: "Select company",
              details: "Details",
              start: "Start",
              end: "End",
              today: "Today",
              expired: "Expired",
              remainingDays: "{days} days remaining",
              reminderDetails: "Reminder details",
              type: "Type",
              employee: "Employee",
              startDate: "Start Date",
              endDate: "End Date",

              graficotorta:{
                card:{
                  title:"Employee Distribution by Gender",
                  description:"Total employees:",
                  description2:"The number of employees is divided between men and women.",
                  genre:"man",
                  genre2:"woman"
                }
              },
              unauthorized:{
                card:{
                  title:"Access Denied",
                  content:"You do not have permission to access this page.",
                  button:"Back"
                }
              },
        }
      },


      es: {
        translation: {
          settings: {
            title: 'Configuración',
            description: 'Gestiona tus preferencias de aplicación',
            appearance: 'Apariencia y Regional',
            appearanceDescription: 'Personaliza la apariencia de la aplicación y tus preferencias regionales'
          },
          theme: {
            label: 'Tema',
            light: 'Claro',
            dark: 'Oscuro',
            system: 'Sistema'
          },
          fontSize: {
            label: 'Tamaño de fuente',
            small: 'Pequeño',
            normal: 'Normal',
            large: 'Grande'
          },
          language: {
            label: 'Idioma',
            placeholder: 'Selecciona un idioma',
            es: 'Español',
            en: 'Inglés',
            fr: 'Francés'
          },
          buttons: {
            save: 'Guardar Cambios'
          },
          notifications: {
            saveSuccess: {
              title: 'Configuración Actualizada',
              description: 'Los cambios han sido guardados exitosamente'
            },
            saveError: {
              title: 'Error',
              description: 'No se pudo actualizar la configuración'
            }
          },
          loading: {
            label: 'Cargando...'
          },
          header: {
            myAccount: "Mi Cuenta",
            profile: "Perfil",
            settings: "Configuración",
            notificationsHistory: "Historial de Notificaciones",
            logout: "Cerrar Sesión",
            logoutConfirmation: {
              title: "¿Estás seguro?",
              description: "Esta acción cerrará tu sesión actual. Tendrás que volver a iniciar sesión para acceder a tu cuenta.",
              cancel: "Cancelar",
              confirm: "Cerrar Sesión"
            }
          },
          sidebar: {
            toggle: "Abrir/Cerrar Barra Lateral"
          },
          dashboard: {
            welcomeMessage: "Bienvenido, {{userRole}}",
            selectOptionMessage: "Selecciona una de las siguientes opciones para comenzar",
            mainDashboard: "Dashboard Principal",
            mainDashboardDescription: "Accede al panel principal del sistema",
            access: "Acceder",
            roles: {
                ADMIN: {
                  title: "Administración",
                  description: "Accede al panel de administración completo del sistema"
                },
                RRHH: {
                  title: "Recursos Humanos",
                  description:  "Gestiona los procesos y personal de RRHH"
                },
                NOMINAS: {
              title: "Nóminas",
                  description:"Administra las nóminas y pagos del personal"
                }
              }
          }, 
          menu: {
    ADMIN: [
      { "href": "/dashboard", label: "Dashboard" },
      { "href": "/trabajadores", label: "Empleados" },
      { "href": "/asistencia", label: "Asistencia" },
      { "href": "/desempeno", label: "Desempeño" },
      { "href": "/nominas", label: "Nóminas" },
      { "href": "/beneficios",label: "Beneficios" },
      { "href": "/cursos", label: "Formación" },
      { "href": "/postulaciones", label: "Postulaciones" },
      { "href": "/recordatorios", label: "Recordatorios" }
    ],
    rrhh: [
      { "href": "/asistencia", label: "Asistencia" },
      { "href": "/desempeno", label: "Desempeño" },
      { "href": "/beneficios",label: "Beneficios" },
      { "href": "/cursos", label: "Formación" },
      { "href": "/recordatorios", label: "Recordatorios" }
    ],
    nominas: [
      { "href": "/trabajadores", label: "Empleados" },
      { "href": "/nominas", label: "Nóminas" },
      { "href": "/recordatorios", label: "Recordatorios" }
    ]
  },
  adminPanel: {
    title: "Panel de Administración",
    createUserDescription: "Crear nuevo usuario en el sistema",
    emailLabel: "Correo Electrónico",
    emailPlaceholder: "correo@ejemplo.com",
    passwordLabel: "Contraseña",
    roleLabel: "Rol del Usuario",
    selectRolePlaceholder: "Selecciona un rol",
    roleAdmin: "Administrador",
    roleRrhh: "Recursos Humanos",
    roleNominas: "Nóminas",
    createUserButton: "Crear Usuario",
    loadingCreateUserButton: "Creando usuario...",
    successMessage: "Usuario {email} creado exitosamente con rol {role}",
    errorMessage: "Error al crear el usuario. Por favor, intenta de nuevo.",
    errorInvalidResponse: "Error del servidor: respuesta no válida",
    noAdminSession: "No hay sesión de administrador activa",
  },
  notificationBell: {
    title: "Recordatorios",
    noReminders: "No hay recordatorios pendientes",
    status: {
      todayExpires: "Vence hoy",
      daysRemaining: "{days} días restantes",
      expired: "{days} días vencidos"
    },
    company: "Empresa",
    description: "Descripción",
    archive: "Archivar",
    reminder: "Recordatorio"
  },
  statusColors: {
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600"
  },
  dropdown: {
    reminderHeader: "Recordatorios",
    archiveNotification: "Archivar notificación"
  },
  selectCompany: "Seleccionar empresa",
  details: "Detalles",
  start: "Inicio",
  end: "Fin",
  today: "Hoy",
  expired: "Vencido",
  remainingDays: "{days} días restantes",
  reminderDetails: "Detalles del Recordatorio",
  type: "Tipo",
  employee: "Empleado",
  startDate: "Fecha de Inicio",
  endDate: "Fecha de Fin",

  graficotorta:{
    card:{
      title: "Distribución de Empleados por Género",
      description: "Total de empleados:",
      description2: "El número de empleados está dividido entre hombres y mujeres.",
      genre: "hombre",
      genre2: "mujer"
    }
  },
  unauthorized:{
    card:{
      title:"Acceso Denegado",
      content:"No tienes permisos para acceder a esta página.",
      button:"Volver"
    }
  },
  recordatorios:{
    toast:{
      description1:"Por favor completa todos los campos",
      description2:"La fecha de fin no puede ser anterior a la fecha de inicio",
      description3:"Empleado seleccionado no encontrado",
      title4:"¡Éxito!",
      description4:"Recordatorio agregado correctamente",
      description5:"Error al guardar el recordatorio",
    },
    card:{
      title:"Nuevo Recordatorio",
      label1:"Empresa",
      label1PlaceHolder:"Seleccionar empresa",
      label2:"Empleado",
      label2PlaceHolder:"Seleccionar empleado",
      label3:"Tipo de Recordatorio",
      label3PlaceHolder1:"Seleccionar tipo",
      label3PlaceHolder2:"Vacaciones",
      label3PlaceHolder3:"Licencia",
      label4:"Fecha de Inicio",
      label4PlaceHolder:"Seleccionar fecha",
      label5:"Fecha de Fin",
      label5PlaceHolder:"Seleccionar fecha",
      label6:"Descripción",
      label6PlaceHolder:"Detalles adicionales",
    },
    button:"Guardar Recordatorio"
  },
  postulaciones:{
    toast:{
      title1:"URL inválida",
      description1:"Por favor, ingresa una URL válida de LinkedIn Jobs",
      title2:"Publicación agregada",
      description2:"La oferta de trabajo se ha agregado exitosamente",
      title3:"Error",
      description3:"No se pudo extraer la información de la publicación",
      title4:"Publicación archivada",
      description4:"La oferta se ha movido a archivados",
      title5:"Error",
      description5:"No se pudo archivar la publicación",
      title6:"Publicación eliminada",
      description6:"La oferta se ha eliminado exitosamente",
      title7:"Error",
      description7:"No se pudo eliminar la publicación",
      title8:"Empleado registrado",
      description8:"El empleado se ha registrado exitosamente",
      title9:"Error",
      description9:"No se pudo registrar al empleado",
    },
    jobApplications: {
      header: {
        title: "Postulaciones de trabajo",
        searchButton: "Buscar"
      },
      searchPlaceholder: "Buscar por título o empresa...",
      addJob: {
        urlPlaceholder: "Pegar URL de LinkedIn Jobs",
        addButton: "Agregar Publicación",
        loading: "Cargando..."
      },
      noResults: "No hay publicaciones que coincidan con la búsqueda.",
      details: {
        viewDetailsButton: "Ver detalles",
        dialog: {
          archiveButton: "Archivar",
          deleteButton: "Eliminar",
          deleteIcon: "Eliminar",
          viewOnLinkedIn: "Ver en LinkedIn",
          registerEmployeeDialog: {
            title: "¿Registrar nuevo empleado?",
            description: "¿Deseas registrar al nuevo empleado antes de archivar la publicación?",
            archiveOnly: "Solo archivar",
            registerEmployee: "Registrar empleado"
          },
          registerEmployeeForm: {
            title: "Registrar nuevo empleado",
            fields: {
              name: "Nombre",
              lastName: "Apellido",
              department: "Departamento",
              position: "Puesto",
              startDate: "Fecha de inicio",
              salary: "Salario"
            },
            cancel: "Cancelar",
            register: "Registrar"
          }
        }
      }
    }
  },
  cursos:{
    title:"Programas de Formación",
    selectcompany:"Seleccionar empresa",
    toast: {
      title_course_completed: "Curso Finalizado",
      description_course_completed: "El curso ha sido finalizado, puede observar detalles en Cursos archivados",
      title_error_archiving_course: "Error - Curso no archivado",
      description_error_archiving_course: "Por favor, reintenta, ha ocurrido un error"
    },
    global_view: {
      card_title: "Vista Global de Cursos",
      select_month_placeholder: "Seleccionar mes",
      select_year_placeholder: "Año",
      table_headers: {
        employee: "Empleado",
        assigned_courses: "Cursos Asignados",
        progress: "Progreso"
      }
    },
    tabs: {
      courses_list: "Lista de Cursos",
      calendar: "Calendario",
      global_view: "Vista Global",
      archived_courses: "Cursos Archivados"
    },
    courses_list: {
      courses:"Cursos Disponibles",
      add_new_course: "Agregar Nuevo Curso",
      table_headers: {
        course_name: "Nombre del Curso",
        department: "Departamento",
        duration: "Duración",
        status: "Estado",
        actions: "Acciones"
      },
      buttons:{
        details:"Detalles",
        assign:"Asignar",

      }
    },
    calendar: {
      card_title: "Calendario de Cursos"
    },
    archived_courses: {
      card_title: "Cursos Finalizados",
      table_headers: {
        course_name: "Nombre del Curso",
        department: "Departamento",
        archived_date: "Fecha de Archivo",
        final_status: "Estado Final"
      },
      badge:""
    },
    modal: {
      add_course: {
        title: "Agregar Nuevo Curso",
        fields: {
          course_name: "Nombre del Curso",
          department: "Departamento"
        }
      }
    }
  }
  }     
  },




      fr: {
        translation: {
          settings: {
            title: 'Paramètres',
            description: 'Gérer les préférences de l\'application',
            appearance: 'Apparence et Régional',
            appearanceDescription: 'Personnaliser l\'apparence de l\'application et les préférences régionales'
          },
          theme: {
            label: 'Thème',
            light: 'Clair',
            dark: 'Sombre',
            system: 'Système'
          },
          fontSize: {
            label: 'Taille de police',
            small: 'Petit',
            normal: 'Normal',
            large: 'Grand'
          },
          language: {
            label: 'Langue',
            placeholder: 'Sélectionnez une langue',
            es: 'Espagnol',
            en: 'Anglais',
            fr: 'Français'
          },
          buttons: {
            save: 'Enregistrer les modifications'
          },
          notifications: {
            saveSuccess: {
              title: 'Paramètres Mis à Jour',
              description: 'Les modifications ont été enregistrées avec succès'
            },
            saveError: {
              title: 'Erreur',
              description: 'Impossible de mettre à jour les paramètres'
            }
          },
          loading: {
            label: 'Chargement...'
          },
          header: {
            myAccount: "Mon Compte",
            profile: "Profil",
            settings: "Paramètres",
            notificationsHistory: "Historique des Notifications",
            logout: "Déconnexion",
            logoutConfirmation: {
              title: "Êtes-vous sûr ?",
              description: "Cette action fermera votre session. Vous devrez vous reconnecter pour accéder à votre compte.",
              cancel: "Annuler",
              confirm: "Déconnexion"
            }
          },
          sidebar: {
            toggle: "Ouvrir/Fermer la Barre Latérale"
          },
          dashboard: {
            welcomeMessage: "Bienvenue, {{userRole}}",
            selectOptionMessage: "Sélectionnez l'une des options suivantes pour commencer",
            mainDashboard: "Tableau de bord principal",
            mainDashboardDescription: "Accédez au tableau de bord principal du système",
            access: "Accéder",
            roles: {
              ADMIN: {
                title: "Administration",
                description: "Accédez au panneau d'administration complet du système"
              },
              RRHH: {
                title: "Ressources humaines",
                description: "Gérez les processus et le personnel des ressources humaines"
              },
              NOMINAS: {
                title: "Paie",
                description: "Administrez les paies et les paiements du personnel"
              }
            }
          },
          menu: {
            ADMIN: [
              { "href": "/dashboard", "label": "Tableau de bord" },
              { "href": "/trabajadores", "label": "Employés" },
              { "href": "/asistencia", "label": "Présence" },
              { "href": "/desempeno", "label": "Performance" },
              { "href": "/nominas", "label": "Paie" },
              { "href": "/beneficios", "label": "Avantages" },
              { "href": "/cursos", "label": "Formation" },
              { "href": "/postulaciones", "label": "Candidatures" },
              { "href": "/recordatorios", "label": "Rappels" }
            ],
            rrhh: [
              { "href": "/asistencia", "label": "Présence" },
              { "href": "/desempeno", "label": "Performance" },
              { "href": "/beneficios", "label": "Avantages" },
              { "href": "/cursos", "label": "Formation" },
              { "href": "/recordatorios", "label": "Rappels" }
            ],
            nominas: [
              { "href": "/trabajadores", "label": "Employés" },
              { "href": "/nominas", "label": "Paie" },
              { "href": "/recordatorios", "label": "Rappels" }
            ]
          },
          "adminPanel": {
                title: "Panneau d'administration",
                createUserDescription: "Créer un nouvel utilisateur dans le système",
                emailLabel: "Adresse électronique",
                emailPlaceholder:"email@exemple.com",
                passwordLabel: "Mot de passe",
                roleLabel: "Rôle de l'utilisateur",
                selectRolePlaceholder: "Sélectionner un rôle",
                roleAdmin: "Administrateur",
                roleRrhh: "Ressources humaines",
                roleNominas: "Paie",
                createUserButton: "Créer un utilisateur",
                loadingCreateUserButton: "Création de l'utilisateur...",
                successMessage: "Utilisateur {email} créé avec succès avec le rôle {role}",
                errorMessage: "Erreur lors de la création de l'utilisateur. Veuillez réessayer.",
                errorInvalidResponse: "Erreur du serveur : réponse invalide",
                noAdminSession: "Aucune session administrateur active"
            },
            notificationBell: {
                title: "Rappels",
                noReminders: "Aucun rappel en attente",
                status: {
                  todayExpires: "Expire aujourd'hui",
                  daysRemaining: "{days} jours restants",
                  expired: "{days} jours expirés"
                },
                company: "Entreprise",
                description: "Description",
                archive: "Archiver",
                reminder: "Rappel"
              },
              statusColors: {
                green: "text-green-600",
                yellow: "text-yellow-600",
                red: "text-red-600"
              },
              dropdown: {
                reminderHeader: "Rappels",
                archiveNotification: "Archiver la notification"
              },
              selectCompany: "Sélectionner l'entreprise",
              details: "Détails",
              start: "Début",
              end: "Fin",
              today: "Aujourd'hui",
              expired: "Expiré",
              remainingDays: "{days} jours restants",
              reminderDetails: "Détails du rappel",
              type: "Type",
              employee: "Employé",
              startDate: "Date de début",
              endDate: "Date de fin",
              graficotorta:{
                card:{
                  title: "Répartition des employés par genre",
                  description: "Total des employés :",
                  description2: "Le nombre d'employés est divisé entre hommes et femmes.",
                  genre: "homme",
                  genre2: "femme"
                }
              },
              unauthorized:{
                card:{
                  title:"Accès refusé",
                  content:"Vous n'avez pas les autorisations pour accéder à cette page.",
                  button:"Retour"
                }
              }
              
          }
        }
      };

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Idioma por defecto
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;