/*
  Warnings:

  - You are about to drop the column `aspirasi_id` on the `chats` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_aspirasi_id_fkey";

-- DropIndex
DROP INDEX "chats_aspirasi_id_key";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "aspirasi_id";
