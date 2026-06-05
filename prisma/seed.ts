import { hash } from 'bcrypt'
import { db } from '@/lib/db'

// Bible books with chapter counts
const BIBLE_BOOKS = [
  // Old Testament (39 books)
  { name: 'Génesis', abbr: 'Gén', bookNum: 1, testament: 'AT', chapters: 50 },
  { name: 'Éxodo', abbr: 'Éx', bookNum: 2, testament: 'AT', chapters: 40 },
  { name: 'Levítico', abbr: 'Lev', bookNum: 3, testament: 'AT', chapters: 27 },
  { name: 'Números', abbr: 'Núm', bookNum: 4, testament: 'AT', chapters: 36 },
  { name: 'Deuteronomio', abbr: 'Deut', bookNum: 5, testament: 'AT', chapters: 34 },
  { name: 'Josué', abbr: 'Jos', bookNum: 6, testament: 'AT', chapters: 24 },
  { name: 'Jueces', abbr: 'Jue', bookNum: 7, testament: 'AT', chapters: 21 },
  { name: 'Rut', abbr: 'Rut', bookNum: 8, testament: 'AT', chapters: 4 },
  { name: '1 Samuel', abbr: '1 Sam', bookNum: 9, testament: 'AT', chapters: 31 },
  { name: '2 Samuel', abbr: '2 Sam', bookNum: 10, testament: 'AT', chapters: 24 },
  { name: '1 Reyes', abbr: '1 Rey', bookNum: 11, testament: 'AT', chapters: 22 },
  { name: '2 Reyes', abbr: '2 Rey', bookNum: 12, testament: 'AT', chapters: 25 },
  { name: '1 Crónicas', abbr: '1 Crón', bookNum: 13, testament: 'AT', chapters: 29 },
  { name: '2 Crónicas', abbr: '2 Crón', bookNum: 14, testament: 'AT', chapters: 36 },
  { name: 'Esdras', abbr: 'Esd', bookNum: 15, testament: 'AT', chapters: 10 },
  { name: 'Nehemías', abbr: 'Neh', bookNum: 16, testament: 'AT', chapters: 13 },
  { name: 'Ester', abbr: 'Est', bookNum: 17, testament: 'AT', chapters: 10 },
  { name: 'Job', abbr: 'Job', bookNum: 18, testament: 'AT', chapters: 42 },
  { name: 'Salmos', abbr: 'Sal', bookNum: 19, testament: 'AT', chapters: 150 },
  { name: 'Proverbios', abbr: 'Prov', bookNum: 20, testament: 'AT', chapters: 31 },
  { name: 'Eclesiastés', abbr: 'Ecl', bookNum: 21, testament: 'AT', chapters: 12 },
  { name: 'Cantares', abbr: 'Cant', bookNum: 22, testament: 'AT', chapters: 8 },
  { name: 'Isaías', abbr: 'Isa', bookNum: 23, testament: 'AT', chapters: 66 },
  { name: 'Jeremías', abbr: 'Jer', bookNum: 24, testament: 'AT', chapters: 52 },
  { name: 'Lamentaciones', abbr: 'Lam', bookNum: 25, testament: 'AT', chapters: 5 },
  { name: 'Ezequiel', abbr: 'Eze', bookNum: 26, testament: 'AT', chapters: 48 },
  { name: 'Daniel', abbr: 'Dan', bookNum: 27, testament: 'AT', chapters: 12 },
  { name: 'Oseas', abbr: 'Os', bookNum: 28, testament: 'AT', chapters: 14 },
  { name: 'Joel', abbr: 'Joel', bookNum: 29, testament: 'AT', chapters: 3 },
  { name: 'Amós', abbr: 'Amós', bookNum: 30, testament: 'AT', chapters: 9 },
  { name: 'Abdías', abbr: 'Abd', bookNum: 31, testament: 'AT', chapters: 1 },
  { name: 'Jonás', abbr: 'Jon', bookNum: 32, testament: 'AT', chapters: 4 },
  { name: 'Miqueas', abbr: 'Miq', bookNum: 33, testament: 'AT', chapters: 7 },
  { name: 'Nahúm', abbr: 'Nah', bookNum: 34, testament: 'AT', chapters: 3 },
  { name: 'Habacuc', abbr: 'Hab', bookNum: 35, testament: 'AT', chapters: 3 },
  { name: 'Sofonías', abbr: 'Sof', bookNum: 36, testament: 'AT', chapters: 3 },
  { name: 'Hageo', abbr: 'Hag', bookNum: 37, testament: 'AT', chapters: 2 },
  { name: 'Zacarías', abbr: 'Zac', bookNum: 38, testament: 'AT', chapters: 14 },
  { name: 'Malaquías', abbr: 'Mal', bookNum: 39, testament: 'AT', chapters: 4 },
  // New Testament (27 books)
  { name: 'Mateo', abbr: 'Mt', bookNum: 40, testament: 'NT', chapters: 28 },
  { name: 'Marcos', abbr: 'Mr', bookNum: 41, testament: 'NT', chapters: 16 },
  { name: 'Lucas', abbr: 'Lc', bookNum: 42, testament: 'NT', chapters: 24 },
  { name: 'Juan', abbr: 'Jn', bookNum: 43, testament: 'NT', chapters: 21 },
  { name: 'Hechos', abbr: 'Hch', bookNum: 44, testament: 'NT', chapters: 28 },
  { name: 'Romanos', abbr: 'Ro', bookNum: 45, testament: 'NT', chapters: 16 },
  { name: '1 Corintios', abbr: '1 Co', bookNum: 46, testament: 'NT', chapters: 16 },
  { name: '2 Corintios', abbr: '2 Co', bookNum: 47, testament: 'NT', chapters: 13 },
  { name: 'Gálatas', abbr: 'Gál', bookNum: 48, testament: 'NT', chapters: 6 },
  { name: 'Efesios', abbr: 'Ef', bookNum: 49, testament: 'NT', chapters: 6 },
  { name: 'Filipenses', abbr: 'Fil', bookNum: 50, testament: 'NT', chapters: 4 },
  { name: 'Colosenses', abbr: 'Col', bookNum: 51, testament: 'NT', chapters: 4 },
  { name: '1 Tesalonicenses', abbr: '1 Ts', bookNum: 52, testament: 'NT', chapters: 5 },
  { name: '2 Tesalonicenses', abbr: '2 Ts', bookNum: 53, testament: 'NT', chapters: 3 },
  { name: '1 Timoteo', abbr: '1 Ti', bookNum: 54, testament: 'NT', chapters: 6 },
  { name: '2 Timoteo', abbr: '2 Ti', bookNum: 55, testament: 'NT', chapters: 4 },
  { name: 'Tito', abbr: 'Tit', bookNum: 56, testament: 'NT', chapters: 3 },
  { name: 'Filemón', abbr: 'Flm', bookNum: 57, testament: 'NT', chapters: 1 },
  { name: 'Hebreos', abbr: 'Heb', bookNum: 58, testament: 'NT', chapters: 13 },
  { name: 'Santiago', abbr: 'Stg', bookNum: 59, testament: 'NT', chapters: 5 },
  { name: '1 Pedro', abbr: '1 Pe', bookNum: 60, testament: 'NT', chapters: 5 },
  { name: '2 Pedro', abbr: '2 Pe', bookNum: 61, testament: 'NT', chapters: 3 },
  { name: '1 Juan', abbr: '1 Jn', bookNum: 62, testament: 'NT', chapters: 5 },
  { name: '2 Juan', abbr: '2 Jn', bookNum: 63, testament: 'NT', chapters: 1 },
  { name: '3 Juan', abbr: '3 Jn', bookNum: 64, testament: 'NT', chapters: 1 },
  { name: 'Judas', abbr: 'Jud', bookNum: 65, testament: 'NT', chapters: 1 },
  { name: 'Apocalipsis', abbr: 'Ap', bookNum: 66, testament: 'NT', chapters: 22 },
]

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create default admin user
  const hashedPassword = await hash('admin123', 10)
  const admin = await db.admin.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
    },
  })
  console.log('✅ Admin user created:', admin.username)

  // 2. Create church info with real data
  const churchInfoData = [
    { key: 'name', value: 'EBEN EZER' },
    { key: 'pastors', value: 'Pastores Oscar Aguero y Mónica Rosales' },
    { key: 'address', value: 'Iglesia Cristiana EBEN EZER' },
    { key: 'maps_link', value: 'https://maps.app.goo.gl/bSMUhEHn2XLJ12q56' },
    { key: 'phone', value: '' },
    { key: 'email', value: '' },
    { key: 'schedule_domingo', value: 'Domingo 17:30 hs - Culto Principal' },
    { key: 'schedule_miercoles', value: 'Miércoles 20:00 hs - Estudio Bíblico' },
    { key: 'social_facebook', value: 'https://www.facebook.com/profile.php?id=61561282300406' },
    { key: 'social_instagram', value: 'https://www.instagram.com/eben_ezer.iglesia' },
    { key: 'welcome_message', value: 'Bienvenidos a la Iglesia Cristiana EBEN EZER. Somos una comunidad de fe que busca glorificar a Dios y servir a nuestros hermanos.' },
  ]
  await db.churchInfo.createMany({
    data: churchInfoData,
  })
  console.log(`✅ ${churchInfoData.length} church info entries created`)

  // 3. Create sample announcements
  const announcements = await Promise.all([
    db.announcement.create({
      data: {
        title: '¡Gran Convención Anual!',
        content: 'Nos complace invitarles a nuestra gran convención anual que se llevará a cabo del 15 al 18 de agosto. Habrá cultos especiales, música, y la palabra de Dios. ¡No se lo pierdan!',
        isActive: true,
      },
    }),
    db.announcement.create({
      data: {
        title: 'Inscripciones Abiertas - Escuelita Dominical',
        content: 'Las inscripciones para la escuelita dominical del próximo trimestre están abiertas. Matricule a sus hijos en la oficina de la iglesia después del culto.',
        isActive: true,
      },
    }),
    db.announcement.create({
      data: {
        title: 'Reunión de Oración Nocturna',
        content: 'Este viernes tendremos nuestra reunión de oración nocturna especial. Todos son bienvenidos. Traigan sus peticiones y alabemos juntos al Señor.',
        isActive: true,
      },
    }),
    db.announcement.create({
      data: {
        title: 'Campaña de Ropa para los Necesitados',
        content: 'Estamos recolectando ropa en buen estado para donar a comunidades necesitadas. Pueden traer sus donaciones al templo.',
        isActive: false,
      },
    }),
  ])
  console.log(`✅ ${announcements.length} announcements created`)

  // 4. Create sample sermons
  const sermonDomingo1 = await db.sermon.create({
    data: {
      title: 'La Fe que Mueve Montañas',
      description: 'Un mensaje poderoso sobre cómo la fe en Dios puede transformar nuestra vida y superar cualquier obstáculo. Basado en Mateo 17:20.',
      preacher: 'Pastor Juan Pérez',
      date: new Date('2025-01-12T10:00:00'),
      videoUrl: 'https://youtube.com/watch?v=example1',
      type: 'domingo',
    },
  })
  console.log('✅ Sermon (domingo) created:', sermonDomingo1.title)

  const sermonDomingo2 = await db.sermon.create({
    data: {
      title: 'El Amor de Dios es Eterno',
      description: 'Reflexionando sobre el amor incondicional de Dios hacia nosotros. Romanos 8:38-39 nos recuerda que nada puede separarnos de Su amor.',
      preacher: 'Pastor Juan Pérez',
      date: new Date('2025-01-19T10:00:00'),
      videoUrl: 'https://youtube.com/watch?v=example2',
      type: 'domingo',
    },
  })
  console.log('✅ Sermon (domingo) created:', sermonDomingo2.title)

  const sermonMiercoles = await db.sermon.create({
    data: {
      title: 'Estudio del Libro de los Salmos',
      description: 'Profundizando en los Salmos 23 - El Señor es mi Pastor. Un estudio detallado de la protección y provisión divina.',
      preacher: 'Evangelista María García',
      date: new Date('2025-01-15T19:00:00'),
      videoUrl: 'https://youtube.com/watch?v=example3',
      type: 'miercoles',
    },
  })
  console.log('✅ Sermon (miercoles) created:', sermonMiercoles.title)

  // 5. Create sample events
  const events = await Promise.all([
    db.event.create({
      data: {
        title: 'Convención Anual 2025',
        description: 'Nuestra convención anual con predicadores invitados, alabanza especial y actividades para toda la familia.',
        date: new Date('2025-08-15T09:00:00'),
        time: '9:00 AM - 5:00 PM',
        location: 'Templo Central EBEN EZER',
        isUpcoming: true,
      },
    }),
    db.event.create({
      data: {
        title: 'Retiro de Jóvenes',
        description: 'Un fin de semana de retiro espiritual para los jóvenes de la iglesia. Incluye actividades al aire libre, estudios bíblicos y momentos de adoración.',
        date: new Date('2025-03-22T08:00:00'),
        time: '8:00 AM - 2:00 PM',
        location: 'Campamento Monte Horeb',
        isUpcoming: true,
      },
    }),
    db.event.create({
      data: {
        title: 'Noche de Alabanza Especial',
        description: 'Una noche dedicada a la alabanza y adoración a Dios con coros invitados y música en vivo.',
        date: new Date('2025-02-14T19:00:00'),
        time: '7:00 PM - 10:00 PM',
        location: 'Templo Central EBEN EZER',
        isUpcoming: true,
      },
    }),
    db.event.create({
      data: {
        title: 'Cena de Acción de Gracias',
        description: 'Celebración de acción de gracias con todos los miembros de la congregación.',
        date: new Date('2024-11-28T18:00:00'),
        time: '6:00 PM',
        location: 'Salón de Eventos EBEN EZER',
        isUpcoming: false,
      },
    }),
  ])
  console.log(`✅ ${events.length} events created`)

  // 6. Create sample youth meeting
  const youthMeeting = await db.youthMeeting.create({
    data: {
      title: 'Jóvenes con Propósito',
      description: 'Estudio bíblico para jóvenes sobre cómo encontrar el propósito de Dios para nuestras vidas. Discutimos temas relevantes para la juventud actual desde una perspectiva bíblica.',
      date: new Date('2025-01-18T18:00:00'),
      videoUrl: 'https://youtube.com/watch?v=youth1',
      quote: 'Porque yo sé los planes que tengo para ustedes, planes de bienestar y no de calamidad, a fin de darles un futuro y una esperanza.',
      quoteRef: 'Jeremías 29:11',
    },
  })
  console.log('✅ Youth meeting created:', youthMeeting.title)

  // 7. Create sample Sunday school entry
  const sundaySchool = await db.sundaySchool.create({
    data: {
      title: 'Los Héroes de la Fe',
      description: 'Lecciones sobre los grandes héroes de la fe en la Biblia: Moisés, David, Esther, Daniel y más. Aprenderemos cómo su fe en Dios los hizo extraordinarios.',
      date: new Date('2025-01-12T08:30:00'),
      teacher: 'Hna. Carmen López',
      videoUrl: 'https://youtube.com/watch?v=ss1',
      participants: {
        create: [
          { name: 'Sofía Martínez' },
          { name: 'Josué Ramírez' },
          { name: 'Isabella García' },
          { name: 'Samuel Pérez' },
          { name: 'Valentina Hernández' },
        ],
      },
    },
  })
  console.log('✅ Sunday school created:', sundaySchool.title)

  // 8. Create Bible books
  console.log('📖 Creating Bible books...')
  for (const book of BIBLE_BOOKS) {
    await db.bibleBook.create({
      data: {
        name: book.name,
        abbr: book.abbr,
        bookNum: book.bookNum,
        testament: book.testament,
        chapters: book.chapters,
      },
    })
  }
  console.log(`✅ ${BIBLE_BOOKS.length} Bible books created`)

  console.log('\n🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
