import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// Get all vehicles
app.get("/api/vehicles", async (_req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany();
        res.json({
            message: "Vehicle Maintenance API is running",
            vehicles,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to load vehicles",
        });
    }
});
// Add a vehicle
app.post("/api/vehicles", async (req, res) => {
    try {
        const { year, make, model, trim, vin, licensePlate, currentMileage, } = req.body;
        const vehicle = await prisma.vehicle.create({
            data: {
                year: Number(year),
                make,
                model,
                trim: trim || null,
                vin: vin || null,
                licensePlate: licensePlate || null,
                currentMileage: Number(currentMileage),
            },
        });
        res.status(201).json(vehicle);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to create vehicle",
        });
    }
});
// Update a vehicle
app.patch("/api/vehicles/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { year, make, model, trim, vin, licensePlate, currentMileage, } = req.body;
        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: {
                year: Number(year),
                make,
                model,
                trim: trim || null,
                vin: vin || null,
                licensePlate: licensePlate || null,
                currentMileage: Number(currentMileage),
            },
        });
        res.json(vehicle);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to update vehicle",
        });
    }
});
// Delete a vehicle
app.delete("/api/vehicles/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.vehicle.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to delete vehicle",
        });
    }
});
// Get maintenance records for one vehicle
app.get("/api/vehicles/:vehicleId/maintenance", async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const records = await prisma.maintenanceRecord.findMany({
            where: {
                vehicleId,
            },
            orderBy: {
                serviceDate: "desc",
            },
        });
        res.json(records);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to load maintenance records",
        });
    }
});
app.post("/api/vehicles/:vehicleId/maintenance", async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { serviceType, serviceDate, mileage, cost, shop, notes, nextServiceDate, nextServiceMileage, } = req.body;
        const record = await prisma.maintenanceRecord.create({
            data: {
                vehicleId,
                serviceType,
                serviceDate: new Date(serviceDate),
                mileage: Number(mileage),
                cost: cost === "" || cost === undefined
                    ? null
                    : Number(cost),
                shop: shop || null,
                notes: notes || null,
                nextServiceDate: nextServiceDate
                    ? new Date(nextServiceDate)
                    : null,
                nextServiceMileage: nextServiceMileage === "" || nextServiceMileage === undefined
                    ? null
                    : Number(nextServiceMileage),
            },
        });
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
        const maintenanceMileage = Number(mileage);
        if (vehicle &&
            maintenanceMileage > vehicle.currentMileage) {
            await prisma.vehicle.update({
                where: { id: vehicleId },
                data: {
                    currentMileage: maintenanceMileage,
                },
            });
        }
        res.status(201).json(record);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to create maintenance record",
        });
    }
});
app.get("/api/dashboard", async (_req, res) => {
    try {
        const totalVehicles = await prisma.vehicle.count();
        const totalMaintenance = await prisma.maintenanceRecord.count();
        const maintenanceCosts = await prisma.maintenanceRecord.aggregate({
            _sum: {
                cost: true,
            },
        });
        res.json({
            totalVehicles,
            totalMaintenance,
            totalCost: maintenanceCosts._sum.cost ?? 0,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to load dashboard statistics",
        });
    }
});
app.delete("/api/maintenance/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.maintenanceRecord.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to delete maintenance record",
        });
    }
});
app.patch("/api/maintenance/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { serviceType, serviceDate, mileage, cost, shop, notes, nextServiceDate, nextServiceMileage } = req.body;
        const record = await prisma.maintenanceRecord.update({
            where: { id },
            data: {
                serviceType,
                serviceDate: new Date(serviceDate),
                mileage: Number(mileage),
                cost: cost === "" || cost === undefined
                    ? null
                    : Number(cost),
                shop: shop || null,
                notes: notes || null,
                nextServiceDate: nextServiceDate
                    ? new Date(nextServiceDate)
                    : null,
                nextServiceMileage: nextServiceMileage === "" || nextServiceMileage === undefined
                    ? null
                    : Number(nextServiceMileage),
            },
        });
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: record.vehicleId },
        });
        const editedMaintenanceMileage = Number(mileage);
        if (vehicle &&
            editedMaintenanceMileage > vehicle.currentMileage) {
            await prisma.vehicle.update({
                where: { id: record.vehicleId },
                data: {
                    currentMileage: editedMaintenanceMileage,
                },
            });
        }
        res.json(record);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to update maintenance record",
        });
    }
});
// Get all maintenance records for dashboard reminders
app.get("/api/maintenance", async (_req, res) => {
    try {
        const records = await prisma.maintenanceRecord.findMany({
            orderBy: {
                serviceDate: "desc",
            },
        });
        res.json(records);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to load maintenance records",
        });
    }
});
// Get fuel records for one vehicle
app.get("/api/vehicles/:vehicleId/fuel", async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const records = await prisma.fuelRecord.findMany({
            where: {
                vehicleId,
            },
            orderBy: {
                date: "desc",
            },
        });
        res.json(records);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to load fuel records",
        });
    }
});
// Add a fuel record
app.post("/api/vehicles/:vehicleId/fuel", async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { date, mileage, gallons, pricePerGallon, totalCost, station, notes, } = req.body;
        const record = await prisma.fuelRecord.create({
            data: {
                vehicleId,
                date: new Date(date),
                mileage: Number(mileage),
                gallons: Number(gallons),
                pricePerGallon: pricePerGallon === "" || pricePerGallon === undefined
                    ? null
                    : Number(pricePerGallon),
                totalCost: totalCost === "" || totalCost === undefined
                    ? null
                    : Number(totalCost),
                station: station || null,
                notes: notes || null,
            },
        });
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
        const fuelMileage = Number(mileage);
        if (vehicle && fuelMileage > vehicle.currentMileage) {
            await prisma.vehicle.update({
                where: { id: vehicleId },
                data: {
                    currentMileage: fuelMileage,
                },
            });
        }
        res.status(201).json(record);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to create fuel record",
        });
    }
});
// Delete a fuel record
app.delete("/api/fuel/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.fuelRecord.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to delete fuel record",
        });
    }
});
// Update a fuel record
app.patch("/api/fuel/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { date, mileage, gallons, pricePerGallon, totalCost, station, notes, } = req.body;
        const record = await prisma.fuelRecord.update({
            where: { id },
            data: {
                date: new Date(date),
                mileage: Number(mileage),
                gallons: Number(gallons),
                pricePerGallon: pricePerGallon === "" || pricePerGallon === undefined
                    ? null
                    : Number(pricePerGallon),
                totalCost: totalCost === "" || totalCost === undefined
                    ? null
                    : Number(totalCost),
                station: station || null,
                notes: notes || null,
            },
        });
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: record.vehicleId },
        });
        const editedFuelMileage = Number(mileage);
        if (vehicle &&
            editedFuelMileage > vehicle.currentMileage) {
            await prisma.vehicle.update({
                where: { id: record.vehicleId },
                data: {
                    currentMileage: editedFuelMileage,
                },
            });
        }
        res.json(record);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to update fuel record",
        });
    }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map