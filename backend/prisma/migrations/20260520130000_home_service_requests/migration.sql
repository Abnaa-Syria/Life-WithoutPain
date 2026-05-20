-- CreateEnum
CREATE TYPE "HomeServiceRequestStatus" AS ENUM ('PENDING', 'ASSIGNED', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "home_service_requests" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "visitAddress" TEXT NOT NULL,
    "notes" TEXT,
    "preferredDate" DATE NOT NULL,
    "requiresInsuranceApproval" BOOLEAN NOT NULL DEFAULT false,
    "status" "HomeServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "assignedDoctorId" INTEGER,
    "appointmentId" INTEGER,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_service_requests_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "homeServiceRequestId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "home_service_requests_appointmentId_key" ON "home_service_requests"("appointmentId");
CREATE INDEX "home_service_requests_patientId_idx" ON "home_service_requests"("patientId");
CREATE INDEX "home_service_requests_serviceId_idx" ON "home_service_requests"("serviceId");
CREATE INDEX "home_service_requests_preferredDate_idx" ON "home_service_requests"("preferredDate");
CREATE INDEX "home_service_requests_status_idx" ON "home_service_requests"("status");
CREATE INDEX "payments_homeServiceRequestId_idx" ON "payments"("homeServiceRequestId");

-- AddForeignKey
ALTER TABLE "home_service_requests" ADD CONSTRAINT "home_service_requests_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "home_service_requests" ADD CONSTRAINT "home_service_requests_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "home_service_requests" ADD CONSTRAINT "home_service_requests_assignedDoctorId_fkey" FOREIGN KEY ("assignedDoctorId") REFERENCES "doctor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "home_service_requests" ADD CONSTRAINT "home_service_requests_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_homeServiceRequestId_fkey" FOREIGN KEY ("homeServiceRequestId") REFERENCES "home_service_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
