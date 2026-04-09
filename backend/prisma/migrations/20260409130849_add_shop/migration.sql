-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trial', 'active', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('basic', 'pro', 'enterprise');

-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "owner_id" INTEGER NOT NULL,
    "owner_email" TEXT NOT NULL,
    "subscription_start" TIMESTAMP(3),
    "subscription_end" TIMESTAMP(3),
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'trial',
    "subscription_plan" "SubscriptionPlan" NOT NULL DEFAULT 'basic',
    "phone_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocked_reason" TEXT,
    "total_branches" INTEGER NOT NULL DEFAULT 0,
    "total_devices" INTEGER NOT NULL DEFAULT 0,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shops_owner_id_key" ON "shops"("owner_id");

-- CreateIndex
CREATE INDEX "shops_owner_id_idx" ON "shops"("owner_id");

-- CreateIndex
CREATE INDEX "shops_subscription_status_idx" ON "shops"("subscription_status");

-- CreateIndex
CREATE INDEX "shops_is_active_subscription_status_idx" ON "shops"("is_active", "subscription_status");

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
