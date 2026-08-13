export type Vehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  licensePlate?: string;
  currentMileage: number;
};

export type MaintenanceRecord = {
  id: string;
  serviceType: string;
  serviceDate: string;
  mileage: number;
  cost?: number;
  shop?: string;
  notes?: string;
  vehicleId: string;
};