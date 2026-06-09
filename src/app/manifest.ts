import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Iglesia EBEN EZER',
    short_name: 'EBEN EZER',
    description: 'Iglesia Cristiana - Casa de Dios. Lee la Biblia, predicas y eventos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a73e8', // Puedes cambiar este color por el principal de tu iglesia
    icons: [
      {
        src: '/logo-header.png', // Usa el logo que ya tienes en tu carpeta public
        sizes: 'any',
        type: 'image/png',
      }
    ],
  }
} 