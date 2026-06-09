import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcrypt'

export async function GET() {
  try {
    // Primero revisamos si el usuario ya existe
    const existingAdmin = await db.admin.findUnique({
      where: { username: 'admin' }
    })

    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'El usuario admin ya existe. Intenta loguearte con admin / admin123' 
      })
    }

    // Si no existe, lo creamos
    const hashedPassword = await hash('admin123', 10)
    await db.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin',
      }
    })

    return NextResponse.json({ 
      message: '¡Usuario admin creado con éxito! Ya puedes loguearte con admin / admin123' 
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    )
  }
} 