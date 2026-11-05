CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "UserRole" AS ENUM ('COLLABORATOR', 'OPERATIONS');
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'BORROWED', 'MAINTENANCE');
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'OVERDUE', 'RETURNED');

CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'COLLABORATOR',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key"
    ON "users" ("email");

CREATE TABLE "equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "asset_tag" TEXT,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "observations" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "equipment_asset_tag_key"
    ON "equipment" ("asset_tag");

CREATE TABLE "loans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "borrowed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "due_date" TIMESTAMPTZ NOT NULL,
    "returned_at" TIMESTAMPTZ,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "loans_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "loans_equipment_id_fkey"
        FOREIGN KEY ("equipment_id") REFERENCES "equipment" ("id") ON DELETE CASCADE
);

CREATE INDEX "loans_user_id_idx"
    ON "loans" ("user_id");

CREATE INDEX "loans_equipment_id_idx"
    ON "loans" ("equipment_id");

CREATE INDEX "loans_status_idx"
    ON "loans" ("status");

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "equipment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "loans" ENABLE ROW LEVEL SECURITY;

-- Sem políticas permissivas iniciais: regras restritivas são instaladas na migration 002.
