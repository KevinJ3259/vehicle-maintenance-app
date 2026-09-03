import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "./prisma.js";

dotenv.config();

const app = express();
const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from the .env file");
}

interface AuthRequest extends Request {
  userId?: string;
}

app.use(cors());
app.use(express.json());

function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (typeof payload === "string" || typeof payload.userId !== "string") {
      throw new Error("Invalid token payload");
    }

    req.userId = payload.userId;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

async function findOwnedVehicle(vehicleId: string, userId: string) {
  return prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
  });
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        message: "Name, email, and password are required",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        message: "Password must be at least 8 characters",
      });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({
        message: "An account already exists with this email",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create account" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ message: "Incorrect email or password" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to log in" });
  }
});

app.get("/api/vehicles", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "Vehicle Maintenance API is running",
      vehicles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load vehicles" });
  }
});

app.post("/api/vehicles", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { year, make, model, trim, vin, licensePlate, currentMileage } =
      req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        year: Number(year),
        make,
        model,
        trim: trim || null,
        vin: vin || null,
        licensePlate: licensePlate || null,
        currentMileage: Number(currentMileage),
        userId: req.userId!,
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create vehicle" });
  }
});

app.patch(
  "/api/vehicles/:id",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const ownedVehicle = await findOwnedVehicle(id, req.userId!);

      if (!ownedVehicle) {
        res.status(404).json({ message: "Vehicle not found" });
        return;
      }

      const { year, make, model, trim, vin, licensePlate, currentMileage } =
        req.body;

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
      res.status(500).json({ message: "Unable to update vehicle" });
    }
  }
);

app.delete(
  "/api/vehicles/:id",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const ownedVehicle = await findOwnedVehicle(id, req.userId!);

      if (!ownedVehicle) {
        res.status(404).json({ message: "Vehicle not found" });
        return;
      }

      await prisma.vehicle.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to delete vehicle" });
    }
  }
);

app.get(
  "/api/vehicles/:vehicleId/maintenance",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const vehicleId = req.params.vehicleId as string;
      const ownedVehicle = await findOwnedVehicle(vehicleId, req.userId!);

      if (!ownedVehicle) {
        res.status(404).json({ message: "Vehicle not found" });
        return;
      }

      const records = await prisma.maintenanceRecord.findMany({
        where: { vehicleId },
        orderBy: { serviceDate: "desc" },
      });

      res.json(records);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to load maintenance records" });
    }
  }
);

app.post(
  "/api/vehicles/:vehicleId/maintenance",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const vehicleId = req.params.vehicleId as string;
      const ownedVehicle = await findOwnedVehicle(vehicleId, req.userId!);

      if (!ownedVehicle) {
        res.status(404).json({ message: "Vehicle not found" });
        return;
      }

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
          cost: cost === "" || cost === undefined ? null : Number(cost),
          shop: shop || null,
          notes: notes || null,
          nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
          nextServiceMileage:
            nextServiceMileage === "" || nextServiceMileage === undefined
              ? null
              : Number(nextServiceMileage),
        },
      });

      const maintenanceMileage = Number(mileage);
      if (maintenanceMileage > ownedVehicle.currentMileage) {
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { currentMileage: maintenanceMileage },
        });
      }

      res.status(201).json(record);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to create maintenance record" });
    }
  }
);

app.get("/api/dashboard", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userVehicleFilter = { vehicle: { userId: req.userId! } };

    const [totalVehicles, totalMaintenance, maintenanceCosts] =
      await Promise.all([
        prisma.vehicle.count({ where: { userId: req.userId! } }),
        prisma.maintenanceRecord.count({ where: userVehicleFilter }),
        prisma.maintenanceRecord.aggregate({
          where: userVehicleFilter,
          _sum: { cost: true },
        }),
      ]);

    res.json({
      totalVehicles,
      totalMaintenance,
      totalCost: maintenanceCosts._sum.cost ?? 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load dashboard statistics" });
  }
});

app.get("/api/maintenance", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const records = await prisma.maintenanceRecord.findMany({
      where: { vehicle: { userId: req.userId! } },
      orderBy: { serviceDate: "desc" },
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load maintenance records" });
  }
});

app.delete(
  "/api/maintenance/:id",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const record = await prisma.maintenanceRecord.findFirst({
        where: { id, vehicle: { userId: req.userId! } },
      });

      if (!record) {
        res.status(404).json({ message: "Maintenance record not found" });
        return;
      }

      await prisma.maintenanceRecord.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to delete maintenance record" });
    }
  }
);

