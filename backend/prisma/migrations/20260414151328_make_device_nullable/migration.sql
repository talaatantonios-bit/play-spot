-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "room_hourly_price" DROP NOT NULL,
ALTER COLUMN "single_hourly_price" DROP NOT NULL,
ALTER COLUMN "multiplayer_hourly_price" DROP NOT NULL;
