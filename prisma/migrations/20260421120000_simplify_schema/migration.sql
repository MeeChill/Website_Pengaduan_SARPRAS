-- Simplify schema by removing Yayasan role and consolidating tables

-- First, let's backup existing data if needed
-- Then drop existing constraints and tables

-- Drop existing foreign keys
ALTER TABLE "aspirasi" DROP CONSTRAINT IF EXISTS "aspirasi_input_aspirasi_id_fkey";
ALTER TABLE "aspirasi" DROP CONSTRAINT IF EXISTS "aspirasi_validasi_oleh_fkey";
ALTER TABLE "aspirasi" DROP CONSTRAINT IF EXISTS "aspirasi_admin_id_fkey";
ALTER TABLE "input_aspirasi" DROP CONSTRAINT IF EXISTS "input_aspirasi_siswa_id_fkey";
ALTER TABLE "input_aspirasi" DROP CONSTRAINT IF EXISTS "input_aspirasi_kategori_id_fkey";
ALTER TABLE "progres_update" DROP CONSTRAINT IF EXISTS "progres_update_aspirasi_id_fkey";
ALTER TABLE "progres_update" DROP CONSTRAINT IF EXISTS "progres_update_admin_id_fkey";
ALTER TABLE "notifikasi" DROP CONSTRAINT IF EXISTS "notifikasi_penerima_id_fkey";
ALTER TABLE "notifikasi" DROP CONSTRAINT IF EXISTS "notifikasi_input_aspirasi_id_fkey";
ALTER TABLE "notifikasi" DROP CONSTRAINT IF EXISTS "notifikasi_aspirasi_id_fkey";

-- Drop old tables
DROP TABLE IF EXISTS "input_aspirasi";
DROP TABLE IF EXISTS "progres_update";
DROP TABLE IF EXISTS "notifikasi";

-- Modify users table (update roles)
UPDATE "users" SET role = 'user' WHERE role = 'siswa';
UPDATE "users" SET role = 'admin' WHERE role = 'admin';
-- Remove yayasan users
DELETE FROM "users" WHERE role = 'yayasan';

-- Drop existing aspirasi table and recreate with simplified structure
DROP TABLE IF EXISTS "aspirasi";

-- Create new simplified tables
CREATE TABLE "aspirasi" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "kategori_id" INTEGER NOT NULL,
    "admin_id" INTEGER,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "foto_before" TEXT,
    "foto_after" TEXT,
    "nomor_tiket" TEXT NOT NULL,
    "tanggal_input" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_mulai" TIMESTAMP(3),
    "tanggal_selesai" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rating" INTEGER,
    "feedback" TEXT,

    CONSTRAINT "aspirasi_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "progres_update" (
    "id" SERIAL NOT NULL,
    "aspirasi_id" INTEGER NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "deskripsi_update" TEXT NOT NULL,
    "tanggal_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progres_update_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifikasi" (
    "id" SERIAL NOT NULL,
    "penerima_id" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "aspirasi_id" INTEGER,
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "tanggal_notif" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for ticket number
CREATE UNIQUE INDEX "aspirasi_nomor_tiket_key" ON "aspirasi"("nomor_tiket");

-- Add foreign key constraints
ALTER TABLE "aspirasi" ADD CONSTRAINT "aspirasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "aspirasi" ADD CONSTRAINT "aspirasi_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "aspirasi" ADD CONSTRAINT "aspirasi_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "progres_update" ADD CONSTRAINT "progres_update_aspirasi_id_fkey" FOREIGN KEY ("aspirasi_id") REFERENCES "aspirasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "progres_update" ADD CONSTRAINT "progres_update_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_penerima_id_fkey" FOREIGN KEY ("penerima_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_aspirasi_id_fkey" FOREIGN KEY ("aspirasi_id") REFERENCES "aspirasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create default category if not exists
INSERT INTO "kategori" ("nama_kategori", "deskripsi") 
SELECT 'Umum', 'Kategori umum untuk aspirasi'
WHERE NOT EXISTS (SELECT 1 FROM "kategori" WHERE "nama_kategori" = 'Umum');