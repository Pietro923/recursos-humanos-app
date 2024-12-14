import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Inicializar Firebase Admin si no está inicializado
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const auth = getAuth()
const db = getFirestore()

export async function POST(request: Request) {
  try {
    // Verificar la autenticación del admin
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await auth.verifyIdToken(idToken)

    // Verificar si el usuario actual es admin
    const adminDoc = await db.collection('users').doc(decodedToken.uid).get()
    if (!adminDoc.exists || adminDoc.data()?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    // Obtener los datos del cuerpo de la petición
    const { companyName } = await request.json()

    // Validaciones básicas
    if (!companyName) {
      return NextResponse.json(
        { error: 'El nombre de la empresa es requerido' },
        { status: 400 }
      )
    }
    // Verificar si ya existe una empresa con ese nombre
    const companyDoc = await db.collection('Grupo_Pueble').doc(companyName).get();
    if (companyDoc.exists) {
      return NextResponse.json(
        { error: `La empresa "${companyName}" ya existe` },
        { status: 400 }
      );
    }

// Crear una nueva colección con el nombre de la empresa dentro de Grupo_Pueble
// Crear el documento de la empresa
await db.collection('Grupo_Pueble').doc(companyName).create({})

// Crear la colección "Departamentos"
const departamentosRef = db.collection('Grupo_Pueble').doc(companyName).collection('Departamentos')

// Crear los departamentos
const departamentos = ['Administracion', 'Comercial', 'Postventa']

// Crear departamentos y sus subcollecciones
for (const departamento of departamentos) {
  // Crear un documento en cada departamento
  const departamentoDocRef = departamentosRef.doc(departamento)
  await departamentoDocRef.create({})

  // Crear la subcolección SubDepartamento dentro de cada departamento
  const subDepartamentoRef = departamentoDocRef.collection('SubDepartamento')

  if (departamento === 'Administracion') {
    // Crear documento de Administracion en SubDepartamento
    const administracionRef = subDepartamentoRef.doc('Administracion')
    await administracionRef.create({})

    // Crear colección de Puestos y agregar documentos
    const puestosRef = administracionRef.collection('Puestos')
    const puestos = ['Compras', 'Contabilidad', 'Limpieza', 'Mantenimiento', 'Marketing', 'Tesoreria', 'Cobranza']
    
    for (const puesto of puestos) {
      await puestosRef.doc(puesto).create({})
    }
  } 
  else if (departamento === 'Comercial') {
    // Crear documento de Comercial en SubDepartamento
    const comercialRef = subDepartamentoRef.doc('Comercial')
    await comercialRef.create({})

    // Crear colección de Puestos y agregar documento Vendedor Producto
    const puestosRef = comercialRef.collection('Puestos')
    await puestosRef.doc('Vendedor Producto').create({})
  } 
  else if (departamento === 'Postventa') {
    // Crear documento de Postventa en SubDepartamento
    const postventaRef = subDepartamentoRef.doc('Postventa')
    await postventaRef.create({})

    // Crear dos colecciones: Repuestos y Servicios
    await postventaRef.collection('Repuestos').doc('placeholder').create({})
    await postventaRef.collection('Servicios').doc('placeholder').create({})
  }
}

    return NextResponse.json({
      message: 'Empresa creada exitosamente',
      companyName: companyName,
    })
  } catch (error) {
    console.error('Error al crear empresa:', error)
    
    // Mejorar el manejo de errores para dar más información
    const errorMessage = error instanceof Error ? error.message : 'Error al crear la empresa'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}