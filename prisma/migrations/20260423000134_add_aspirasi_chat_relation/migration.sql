/*
  Warnings:

  - A unique constraint covering the columns `[aspirasi_id]` on the table `chats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "notifikasi" DROP CONSTRAINT "notifikasi_penerima_id_fkey";

-- DropForeignKey
ALTER TABLE "progres_update" DROP CONSTRAINT "progres_update_aspirasi_id_fkey";

-- DropIndex
DROP INDEX "custom_chat_messages_custom_chat_id_idx";

-- DropIndex
DROP INDEX "custom_chat_messages_sender_id_idx";

-- DropIndex
DROP INDEX "custom_chats_admin_id_idx";

-- DropIndex
DROP INDEX "custom_chats_status_idx";

-- DropIndex
DROP INDEX "custom_chats_user_id_idx";

-- DropIndex
DROP INDEX "notifikasi_custom_chat_id_idx";

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "aspirasi_id" INTEGER;

-- AlterTable
ALTER TABLE "progres_update" ADD COLUMN     "foto_url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "chats_aspirasi_id_key" ON "chats"("aspirasi_id");

-- AddForeignKey
ALTER TABLE "progres_update" ADD CONSTRAINT "progres_update_aspirasi_id_fkey" FOREIGN KEY ("aspirasi_id") REFERENCES "aspirasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_penerima_id_fkey" FOREIGN KEY ("penerima_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_aspirasi_id_fkey" FOREIGN KEY ("aspirasi_id") REFERENCES "aspirasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
