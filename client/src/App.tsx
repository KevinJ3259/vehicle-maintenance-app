import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Vehicle, MaintenanceRecord } from "./types";
import VehicleCard from "./components/VehicleCard";
import VehicleForm from "./components/VehicleForm";
import MaintenanceSection from "./components/MaintenanceSection";
import Dashboard from "./components/Dashboard";
import "./App.css";

type DashboardStats = {
  totalVehicles: number;
  totalMaintenance: number;
  totalCost: number;
};

function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [trim, setTrim] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [currentMileage, setCurrentMileage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );

  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);

  const [serviceType, setServiceType] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [maintenanceMileage, setMaintenanceMileage] = useState("");
  const [cost, setCost] = useState("");
  const [shop, setShop] = useState("");
  const [notes, setNotes] = useState("");

  const [editingMaintenanceId, setEditingMaintenanceId] =
    useState<string | null>(null);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalMaintenance: 0,
    totalCost: 0,
  });

  async function loadVehicles() {
    const response = await fetch("http://localhost:4000/api");
    const data = await response.json();
    setVehicles(data.vehicles);
  }

  async function loadDashboard() {
    const response = await fetch("http://localhost:4000/api/dashboard");
    const data = await response.json();
    setDashboardStats(data);
  }

  useEffect(() => {
    loadVehicles();
    loadDashboard();
  }, []);

  async function addVehicle(event: FormEvent) {
    event.preventDefault();

    const response = await fetch("http://localhost:4000/api/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        year,
        make,
        model,
        trim,
        licensePlate,
        currentMileage,
      }),
    });

    if (!response.ok) {
      alert("Unable to add vehicle.");
      return;
    }

    setYear("");
    setMake("");
    setModel("");
    setTrim("");
    setLicensePlate("");
    setCurrentMileage("");

    await loadVehicles();
    await loadDashboard();
  }

  async function deleteVehicle(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmed) return;

    const response = await fetch(
      `http://localhost:4000/api/vehicles/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      alert("Unable to delete vehicle.");
      return;
    }

    await loadVehicles();
    await loadDashboard();
  }

  function startEdit(vehicle: Vehicle) {
    setEditingId(vehicle.id);
    setYear(vehicle.year.toString());
    setMake(vehicle.make);
    setModel(vehicle.model);
    setTrim(vehicle.trim || "");
    setLicensePlate(vehicle.licensePlate || "");
    setCurrentMileage(vehicle.currentMileage.toString());

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function updateVehicle(event: FormEvent) {
    event.preventDefault();

    if (!editingId) return;

    const response = await fetch(
      `http://localhost:4000/api/vehicles/${editingId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year,
          make,
          model,
          trim,
          licensePlate,
          currentMileage,
        }),
      }
    );

    if (!response.ok) {
      alert("Unable to update vehicle.");
      return;
    }

    setEditingId(null);
    setYear("");
    setMake("");
    setModel("");
    setTrim("");
    setLicensePlate("");
    setCurrentMileage("");

    await loadVehicles();
    await loadDashboard();
  }

  async function loadMaintenance(vehicleId: string) {
    const response = await fetch(
      `http://localhost:4000/api/vehicles/${vehicleId}/maintenance`
    );

    const data = await response.json();

    setMaintenanceRecords(data);
    setSelectedVehicleId(vehicleId);
  }

  async function addMaintenance(event: FormEvent) {
    event.preventDefault();

    if (!selectedVehicleId) return;

    const response = await fetch(
      `http://localhost:4000/api/vehicles/${selectedVehicleId}/maintenance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceType,
          serviceDate,
          mileage: maintenanceMileage,
          cost,
          shop,
          notes,
        }),
      }
    );

    if (!response.ok) {
      alert("Unable to save maintenance record.");
      return;
    }

    setServiceType("");
    setServiceDate("");
    setMaintenanceMileage("");
    setCost("");
    setShop("");
    setNotes("");

    await loadMaintenance(selectedVehicleId);
    await loadDashboard();
  }

  async function deleteMaintenance(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance record?"
    );

    if (!confirmed) return;

    const response = await fetch(
      `http://localhost:4000/api/maintenance/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      alert("Unable to delete maintenance record.");
      return;
    }

    if (selectedVehicleId) {
      await loadMaintenance(selectedVehicleId);
    }

    await loadDashboard();
  }

  function startMaintenanceEdit(record: MaintenanceRecord) {
    setEditingMaintenanceId(record.id);
    setServiceType(record.serviceType);
    setServiceDate(record.serviceDate.slice(0, 10));
    setMaintenanceMileage(record.mileage.toString());
    setCost(record.cost?.toString() || "");
    setShop(record.shop || "");
    setNotes(record.notes || "");
  }

  async function updateMaintenance(event: FormEvent) {
    event.preventDefault();

    if (!editingMaintenanceId || !selectedVehicleId) return;

    const response = await fetch(
      `http://localhost:4000/api/maintenance/${editingMaintenanceId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceType,
          serviceDate,
          mileage: maintenanceMileage,
          cost,
          shop,
          notes,
        }),
      }
    );

    if (!response.ok) {
      alert("Unable to update maintenance record.");
      return;
    }

    setEditingMaintenanceId(null);
    setServiceType("");
    setServiceDate("");
    setMaintenanceMileage("");
    setCost("");
    setShop("");
    setNotes("");

    await loadMaintenance(selectedVehicleId);
    await loadDashboard();
  }

  return (
    <div className="container">
      <h1 className="title">🚗 Vehicle Maintenance Dashboard</h1>

      <Dashboard
        totalVehicles={dashboardStats.totalVehicles}
        totalMaintenance={dashboardStats.totalMaintenance}
        totalCost={dashboardStats.totalCost}
      />

      <VehicleForm
        editingId={editingId}
        year={year}
        make={make}
        model={model}
        trim={trim}
        licensePlate={licensePlate}
        currentMileage={currentMileage}
        setYear={setYear}
        setMake={setMake}
        setModel={setModel}
        setTrim={setTrim}
        setLicensePlate={setLicensePlate}
        setCurrentMileage={setCurrentMileage}
        onSubmit={editingId ? updateVehicle : addVehicle}
        onCancelEdit={() => {
          setEditingId(null);
          setYear("");
          setMake("");
          setModel("");
          setTrim("");
          setLicensePlate("");
          setCurrentMileage("");
        }}
      />

      <h2>My Vehicles</h2>

      {vehicles.length === 0 ? (
        <p>No vehicles found.</p>
      ) : (
        vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onEdit={startEdit}
            onDelete={deleteVehicle}
            onMaintenance={loadMaintenance}
          />
        ))
      )}

      {selectedVehicleId && (
        <MaintenanceSection
          maintenanceRecords={maintenanceRecords}
          serviceType={serviceType}
          serviceDate={serviceDate}
          maintenanceMileage={maintenanceMileage}
          cost={cost}
          shop={shop}
          notes={notes}
          setServiceType={setServiceType}
          setServiceDate={setServiceDate}
          setMaintenanceMileage={setMaintenanceMileage}
          setCost={setCost}
          setShop={setShop}
          setNotes={setNotes}
          editingMaintenanceId={editingMaintenanceId}
          onSubmit={
            editingMaintenanceId
              ? updateMaintenance
              : addMaintenance
          }
          onEdit={startMaintenanceEdit}
          onDelete={deleteMaintenance}
        />
      )}
    </div>
  );
}

export default App;