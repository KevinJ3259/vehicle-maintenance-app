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

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("vehicle_maintenance_token")
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem("vehicle_maintenance_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  function authHeaders(includeJson = false): HeadersInit {
    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.message || "Unable to continue");
        return;
      }

      localStorage.setItem("vehicle_maintenance_token", data.token);
      localStorage.setItem("vehicle_maintenance_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setAuthName("");
      setAuthPassword("");
    } catch {
      setAuthError("Unable to connect to the server");
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("vehicle_maintenance_token");
    localStorage.removeItem("vehicle_maintenance_user");
    setToken(null);
    setUser(null);
    setVehicles([]);
    setMaintenanceRecords([]);
    setAllMaintenanceRecords([]);
    setFuelRecords([]);
    setSelectedVehicleId(null);
    setDetailVehicleId(null);
  }
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
  const [expectedMpg, setExpectedMpg] = useState("");

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
        `${API_URL}/api/vehicles`,
        { headers: authHeaders() }
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
        `${API_URL}/api/dashboard`,
        { headers: authHeaders() }
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
        `${API_URL}/api/maintenance`,
        { headers: authHeaders() }
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
      `${API_URL}/api/vehicles/${vehicleId}/fuel`,
      { headers: authHeaders() }
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
      `${API_URL}/api/vehicles/${vehicleId}/maintenance`,
      { headers: authHeaders() }
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
    if (token) {
      loadVehicles();
      loadDashboard();
      loadAllMaintenance();
    }
  }, [token]);

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
          headers: authHeaders(true),
          body: JSON.stringify({
            year,
            make,
            model,
            trim,
            licensePlate,
            currentMileage,
            expectedMpg,
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
      setExpectedMpg("");

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
        headers: authHeaders(),
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
    setExpectedMpg(vehicle.expectedMpg?.toString() || "");

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
        headers: authHeaders(true),
        body: JSON.stringify({
          year,
          make,
          model,
          trim,
          licensePlate,
          currentMileage,
          expectedMpg,
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
    setExpectedMpg("");
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
        headers: authHeaders(true),
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
        headers: authHeaders(),
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
        headers: authHeaders(true),
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
        headers: authHeaders(true),
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
        headers: authHeaders(true),
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
        headers: authHeaders(),
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

  if (!token) {
    return (
      <div className="container">
        <div
          style={{
            maxWidth: "460px",
            margin: "60px auto",
            padding: "28px",
            borderRadius: "16px",
            background: "white",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
          }}
        >
          <h1 className="title">🚗 Vehicle Maintenance</h1>
          <h2>{authMode === "login" ? "Log In" : "Create Account"}</h2>

          <form onSubmit={handleAuth}>
            {authMode === "register" && (
              <label>
                Name
                <input
                  type="text"
                  value={authName}
                  onChange={(event) => setAuthName(event.target.value)}
                  required
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>

            {authError && <p style={{ color: "#b91c1c" }}>{authError}</p>}

            <button type="submit" disabled={authLoading}>
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                  ? "Log In"
                  : "Create Account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setAuthError("");
            }}
            style={{ marginTop: "14px" }}
          >
            {authMode === "login"
              ? "Need an account? Register"
              : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <p>Welcome, {user?.name}</p>
        <button type="button" onClick={logout}>
          Log Out
        </button>
      </div>

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
        expectedMpg={expectedMpg}
        setYear={setYear}
        setMake={setMake}
        setModel={setModel}
        setTrim={setTrim}
        setLicensePlate={setLicensePlate}
        setCurrentMileage={setCurrentMileage}
        setExpectedMpg={setExpectedMpg}
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
            expectedMpg={
              vehicles.find(
                (vehicle) => vehicle.id === selectedVehicleId
              )?.expectedMpg ?? null
            }
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

