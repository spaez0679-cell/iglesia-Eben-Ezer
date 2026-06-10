import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcrypt'

export async function GET() {
  try {
    const hashedPassword = await hash('admin123', 10)
    
    // Upsert: Crea el usuario si no existe, o lo actualiza si ya está
    const admin = await db.admin.upsert({
      where: { username: 'admin' },
      update: {
        password: hashedPassword, // Fuerza la contraseña a ser admin123
        name: 'Administrador',
        role: 'admin',
      },
      create: {
        username: 'admin',
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin',
      }
    })

    return NextResponse.json({ 
      message: '¡Admin creado/actualizado con éxito! Ya puedes loguearte.',
      user: admin.username
    })

  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Error al crear el admin', details: error.message },
      { status: 500 }
    )
  }
} 