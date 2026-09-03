export type Vehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  licensePlate?: string;
  currentMileage: number;
  expectedMpg?: number | null;
};

export type MaintenanceRecord = {
  id: string;
  serviceType: string;
  serviceDate: string;
  mileage: number;
  cost: number | null;
  shop: string | null;
  notes: string | null;
  nextServiceDate: string | null;
  nextServiceMileage: number | null;
  vehicleId: string;
  createdAt: string;
  updatedAt: string;
};

export type FuelRecord = {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  gallons: number;
  pricePerGallon: number | null;
  totalCost: number | null;
  station: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
