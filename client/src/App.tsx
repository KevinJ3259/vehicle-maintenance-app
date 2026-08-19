import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import VehicleDetail from "./components/VehicleDetail";
import VehicleCard from "./components/VehicleCard";
import VehicleForm from "./components/VehicleForm";
import MaintenanceSection from "./components/MaintenanceSection";
import FuelSection from "./components/FuelSection";
import Dashboard from "./components/Dashboard";

import type {
  Vehicle,
  MaintenanceRecord,
  FuelRecord,
} from "./types";

import "./App.css";

/*
 * API base URL
 *
 * Production:
 * VITE_API_URL=https://vehicle-maintenance-app-z53d.onrender.com
 *
 * This also protects against accidentally setting VITE_API_URL
 * to a URL ending in /api or /.
 */
const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:4000"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

type DashboardStats = {
  totalVehicles: number;
  totalMaintenance: number;
  totalCost: number;
};

function App() {
  // --------------------------------------------------
  // Vehicle state
  // --------------------------------------------------

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [trim, setTrim] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [currentMileage, setCurrentMileage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [selectedVehicleId, setSelectedVehicleId] =
    useState<string | null>(null);

  const [detailVehicleId, setDetailVehicleId] =
    useState<string | null>(null);

  const detailVehicle = vehicles.find(
    (vehicle) => vehicle.id === detailVehicleId
  );

  // --------------------------------------------------
  // Maintenance state
  // --------------------------------------------------

  const [maintenanceRecords, setMaintenanceRecords] =
    useState<MaintenanceRecord[]>([]);

  const [
    allMaintenanceRecords,
    setAllMaintenanceRecords,
  ] = useState<MaintenanceRecord[]>([]);

  const [serviceType, setServiceType] = useState("");
  const [customServiceType, setCustomServiceType] =
    useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [maintenanceMileage, setMaintenanceMileage] =
    useState("");
  const [cost, setCost] = useState("");
  const [shop, setShop] = useState("");
  const [notes, setNotes] = useState("");

  const [nextServiceDate, setNextServiceDate] =
    useState("");

  const [nextServiceMileage, setNextServiceMileage] =
    useState("");

  const [
    editingMaintenanceId,
    setEditingMaintenanceId,
  ] = useState<string | null>(null);

  // --------------------------------------------------
  // Fuel state
  // --------------------------------------------------

  const [fuelRecords, setFuelRecords] =
    useState<FuelRecord[]>([]);

  const [fuelDate, setFuelDate] = useState("");
  const [fuelMileage, setFuelMileage] = useState("");
  const [gallons, setGallons] = useState("");
  const [pricePerGallon, setPricePerGallon] =
    useState("");
  const [totalFuelCost, setTotalFuelCost] =
    useState("");
  const [station, setStation] = useState("");
  const [fuelNotes, setFuelNotes] = useState("");

  const [editingFuelId, setEditingFuelId] =
    useState<string | null>(null);

  // --------------------------------------------------
  // Dashboard state
  // --------------------------------------------------

  const [dashboardStats, setDashboardStats] =
    useState<DashboardStats>({
      totalVehicles: 0,
      totalMaintenance: 0,
      totalCost: 0,
    });

  // --------------------------------------------------
  // Load data
  // --------------------------------------------------

  async function loadVehicles() {
    try {
      const response = await fetch(
        `${API_URL}/api/vehicles`
      );

      if (!response.ok) {
        console.error(
          "Unable to load vehicles:",
          response.status
        );
        return;
      }

      const data = await response.json();
      setVehicles(data.vehicles);
    } catch (error) {
      console.error("Unable to load vehicles:", error);
    }
  }

  async function loadDashboard() {
    try {
      const response = await fetch(
        `${API_URL}/api/dashboard`
      );

      if (!response.ok) {
        console.error(
          "Unable to load dashboard:",
          response.status
        );
        return;
      }

      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error("Unable to load dashboard:", error);
    }
  }

  async function loadAllMaintenance() {
    try {
      const response = await fetch(
        `${API_URL}/api/maintenance`
      );

      if (!response.ok) {
        console.error(
          "Unable to load all maintenance records:",
          response.status
        );
        return;
      }

      const data = await response.json();
      setAllMaintenanceRecords(data);
    } catch (error) {
      console.error(
        "Unable to load all maintenance records:",
        error
      );
    }
  }

  async function loadFuelRecords(vehicleId: string) {
    const response = await fetch(
      `${API_URL}/api/vehicles/${vehicleId}/fuel`
    );

    if (!response.ok) {
      alert("Unable to load fuel records.");
      return;
    }

    const data = await response.json();
    setFuelRecords(data);
  }

  async function loadMaintenance(vehicleId: string) {
    const response = await fetch(
      `${API_URL}/api/vehicles/${vehicleId}/maintenance`
    );

    if (!response.ok) {
      alert("Unable to load maintenance records.");
      return;
    }

    const data = await response.json();

    setMaintenanceRecords(data);
    setSelectedVehicleId(vehicleId);

    await loadFuelRecords(vehicleId);
  }

  useEffect(() => {
    loadVehicles();
    loadDashboard();
    loadAllMaintenance();
  }, []);

  // --------------------------------------------------
  // Vehicle functions
  // --------------------------------------------------

  async function addVehicle(event: FormEvent) {
    event.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/api/vehicles`,
        {
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
        }
      );

      if (!response.ok) {
        console.error(
          "Unable to add vehicle:",
          response.status
        );
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
    } catch (error) {
      console.error("Unable to add vehicle:", error);
      alert("Unable to add vehicle.");
    }
  }

  async function deleteVehicle(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmed) return;

    const response = await fetch(
      `${API_URL}/api/vehicles/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      alert("Unable to delete vehicle.");
      return;
    }

    if (selectedVehicleId === id) {
      setSelectedVehicleId(null);
      setMaintenanceRecords([]);
      setFuelRecords([]);
    }

    await loadVehicles();
    await loadDashboard();
    await loadAllMaintenance();
  }

  function startEdit(vehicle: Vehicle) {
    setEditingId(vehicle.id);

    setYear(vehicle.year.toString());
    setMake(vehicle.make);
    setModel(vehicle.model);
    setTrim(vehicle.trim || "");
    setLicensePlate(vehicle.licensePlate || "");
    setCurrentMileage(
      vehicle.currentMileage.toString()
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function updateVehicle(event: FormEvent) {
    event.preventDefault();

    if (!editingId) return;

    const response = await fetch(
      `${API_URL}/api/vehicles/${editingId}`,
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

    cancelVehicleEdit();

    await loadVehicles();
    await loadDashboard();
  }

  function cancelVehicleEdit() {
    setEditingId(null);
    setYear("");
    setMake("");
    setModel("");
    setTrim("");
    setLicensePlate("");
    setCurrentMileage("");
  }

  // --------------------------------------------------
  // Maintenance functions
  // --------------------------------------------------

  async function addMaintenance(event: FormEvent) {
    event.preventDefault();

    if (!selectedVehicleId) return;

    const finalServiceType =
      serviceType === "Custom Service"
        ? customServiceType
        : serviceType;

    const response = await fetch(
      `${API_URL}/api/vehicles/${selectedVehicleId}/maintenance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceType: finalServiceType,
          serviceDate,
          mileage: maintenanceMileage,
          cost,
          shop,
          notes,
          nextServiceDate,
          nextServiceMileage,
        }),
      }
    );

    if (!response.ok) {
      alert("Unable to save maintenance record.");
      return;
    }

    cancelMaintenanceEdit();

    await loadMaintenance(selectedVehicleId);
    await loadVehicles();
    await loadDashboard();
    await loadAllMaintenance();
  }

  async function deleteMaintenance(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance record?"
    );

    if (!confirmed) return;

    const response = await fetch(
      `${API_URL}/api/maintenance/${id}`,
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
    await loadAllMaintenance();
  }

  function startMaintenanceEdit(
    record: MaintenanceRecord
  ) {
    setEditingMaintenanceId(record.id);

    setServiceType(record.serviceType);
    setCustomServiceType("");

    setServiceDate(
      record.serviceDate.slice(0, 10)
    );

    setMaintenanceMileage(
      record.mileage.toString()
    );

    setCost(record.cost?.toString() || "");
    setShop(record.shop || "");
    setNotes(record.notes || "");

    setNextServiceDate(
      record.nextServiceDate
        ? record.nextServiceDate.slice(0, 10)
        : ""
    );

    setNextServiceMileage(
      record.nextServiceMileage?.toString() || ""
    );
  }

  async function updateMaintenance(
    event: FormEvent
  ) {
    event.preventDefault();

    if (
      !editingMaintenanceId ||
      !selectedVehicleId
    ) {
      return;
    }

    const finalServiceType =
      serviceType === "Custom Service"
        ? customServiceType
        : serviceType;

    const response = await fetch(
      `${API_URL}/api/maintenance/${editingMaintenanceId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceType: finalServiceType,
          serviceDate,
          mileage: maintenanceMileage,
          cost,
          shop,
          notes,
          nextServiceDate,
          nextServiceMileage,
        }),
      }
    );

    if (!response.ok) {
      alert("Unable to update maintenance record.");
      return;
    }

    cancelMaintenanceEdit();

    await loadMaintenance(selectedVehicleId);
    await loadVehicles();
    await loadDashboard();
    await loadAllMaintenance();
  }

  function cancelMaintenanceEdit() {
    setEditingMaintenanceId(null);
    setServiceType("");
    setCustomServiceType("");
    setServiceDate("");
    setMaintenanceMileage("");
    setCost("");
    setShop("");
    setNotes("");
    setNextServiceDate("");
    setNextServiceMileage("");
  }

  async function openVehicleDetails(
    vehicleId: string
  ) {
    await loadFuelRecords(vehicleId);
    setDetailVehicleId(vehicleId);
  }

  // --------------------------------------------------
  // Fuel functions
  // --------------------------------------------------

  async function addFuelRecord(event: FormEvent) {
    event.preventDefault();

    if (!selectedVehicleId) return;

    const response = await fetch(
      `${API_URL}/api/vehicles/${selectedVehicleId}/fuel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: fuelDate,
          mileage: fuelMileage,
          gallons,
          pricePerGallon,
          totalCost: totalFuelCost,
          station,
          notes: fuelNotes,
        }),
      }
    );

    if (!response.ok) {
      alert("Unable to save fuel record.");
      return;
    }

    cancelFuelEdit();

    await loadFuelRecords(selectedVehicleId);
    await loadVehicles();
  }

  function startFuelEdit(record: FuelRecord) {
    setEditingFuelId(record.id);

    setFuelDate(record.date.slice(0, 10));
    setFuelMileage(record.mileage.toString());
    setGallons(record.gallons.toString());

    setPricePerGallon(
      record.pricePerGallon?.toString() || ""
    );

    setTotalFuelCost(
      record.totalCost?.toString() || ""
    );

    setStation(record.station || "");
    setFuelNotes(record.notes || "");
  }

  async function updateFuelRecord(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!editingFuelId || !selectedVehicleId) {
      return;
    }

    const response = await fetch(
      `${API_URL}/api/fuel/${editingFuelId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: fuelDate,
          mileage: fuelMileage,
          gallons,
          pricePerGallon,
          totalCost: totalFuelCost,
          station,
          notes: fuelNotes,
        }),
      }
    );

    if (!response.ok) {
      alert("Unable to update fuel record.");
      return;
    }

    cancelFuelEdit();

    await loadFuelRecords(selectedVehicleId);
    await loadVehicles();
  }

  async function deleteFuelRecord(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this fuel record?"
    );

    if (!confirmed) return;

    const response = await fetch(
      `${API_URL}/api/fuel/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      alert("Unable to delete fuel record.");
      return;
    }

    if (selectedVehicleId) {
      await loadFuelRecords(selectedVehicleId);
    }
  }

  function cancelFuelEdit() {
    setEditingFuelId(null);
    setFuelDate("");
    setFuelMileage("");
    setGallons("");
    setPricePerGallon("");
    setTotalFuelCost("");
    setStation("");
    setFuelNotes("");
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="container">
      <h1 className="title">
        🚗 Vehicle Maintenance Dashboard
      </h1>

      <Dashboard
        totalVehicles={dashboardStats.totalVehicles}
        totalMaintenance={
          dashboardStats.totalMaintenance
        }
        totalCost={dashboardStats.totalCost}
        vehicles={vehicles}
        maintenanceRecords={allMaintenanceRecords}
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
        onSubmit={
          editingId
            ? updateVehicle
            : addVehicle
        }
        onCancelEdit={cancelVehicleEdit}
      />

      <h2>My Vehicles</h2>

      {vehicles.length === 0 ? (
        <p>No vehicles found.</p>
      ) : (
        vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            maintenanceRecords={
              allMaintenanceRecords
            }
            onEdit={startEdit}
            onDelete={deleteVehicle}
            onMaintenance={loadMaintenance}
            onViewDetails={openVehicleDetails}
          />
        ))
      )}

      {detailVehicle && (
        <VehicleDetail
          vehicle={detailVehicle}
          maintenanceRecords={
            allMaintenanceRecords
          }
          fuelRecords={fuelRecords}
          onClose={() =>
            setDetailVehicleId(null)
          }
        />
      )}

      {selectedVehicleId && (
        <>
          <MaintenanceSection
            maintenanceRecords={
              maintenanceRecords
            }
            serviceType={serviceType}
            customServiceType={
              customServiceType
            }
            serviceDate={serviceDate}
            maintenanceMileage={
              maintenanceMileage
            }
            cost={cost}
            shop={shop}
            notes={notes}
            nextServiceDate={nextServiceDate}
            nextServiceMileage={
              nextServiceMileage
            }
            setServiceType={setServiceType}
            setCustomServiceType={
              setCustomServiceType
            }
            setServiceDate={setServiceDate}
            setMaintenanceMileage={
              setMaintenanceMileage
            }
            setCost={setCost}
            setShop={setShop}
            setNotes={setNotes}
            setNextServiceDate={
              setNextServiceDate
            }
            setNextServiceMileage={
              setNextServiceMileage
            }
            editingMaintenanceId={
              editingMaintenanceId
            }
            onSubmit={
              editingMaintenanceId
                ? updateMaintenance
                : addMaintenance
            }
            onEdit={startMaintenanceEdit}
            onDelete={deleteMaintenance}
            onCancelEdit={
              cancelMaintenanceEdit
            }
          />

          <FuelSection
            fuelRecords={fuelRecords}
            fuelDate={fuelDate}
            fuelMileage={fuelMileage}
            gallons={gallons}
            pricePerGallon={pricePerGallon}
            totalFuelCost={totalFuelCost}
            station={station}
            fuelNotes={fuelNotes}
            setFuelDate={setFuelDate}
            setFuelMileage={setFuelMileage}
            setGallons={setGallons}
            setPricePerGallon={
              setPricePerGallon
            }
            setTotalFuelCost={
              setTotalFuelCost
            }
            setStation={setStation}
            setFuelNotes={setFuelNotes}
            editingFuelId={editingFuelId}
            onSubmit={
              editingFuelId
                ? updateFuelRecord
                : addFuelRecord
            }
            onEdit={startFuelEdit}
            onDelete={deleteFuelRecord}
            onCancelEdit={cancelFuelEdit}
          />
        </>
      )}
    </div>
  );
}

export default App;