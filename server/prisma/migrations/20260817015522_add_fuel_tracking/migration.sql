-- CreateTable
CREATE TABLE "FuelRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mileage" INTEGER NOT NULL,
    "gallons" DOUBLE PRECISION NOT NULL,
    "pricePerGallon" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "station" TEXT,
    "notes" TEXT,
    "vehicleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FuelRecord" ADD CONSTRAINT "FuelRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
