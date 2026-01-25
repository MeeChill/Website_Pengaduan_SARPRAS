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

  // Siswa
  await prisma.user.upsert({
    where: { username: 'siswa' },
    update: {},
    create: {
      nama: 'Budi Santoso',
      username: 'siswa',
      password: passwordHash,
      role: 'siswa',
      nisn: '1234567890',
      kelas: 'XII RPL 1',
    },
  })

  // Yayasan
  await prisma.user.upsert({
    where: { username: 'yayasan' },
    update: {},
    create: {
      nama: 'Ketua Yayasan',
      username: 'yayasan',
      password: passwordHash,
      role: 'yayasan',
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
