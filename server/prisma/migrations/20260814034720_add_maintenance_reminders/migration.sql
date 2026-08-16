-- AlterTable
ALTER TABLE "MaintenanceRecord" ADD COLUMN     "nextServiceDate" TIMESTAMP(3),
ADD COLUMN     "nextServiceMileage" INTEGER;
