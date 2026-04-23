ALTER TABLE "custom_chats"
ADD COLUMN "aspirasi_id" INTEGER;

CREATE UNIQUE INDEX "custom_chats_aspirasi_id_key"
ON "custom_chats"("aspirasi_id");

ALTER TABLE "custom_chats"
ADD CONSTRAINT "custom_chats_aspirasi_id_fkey"
FOREIGN KEY ("aspirasi_id") REFERENCES "aspirasi"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
