import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Get all vehicles
app.get("/api", async (_req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany();

    res.json({
      message: "Vehicle Maintenance API is running",
      vehicles,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to load vehicles",
    });
  }
});

// Add a vehicle
app.post("/api/vehicles", async (req, res) => {
  try {
    const {
      year,
      make,
      model,
      trim,
      vin,
      licensePlate,
      currentMileage,
    } = req.body;

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
  } catch (error) {
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

    const {
      year,
      make,
      model,
      trim,
      vin,
      licensePlate,
      currentMileage,
    } = req.body;

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
  } catch (error) {
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to delete vehicle",
    });
  }
});

// Get maintenance records for one vehicle
app.get(
  "/api/vehicles/:vehicleId/maintenance",
  async (req, res) => {
    try {
      const { vehicleId } = req.params;

      const records =
        await prisma.maintenanceRecord.findMany({
          where: {
            vehicleId,
          },
          orderBy: {
            serviceDate: "desc",
          },
        });

      res.json(records);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Unable to load maintenance records",
      });
    }
  }
);

app.post(
  "/api/vehicles/:vehicleId/maintenance",
  async (req, res) => {
    try {
      const { vehicleId } = req.params;

      const {
        serviceType,
        serviceDate,
        mileage,
        cost,
        shop,
        notes,
        nextServiceDate,
  nextServiceMileage,
      } = req.body;

      const record = await prisma.maintenanceRecord.create({
        data: {
          vehicleId,
          serviceType,
          serviceDate: new Date(serviceDate),
          mileage: Number(mileage),
          cost:
            cost === "" || cost === undefined
              ? null
              : Number(cost),
          shop: shop || null,
          notes: notes || null,
          nextServiceDate: nextServiceDate 
            ? new Date(nextServiceDate) 
            : null,
          nextServiceMileage: 
            nextServiceMileage === "" || nextServiceMileage === undefined
              ? null
              : Number(nextServiceMileage),
        },
      });

      res.status(201).json(record);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Unable to create maintenance record",
      });
    }
  }
);

app.get("/api/dashboard", async (_req, res) => {
  try {
    const totalVehicles = await prisma.vehicle.count();

    const totalMaintenance =
      await prisma.maintenanceRecord.count();

    const maintenanceCosts =
      await prisma.maintenanceRecord.aggregate({
        _sum: {
          cost: true,
        },
      });

    res.json({
      totalVehicles,
      totalMaintenance,
      totalCost: maintenanceCosts._sum.cost ?? 0,
    });
  } catch (error) {
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to delete maintenance record",
    });
  }
});

app.patch("/api/maintenance/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      serviceType,
      serviceDate,
      mileage,
      cost,
      shop,
      notes,
      nextServiceDate,
  nextServiceMileage
    } = req.body;

    const record = await prisma.maintenanceRecord.update({
      where: { id },
      data: {
        serviceType,
        serviceDate: new Date(serviceDate),
        mileage: Number(mileage),
        cost:
          cost === "" || cost === undefined
            ? null
            : Number(cost),
        shop: shop || null,
        notes: notes || null,
        nextServiceDate: nextServiceDate 
          ? new Date(nextServiceDate) 
          : null,
        nextServiceMileage: 
          nextServiceMileage === "" || nextServiceMileage === undefined
            ? null
            : Number(nextServiceMileage),
      },
    });

    res.json(record);
  } catch (error) {
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to load maintenance records",
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});