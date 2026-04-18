-- AlterTable
ALTER TABLE "aspirasi" ADD COLUMN     "foto_after" TEXT,
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "tenggat_waktu" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "progres_update" ADD COLUMN     "deskripsi_singkat" TEXT;
