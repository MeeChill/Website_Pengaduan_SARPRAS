-- CreateTable custom_chats
CREATE TABLE "custom_chats" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "admin_id" INTEGER,
  "judul" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "prioritas" TEXT NOT NULL DEFAULT 'normal',
  "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "diperbarui_pada" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "custom_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable custom_chat_messages
CREATE TABLE "custom_chat_messages" (
  "id" SERIAL NOT NULL,
  "custom_chat_id" INTEGER NOT NULL,
  "sender_id" INTEGER NOT NULL,
  "sender_role" TEXT NOT NULL,
  "konten" TEXT NOT NULL,
  "foto_url" TEXT,
  "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "custom_chat_messages_pkey" PRIMARY KEY ("id")
);

-- Add custom_chat_id to notifikasi if not exists
ALTER TABLE "notifikasi" ADD COLUMN "custom_chat_id" INTEGER;

-- CreateIndex
CREATE INDEX "custom_chats_user_id_idx" ON "custom_chats"("user_id");
CREATE INDEX "custom_chats_admin_id_idx" ON "custom_chats"("admin_id");
CREATE INDEX "custom_chats_status_idx" ON "custom_chats"("status");
CREATE INDEX "custom_chat_messages_custom_chat_id_idx" ON "custom_chat_messages"("custom_chat_id");
CREATE INDEX "custom_chat_messages_sender_id_idx" ON "custom_chat_messages"("sender_id");
CREATE INDEX "notifikasi_custom_chat_id_idx" ON "notifikasi"("custom_chat_id");

-- AddForeignKey
ALTER TABLE "custom_chats" ADD CONSTRAINT "custom_chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "custom_chats" ADD CONSTRAINT "custom_chats_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "custom_chat_messages" ADD CONSTRAINT "custom_chat_messages_custom_chat_id_fkey" FOREIGN KEY ("custom_chat_id") REFERENCES "custom_chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "custom_chat_messages" ADD CONSTRAINT "custom_chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_custom_chat_id_fkey" FOREIGN KEY ("custom_chat_id") REFERENCES "custom_chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
