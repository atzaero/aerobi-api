-- AlterTable
ALTER TABLE "landing_requests" ADD COLUMN     "accepted_terms" BOOLEAN,
ADD COLUMN     "confirmed_true" BOOLEAN,
ADD COLUMN     "departure_at" TIMESTAMPTZ(3),
ADD COLUMN     "exit_after_landing_at" TIMESTAMPTZ(3),
ADD COLUMN     "foreign_registration" BOOLEAN,
ADD COLUMN     "icao" TEXT,
ADD COLUMN     "landing_at" TIMESTAMPTZ(3),
ADD COLUMN     "next_destination_aerodrome" TEXT,
ADD COLUMN     "people_on_board" INTEGER,
ADD COLUMN     "phone_contact" TEXT,
ADD COLUMN     "pilot_cpf" TEXT,
ADD COLUMN     "pilot_name" TEXT,
ADD COLUMN     "requester_name" TEXT,
ADD COLUMN     "uf" "Uf";

-- CreateTable
CREATE TABLE "landing_request_aircraft" (
    "id" UUID NOT NULL,
    "landing_request_id" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "marcas" TEXT NOT NULL,
    "proprietarios" TEXT,
    "operadores" TEXT,
    "nr_cert_matricula" TEXT,
    "nr_serie" TEXT,
    "cd_tipo" TEXT,
    "ds_modelo" TEXT,
    "nm_fabricante" TEXT,
    "cd_cls" TEXT,
    "nr_pmd" TEXT,
    "cd_tipo_icao" TEXT,
    "nr_tripulacao_min" TEXT,
    "nr_passageiros_max" TEXT,
    "nr_assentos" TEXT,
    "nr_ano_fabricacao" TEXT,
    "dt_validade_cva" TEXT,
    "dt_validade_ca" TEXT,
    "dt_canc" TEXT,
    "ds_motivo_canc" TEXT,
    "cd_interdicao" TEXT,
    "ds_gravame" TEXT,
    "dt_matricula" TEXT,
    "tp_motor" TEXT,
    "qt_motor" TEXT,
    "tp_pouso" TEXT,
    "tp_ca" TEXT,
    "cd_proposito_cave" TEXT,
    "cf_operacional" TEXT,
    "ds_categoria_homologacao" TEXT,
    "tp_operacao" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_request_aircraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_request_aircraft_landing_request_id_key" ON "landing_request_aircraft"("landing_request_id");

-- CreateIndex
CREATE INDEX "landing_requests_icao_status_idx" ON "landing_requests"("icao", "status");

-- CreateIndex
CREATE INDEX "landing_requests_aircraft_registration_idx" ON "landing_requests"("aircraft_registration");

-- AddForeignKey
ALTER TABLE "landing_request_aircraft" ADD CONSTRAINT "landing_request_aircraft_landing_request_id_fkey" FOREIGN KEY ("landing_request_id") REFERENCES "landing_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
