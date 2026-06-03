# Iglesia EBEN EZER - Sitio Web

Sitio web de la Iglesia Cristiana EBEN EZER, construido con Next.js, TypeScript, Tailwind CSS y Prisma + SQLite.

## Tecnologias

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Estilos**: Tailwind CSS 4, shadcn/ui, Framer Motion
- **Backend**: API Routes de Next.js
- **Base de datos**: SQLite con Prisma ORM
- **Estado**: Zustand
- **Paleta**: Celeste (#3D97B5), Verde (#5BBF6F), Blanco (#FAFCFF)

## Instalacion rapida

```bash
# 1. Instalar Node.js (version 18 o superior)
# Descarga desde: https://nodejs.org/

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env

# 4. Crear carpeta de base de datos
mkdir -p db

# 5. Inicializar base de datos
npx prisma db push

# 6. Cargar datos iniciales
npm run seed

# 7. Importar la Biblia (opcional, requiere conexion a internet)
npx tsx scripts/seed-bible.ts

# 8. Iniciar servidor de desarrollo
npm run dev
```

Abrir http://localhost:3000 en el navegador.

## Credenciales de administrador

- **Usuario**: admin
- **Contrasena**: admin123

## Estructura del proyecto

```
src/
  app/
    layout.tsx          # Layout raiz
    page.tsx            # Pagina principal (enrutador client-side)
    globals.css         # Estilos globales y paleta de colores
    api/                # APIs del backend
      bible/            # API de la Biblia
      sermons/          # Predicaciones (CRUD)
      events/           # Eventos (CRUD)
      youth/            # Jovenes (CRUD)
      sunday-school/    # Escuelita Dominical (CRUD)
      announcements/    # Anuncios (CRUD)
      church-info/      # Informacion de la iglesia
      subscribe/        # Suscripciones por email
      notifications/    # Notificaciones push
      auth/             # Login/Logout
  components/
    church/             # Componentes publicos del sitio
    admin/              # Componentes del panel de admin
    ui/                 # Componentes shadcn/ui
  hooks/                # Hooks personalizados
  lib/                  # Utilidades y conexion a BD
  store/                # Estado global (Zustand)
prisma/
  schema.prisma         # Esquema de la base de datos
  seed.ts               # Datos iniciales
scripts/
  seed-bible.ts         # Script para importar la Biblia
public/                  # Imagenes, logos, iconos, manifest.json
```
