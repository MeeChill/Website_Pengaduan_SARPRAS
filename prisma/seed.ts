import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Categories
  const categories = [
    { nama_kategori: 'Sarana', deskripsi: 'Fasilitas fisik seperti meja, kursi, gedung' },
    { nama_kategori: 'Prasarana', deskripsi: 'Fasilitas penunjang seperti lapangan, parkir' },
    { nama_kategori: 'Kebersihan', deskripsi: 'Masalah kebersihan lingkungan sekolah' },
    { nama_kategori: 'Keamanan', deskripsi: 'Masalah keamanan dan ketertiban' },
  ]

  console.log('Seeding categories...')
  for (const cat of categories) {
    await prisma.kategori.create({
      data: cat,
    })
  }

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10)

  console.log('Seeding users...')
  
  // Admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nama: 'Administrator',
      username: 'admin',
      password: passwordHash,
      role: 'admin',
    },
  })


  // User (NIPD)
  await prisma.user.upsert({
    where: { username: '123456' },
    update: {},
    create: {
      nama: 'Budi Santoso',
      username: '123456', // Menggunakan NIPD sebagai username
      password: passwordHash,
      role: 'user',
      nisn: '123456',
      kelas: 'XII RPL 1',
    },
  })

  // User 2 (NIPD)
  await prisma.user.upsert({
    where: { username: '654321' },
    update: {},
    create: {
      nama: 'Siti Aminah',
      username: '654321', // Menggunakan NIPD sebagai username
      password: passwordHash,
      role: 'user',
      nisn: '654321',
      kelas: 'XI TKJ 2',
    },
  })

  console.log('Seeding completed.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
