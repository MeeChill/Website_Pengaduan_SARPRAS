-- CreateTable
CREATE TABLE "chats" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "judul" TEXT,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
