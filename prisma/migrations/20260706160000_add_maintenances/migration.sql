-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "task_urgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "task_follow_up" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED');

-- CreateEnum
CREATE TYPE "investment_type" AS ENUM ('CAPEX', 'OPEX');

-- CreateEnum
CREATE TYPE "guess_status" AS ENUM ('PENDING', 'CONSIDERED', 'DISMISSED');

-- CreateTable
CREATE TABLE "maintenances" (
    "id" UUID NOT NULL,
    "aerodrome_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "security_code" TEXT,
    "authorized_emails" TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_tasks" (
    "id" UUID NOT NULL,
    "maintenance_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "predicted_value" DECIMAL(14,2) NOT NULL,
    "insertion_date" TIMESTAMPTZ(3) NOT NULL,
    "predicted_date" TIMESTAMPTZ(3) NOT NULL,
    "completion_date" TIMESTAMPTZ(3),
    "actual_cost" DECIMAL(14,2),
    "completion_description" TEXT,
    "impact" TEXT,
    "time_elapsed" TEXT,
    "status" "task_status" NOT NULL DEFAULT 'PENDING',
    "urgency" "task_urgency",
    "follow_up" "task_follow_up",
    "investment_type" "investment_type",
    "responsibility" TEXT,
    "delay_warning" BOOLEAN,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "maintenance_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_guesses" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "guess_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "maintenance_guesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenances_aerodrome_id_idx" ON "maintenances"("aerodrome_id");

-- CreateIndex
CREATE INDEX "maintenance_tasks_maintenance_id_idx" ON "maintenance_tasks"("maintenance_id");

-- CreateIndex
CREATE INDEX "maintenance_guesses_task_id_idx" ON "maintenance_guesses"("task_id");

-- CreateIndex
CREATE INDEX "maintenance_guesses_status_idx" ON "maintenance_guesses"("status");

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_aerodrome_id_fkey" FOREIGN KEY ("aerodrome_id") REFERENCES "aerodromes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tasks" ADD CONSTRAINT "maintenance_tasks_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_guesses" ADD CONSTRAINT "maintenance_guesses_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "maintenance_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
