import type {
  Vehicle,
  MaintenanceRecord,
  FuelRecord,
} from "../types";

type VehicleDetailProps = {
  vehicle: Vehicle;
  maintenanceRecords: MaintenanceRecord[];
  fuelRecords: FuelRecord[];
  onClose: () => void;
};

export default function VehicleDetail({
  vehicle,
  maintenanceRecords,
  fuelRecords,
  onClose,
}: VehicleDetailProps) {
  const vehicleMaintenance = maintenanceRecords.filter(
    (record) => record.vehicleId === vehicle.id
  );

  const vehicleFuel = fuelRecords.filter(
    (record) => record.vehicleId === vehicle.id
  );

  const maintenanceSpent = vehicleMaintenance.reduce(
    (sum, record) => sum + (record.cost ?? 0),
    0
  );

  const fuelSpent = vehicleFuel.reduce(
    (sum, record) => sum + (record.totalCost ?? 0),
    0
  );

  const totalOwnershipCost =
    maintenanceSpent + fuelSpent;

  const sortedMaintenance = [
    ...vehicleMaintenance,
  ].sort(
    (a, b) =>
      new Date(b.serviceDate).getTime() -
      new Date(a.serviceDate).getTime()
  );

  const sortedFuel = [...vehicleFuel].sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );

  const lastService = sortedMaintenance[0];
  const lastFuelRecord = sortedFuel[0];

  const sortedFuelForMpg = [...vehicleFuel].sort(
    (a, b) =>
      new Date(a.date).getTime() -
      new Date(b.date).getTime()
  );

  const mpgValues = sortedFuelForMpg
    .map((record, index) => {
      if (index === 0) {
        return null;
      }

      const previousRecord =
        sortedFuelForMpg[index - 1];

      if (record.gallons <= 0) {
        return null;
      }

      const milesDriven =
        record.mileage - previousRecord.mileage;

      if (milesDriven <= 0) {
        return null;
      }

      return milesDriven / record.gallons;
    })
    .filter(
      (value): value is number => value !== null
    );

  const averageMpg =
    mpgValues.length > 0
      ? mpgValues.reduce(
          (sum, mpg) => sum + mpg,
          0
        ) / mpgValues.length
      : null;

  return (
    <div className="card">
      <h2>
        🚘 {vehicle.year} {vehicle.make}{" "}
        {vehicle.model}
      </h2>

      <div className="vehicle-info">
        <p>
          <strong>Trim:</strong>{" "}
          {vehicle.trim || "—"}
        </p>

        <p>
          <strong>License Plate:</strong>{" "}
          {vehicle.licensePlate || "—"}
        </p>

        <p>
          <strong>Current Mileage:</strong>{" "}
          {vehicle.currentMileage.toLocaleString()} miles
        </p>
      </div>

      <div className="vehicle-stats">
        <p>
          <strong>Last Service:</strong>{" "}
          {lastService
            ? lastService.serviceType
            : "—"}
        </p>

        <p>
          <strong>Last Service Date:</strong>{" "}
          {lastService
            ? new Date(
                lastService.serviceDate
              ).toLocaleDateString()
            : "—"}
        </p>

        <p>
          <strong>Last Fuel Fill-Up:</strong>{" "}
          {lastFuelRecord
            ? new Date(
                lastFuelRecord.date
              ).toLocaleDateString()
            : "—"}
        </p>

        <p>
          <strong>Last Fuel Mileage:</strong>{" "}
          {lastFuelRecord
            ? `${lastFuelRecord.mileage.toLocaleString()} miles`
            : "—"}
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>🔧 Services</h3>
          <h2>{vehicleMaintenance.length}</h2>
        </div>

        <div className="dashboard-card">
          <h3>💲 Maintenance</h3>
          <h2>${maintenanceSpent.toFixed(2)}</h2>
        </div>

        <div className="dashboard-card">
          <h3>⛽ Fuel Records</h3>
          <h2>{vehicleFuel.length}</h2>
        </div>

        <div className="dashboard-card">
          <h3>💲 Fuel Spent</h3>
          <h2>${fuelSpent.toFixed(2)}</h2>
        </div>

        <div className="dashboard-card">
          <h3>📊 Average MPG</h3>
          <h2>
            {averageMpg !== null
              ? averageMpg.toFixed(1)
              : "—"}
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>💰 Ownership Cost</h3>
          <h2>
            ${totalOwnershipCost.toFixed(2)}
          </h2>
        </div>
      </div>

      <h3>Recent Maintenance</h3>

      {sortedMaintenance.length === 0 ? (
        <p>No maintenance records yet.</p>
      ) : (
        sortedMaintenance
          .slice(0, 3)
          .map((record) => (
            <div
              key={record.id}
              className="maintenance-record"
            >
              <h4>{record.serviceType}</h4>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  record.serviceDate
                ).toLocaleDateString()}
              </p>

              <p>
                <strong>Mileage:</strong>{" "}
                {record.mileage.toLocaleString()} miles
              </p>

              <p>
                <strong>Cost:</strong>{" "}
                {record.cost !== null
                  ? `$${record.cost.toFixed(2)}`
                  : "—"}
              </p>
            </div>
          ))
      )}

      <h3>Recent Fuel Fill-Ups</h3>

      {sortedFuel.length === 0 ? (
        <p>No fuel records yet.</p>
      ) : (
        sortedFuel.slice(0, 3).map((record) => (
          <div
            key={record.id}
            className="maintenance-record"
          >
            <h4>⛽ Fuel Fill-Up</h4>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(
                record.date
              ).toLocaleDateString()}
            </p>

            <p>
              <strong>Mileage:</strong>{" "}
              {record.mileage.toLocaleString()} miles
            </p>

            <p>
              <strong>Gallons:</strong>{" "}
              {record.gallons.toFixed(2)}
            </p>

            <p>
              <strong>Total Cost:</strong>{" "}
              {record.totalCost !== null
                ? `$${record.totalCost.toFixed(2)}`
                : "—"}
            </p>

            <p>
              <strong>Station:</strong>{" "}
              {record.station || "—"}
            </p>
          </div>
        ))
      )}

      <div style={{ marginTop: "20px" }}>
        <button
          type="button"
          onClick={onClose}
        >
          Close Details
        </button>
      </div>
    </div>
  );
}