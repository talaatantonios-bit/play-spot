-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('PS4', 'PS5', 'VIP_PS5', 'Xbox_Series_X', 'Gaming_PC');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('available', 'busy', 'offline', 'maintenance');

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "device_number" TEXT,
    "device_type" "DeviceType" NOT NULL,
    "room_hourly_price" INTEGER NOT NULL,
    "single_hourly_price" INTEGER NOT NULL,
    "multiplayer_hourly_price" INTEGER NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'available',
    "is_vip_room" BOOLEAN NOT NULL DEFAULT false,
    "max_players" INTEGER NOT NULL DEFAULT 1,
    "image_url" TEXT,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "category_id" INTEGER NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_games" (
    "device_id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_games_pkey" PRIMARY KEY ("device_id","game_id")
);

-- CreateIndex
CREATE INDEX "devices_branch_id_status_is_active_idx" ON "devices"("branch_id", "status", "is_active");

-- CreateIndex
CREATE INDEX "devices_shop_id_device_type_idx" ON "devices"("shop_id", "device_type");

-- CreateIndex
CREATE INDEX "devices_status_idx" ON "devices"("status");

-- CreateIndex
CREATE INDEX "games_category_id_is_active_idx" ON "games"("category_id", "is_active");

-- CreateIndex
CREATE INDEX "device_games_device_id_idx" ON "device_games"("device_id");

-- CreateIndex
CREATE INDEX "device_games_game_id_idx" ON "device_games"("game_id");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_games" ADD CONSTRAINT "device_games_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_games" ADD CONSTRAINT "device_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
