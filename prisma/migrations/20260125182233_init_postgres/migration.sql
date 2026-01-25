-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "nisn" TEXT,
    "kelas" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori" (
    "id" SERIAL NOT NULL,
    "nama_kategori" TEXT NOT NULL,
    "deskripsi" TEXT,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "input_aspirasi" (
    "id" SERIAL NOT NULL,
    "siswa_id" INTEGER NOT NULL,
    "kategori_id" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "foto" TEXT,
    "tanggal_input" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "input_aspirasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aspirasi" (
    "id" SERIAL NOT NULL,
    "input_aspirasi_id" INTEGER NOT NULL,
    "validasi_oleh" INTEGER,
    "tanggal_validasi" TIMESTAMP(3),
    "status_validasi" TEXT NOT NULL DEFAULT 'pending',
    "catatan_validasi" TEXT,
    "admin_id" INTEGER,
    "tanggal_mulai" TIMESTAMP(3),
    "status_progres" TEXT NOT NULL DEFAULT 'belum_dimulai',
    "feedback" TEXT,
    "tanggal_selesai" TIMESTAMP(3),

    CONSTRAINT "aspirasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progres_update" (
    "id" SERIAL NOT NULL,
    "aspirasi_id" INTEGER NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "deskripsi_update" TEXT NOT NULL,
    "tanggal_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progres_update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" SERIAL NOT NULL,
    "penerima_id" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "input_aspirasi_id" INTEGER,
    "aspirasi_id" INTEGER,
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "tanggal_notif" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "aspirasi_input_aspirasi_id_key" ON "aspirasi"("input_aspirasi_id");

-- AddForeignKey
ALTER TABLE "input_aspirasi" ADD CONSTRAINT "input_aspirasi_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "input_aspirasi" ADD CONSTRAINT "input_aspirasi_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasi" ADD CONSTRAINT "aspirasi_input_aspirasi_id_fkey" FOREIGN KEY ("input_aspirasi_id") REFERENCES "input_aspirasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasi" ADD CONSTRAINT "aspirasi_validasi_oleh_fkey" FOREIGN KEY ("validasi_oleh") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasi" ADD CONSTRAINT "aspirasi_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progres_update" ADD CONSTRAINT "progres_update_aspirasi_id_fkey" FOREIGN KEY ("aspirasi_id") REFERENCES "aspirasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progres_update" ADD CONSTRAINT "progres_update_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_penerima_id_fkey" FOREIGN KEY ("penerima_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_input_aspirasi_id_fkey" FOREIGN KEY ("input_aspirasi_id") REFERENCES "input_aspirasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_aspirasi_id_fkey" FOREIGN KEY ("aspirasi_id") REFERENCES "aspirasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
