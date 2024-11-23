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
    const { email, password, role } = await request.json()

    // Validaciones básicas
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Crear el usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
      disabled: false,
    })

    // Guardar la información adicional en Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role,
      createdBy: decodedToken.email,
      createdAt: new Date().toISOString(),
    })

    // Establecer los claims personalizados
    await auth.setCustomUserClaims(userRecord.uid, { role })

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      uid: userRecord.uid,
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    // Mejorar el manejo de errores para dar más información
    const errorMessage = error instanceof Error ? error.message : 'Error al crear el usuario'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}