app.patch(
  "/api/maintenance/:id",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const existingRecord = await prisma.maintenanceRecord.findFirst({
        where: { id, vehicle: { userId: req.userId! } },
      });

      if (!existingRecord) {
        res.status(404).json({ message: "Maintenance record not found" });
        return;
      }

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

      const record = await prisma.maintenanceRecord.update({
        where: { id },
        data: {
          serviceType,
          serviceDate: new Date(serviceDate),
          mileage: Number(mileage),
          cost: cost === "" || cost === undefined ? null : Number(cost),
          shop: shop || null,
          notes: notes || null,
          nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
          nextServiceMileage:
            nextServiceMileage === "" || nextServiceMileage === undefined
              ? null
              : Number(nextServiceMileage),
        },
      });

      const vehicle = await prisma.vehicle.findUnique({
        where: { id: record.vehicleId },
      });
      const editedMileage = Number(mileage);

      if (vehicle && editedMileage > vehicle.currentMileage) {
        await prisma.vehicle.update({
          where: { id: record.vehicleId },
          data: { currentMileage: editedMileage },
        });
      }

      res.json(record);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to update maintenance record" });
    }
  }
);

app.get(
  "/api/vehicles/:vehicleId/fuel",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const vehicleId = req.params.vehicleId as string;
      const ownedVehicle = await findOwnedVehicle(vehicleId, req.userId!);

      if (!ownedVehicle) {
        res.status(404).json({ message: "Vehicle not found" });
        return;
      }

      const records = await prisma.fuelRecord.findMany({
        where: { vehicleId },
        orderBy: { date: "desc" },
      });

      res.json(records);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to load fuel records" });
    }
  }
);

app.post(
  "/api/vehicles/:vehicleId/fuel",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const vehicleId = req.params.vehicleId as string;
      const ownedVehicle = await findOwnedVehicle(vehicleId, req.userId!);

      if (!ownedVehicle) {
        res.status(404).json({ message: "Vehicle not found" });
        return;
      }

      const { date, mileage, gallons, pricePerGallon, totalCost, station, notes } =
        req.body;

      const record = await prisma.fuelRecord.create({
        data: {
          vehicleId,
          date: new Date(date),
          mileage: Number(mileage),
          gallons: Number(gallons),
          pricePerGallon:
            pricePerGallon === "" || pricePerGallon === undefined
              ? null
              : Number(pricePerGallon),
          totalCost:
            totalCost === "" || totalCost === undefined
              ? null
              : Number(totalCost),
          station: station || null,
          notes: notes || null,
        },
      });

      const fuelMileage = Number(mileage);
      if (fuelMileage > ownedVehicle.currentMileage) {
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { currentMileage: fuelMileage },
        });
      }

      res.status(201).json(record);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to create fuel record" });
    }
  }
);

app.delete(
  "/api/fuel/:id",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const record = await prisma.fuelRecord.findFirst({
        where: { id, vehicle: { userId: req.userId! } },
      });

      if (!record) {
        res.status(404).json({ message: "Fuel record not found" });
        return;
      }

      await prisma.fuelRecord.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to delete fuel record" });
    }
  }
);

app.patch(
  "/api/fuel/:id",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const existingRecord = await prisma.fuelRecord.findFirst({
        where: { id, vehicle: { userId: req.userId! } },
      });

      if (!existingRecord) {
        res.status(404).json({ message: "Fuel record not found" });
        return;
      }

      const { date, mileage, gallons, pricePerGallon, totalCost, station, notes } =
        req.body;

      const record = await prisma.fuelRecord.update({
        where: { id },
        data: {
          date: new Date(date),
          mileage: Number(mileage),
          gallons: Number(gallons),
          pricePerGallon:
            pricePerGallon === "" || pricePerGallon === undefined
              ? null
              : Number(pricePerGallon),
          totalCost:
            totalCost === "" || totalCost === undefined
              ? null
              : Number(totalCost),
          station: station || null,
          notes: notes || null,
        },
      });

      const vehicle = await prisma.vehicle.findUnique({
        where: { id: record.vehicleId },
      });
      const editedMileage = Number(mileage);

      if (vehicle && editedMileage > vehicle.currentMileage) {
        await prisma.vehicle.update({
          where: { id: record.vehicleId },
          data: { currentMileage: editedMileage },
        });
      }

      res.json(record);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to update fuel record" });
    }
  }
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
