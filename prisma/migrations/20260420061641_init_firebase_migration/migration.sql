-- CreateEnum
CREATE TYPE "Uf" AS ENUM ('AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO');

-- CreateEnum
CREATE TYPE "LandingRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AerodromeGeojsonStatus" AS ENUM ('READY', 'ERROR');

-- CreateEnum
CREATE TYPE "AerodromeGeojsonKind" AS ENUM ('AERODROME_MAP');

-- CreateEnum
CREATE TYPE "GeojsonMapFileType" AS ENUM ('KML', 'KMZ');

-- CreateEnum
CREATE TYPE "FeedbackRating" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateTable
CREATE TABLE "aerodrome_groups" (
    "id" UUID NOT NULL,
    "uf" "Uf" NOT NULL,
    "group_name" TEXT NOT NULL,
    "owner_id" TEXT,
    "deletion_requested" BOOLEAN,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "aerodrome_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_aerodromes" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "icao" TEXT NOT NULL,
    "ciad" TEXT,
    "designation" TEXT,
    "length" TEXT,
    "width" TEXT,
    "resistance" TEXT,
    "surface" TEXT,
    "altitude" TEXT,
    "name" TEXT NOT NULL,
    "municipality" TEXT,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "latitude_formatted" TEXT,
    "longitude_formatted" TEXT,
    "operation" TEXT,
    "lit" BOOLEAN,
    "fueling" BOOLEAN,
    "observation" TEXT,
    "construction" BOOLEAN,
    "is_open" BOOLEAN NOT NULL,
    "is_view" BOOLEAN NOT NULL,
    "weather_station_code" TEXT,
    "weather_station_display" TEXT,
    "file_type" TEXT,
    "img_url" TEXT,
    "kml_url" TEXT,
    "registration_ordinance_url" TEXT,
    "plan_ordinance_url" TEXT,
    "grant_term_url" TEXT,
    "aeronautical_study_url" TEXT,
    "weather_url" TEXT,
    "wind_url" TEXT,
    "video_url" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "operational_aerodromes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_requests" (
    "id" UUID NOT NULL,
    "operational_aerodrome_id" UUID NOT NULL,
    "status" "LandingRequestStatus" NOT NULL,
    "request_date" TIMESTAMPTZ(3) NOT NULL,
    "email" TEXT,
    "pilot_code" TEXT,
    "aircraft_model" TEXT,
    "aircraft_registration" TEXT,
    "departure_aerodrome" TEXT,
    "observation" TEXT,
    "reviewed_at" TIMESTAMPTZ(3),
    "reviewed_by" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "landing_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_visits" (
    "id" UUID NOT NULL,
    "operational_aerodrome_id" UUID NOT NULL,
    "modifier_users" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gates_padlocks_observation" TEXT,
    "has_gates_padlocks" BOOLEAN,
    "fence_observation" TEXT,
    "has_fence" BOOLEAN,
    "standard_plate_observation" TEXT,
    "has_standard_plate" BOOLEAN,
    "quality_observation" TEXT,
    "quality_others_observation" TEXT,
    "has_quality_holes" BOOLEAN,
    "has_quality_asphalt" BOOLEAN,
    "has_quality_others" BOOLEAN,
    "horizontal_signage_observation" TEXT,
    "has_horizontal_signage" BOOLEAN,
    "unobstructed_headboards_observation" TEXT,
    "has_unobstructed_headboards" BOOLEAN,
    "track_range_observation" TEXT,
    "has_track_range" BOOLEAN,
    "pavement_regularity" BOOLEAN,
    "trash_debris_observation" TEXT,
    "has_trash_debris" BOOLEAN,
    "delimited_perimeter_observation" TEXT,
    "has_delimited_perimeter" BOOLEAN,
    "has_invasion" BOOLEAN,
    "extra_observation" TEXT,
    "visit_at" TIMESTAMPTZ(3) NOT NULL,
    "visit_by" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "technical_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aerodrome_geojsons" (
    "id" UUID NOT NULL,
    "operational_aerodrome_id" UUID NOT NULL,
    "kind" "AerodromeGeojsonKind" NOT NULL,
    "status" "AerodromeGeojsonStatus" NOT NULL,
    "geo_json" JSONB,
    "geo_json_bytes" INTEGER NOT NULL DEFAULT 0,
    "feature_count" INTEGER NOT NULL DEFAULT 0,
    "map_file_type" "GeojsonMapFileType",
    "source_storage_path" TEXT,
    "source_updated_at" TEXT,
    "geo_json_storage_path" TEXT,
    "version_hash" TEXT,
    "error_message" TEXT,
    "processing_ms" INTEGER,
    "source_bytes" INTEGER,
    "kml_text_bytes" INTEGER,
    "zip_bytes" INTEGER,
    "generated_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "aerodrome_geojsons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aerodrome_feedbacks" (
    "id" UUID NOT NULL,
    "operational_aerodrome_id" UUID NOT NULL,
    "rating" "FeedbackRating" NOT NULL,
    "comment" TEXT,
    "session_hash" TEXT NOT NULL,
    "feedback_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "aerodrome_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilot_landings" (
    "id" UUID NOT NULL,
    "operational_aerodrome_id" UUID,
    "registration" TEXT NOT NULL,
    "local_name" TEXT NOT NULL,
    "local_icao" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL,
    "images_path" TEXT NOT NULL,
    "landing_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "pilot_landings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aerodrome_groups_uf_idx" ON "aerodrome_groups"("uf");

-- CreateIndex
CREATE INDEX "operational_aerodromes_group_id_idx" ON "operational_aerodromes"("group_id");

-- CreateIndex
CREATE INDEX "operational_aerodromes_icao_is_view_idx" ON "operational_aerodromes"("icao", "is_view");

-- CreateIndex
CREATE UNIQUE INDEX "operational_aerodromes_group_id_icao_key" ON "operational_aerodromes"("group_id", "icao");

-- CreateIndex
CREATE INDEX "landing_requests_operational_aerodrome_id_status_idx" ON "landing_requests"("operational_aerodrome_id", "status");

-- CreateIndex
CREATE INDEX "landing_requests_operational_aerodrome_id_request_date_idx" ON "landing_requests"("operational_aerodrome_id", "request_date");

-- CreateIndex
CREATE INDEX "technical_visits_operational_aerodrome_id_visit_at_idx" ON "technical_visits"("operational_aerodrome_id", "visit_at");

-- CreateIndex
CREATE UNIQUE INDEX "aerodrome_geojsons_operational_aerodrome_id_key" ON "aerodrome_geojsons"("operational_aerodrome_id");

-- CreateIndex
CREATE INDEX "aerodrome_geojsons_status_idx" ON "aerodrome_geojsons"("status");

-- CreateIndex
CREATE INDEX "aerodrome_feedbacks_operational_aerodrome_id_feedback_date_idx" ON "aerodrome_feedbacks"("operational_aerodrome_id", "feedback_date");

-- CreateIndex
CREATE UNIQUE INDEX "aerodrome_feedbacks_session_hash_operational_aerodrome_id_f_key" ON "aerodrome_feedbacks"("session_hash", "operational_aerodrome_id", "feedback_date");

-- CreateIndex
CREATE INDEX "pilot_landings_operational_aerodrome_id_idx" ON "pilot_landings"("operational_aerodrome_id");

-- CreateIndex
CREATE INDEX "pilot_landings_registration_idx" ON "pilot_landings"("registration");

-- AddForeignKey
ALTER TABLE "operational_aerodromes" ADD CONSTRAINT "operational_aerodromes_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "aerodrome_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_requests" ADD CONSTRAINT "landing_requests_operational_aerodrome_id_fkey" FOREIGN KEY ("operational_aerodrome_id") REFERENCES "operational_aerodromes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_visits" ADD CONSTRAINT "technical_visits_operational_aerodrome_id_fkey" FOREIGN KEY ("operational_aerodrome_id") REFERENCES "operational_aerodromes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aerodrome_geojsons" ADD CONSTRAINT "aerodrome_geojsons_operational_aerodrome_id_fkey" FOREIGN KEY ("operational_aerodrome_id") REFERENCES "operational_aerodromes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aerodrome_feedbacks" ADD CONSTRAINT "aerodrome_feedbacks_operational_aerodrome_id_fkey" FOREIGN KEY ("operational_aerodrome_id") REFERENCES "operational_aerodromes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pilot_landings" ADD CONSTRAINT "pilot_landings_operational_aerodrome_id_fkey" FOREIGN KEY ("operational_aerodrome_id") REFERENCES "operational_aerodromes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
