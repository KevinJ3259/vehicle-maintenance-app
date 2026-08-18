import type {
  MaintenanceRecord,
  Vehicle,
} from "../types";

type VehicleCardProps = {
  vehicle: Vehicle;
  maintenanceRecords: MaintenanceRecord[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onMaintenance: (id: string) => void;
  onViewDetails: (id: string) => void;
};

export default function VehicleCard({
  vehicle,
  maintenanceRecords,
  onEdit,
  onDelete,
  onMaintenance,
  onViewDetails,
}: VehicleCardProps) {
  const vehicleMaintenance = maintenanceRecords.filter(
    (record) => record.vehicleId === vehicle.id
  );

  const totalMaintenanceCost =
    vehicleMaintenance.reduce(
      (sum, record) => sum + (record.cost ?? 0),
      0
    );

  const sortedMaintenance = [
    ...vehicleMaintenance,
  ].sort(
    (a, b) =>
      new Date(b.serviceDate).getTime() -
      new Date(a.serviceDate).getTime()
  );

  const lastService = sortedMaintenance[0];

  const lastServiceDate = lastService
  ? new Date(lastService.serviceDate)
  : null;

const daysSinceLastService = lastServiceDate
  ? Math.floor(
      (Date.now() - lastServiceDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  : null;

  const costPerMile =
    vehicle.currentMileage > 0
      ? totalMaintenanceCost / vehicle.currentMileage
      : 0;

  return (
    <div className="card vehicle-card">
      <h3>
        {vehicle.year} {vehicle.make} {vehicle.model}
      </h3>

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
          <strong>Mileage:</strong>{" "}
          {vehicle.currentMileage.toLocaleString()} miles
        </p>
      </div>

      <div className="vehicle-stats">
        <p>
          <strong>Services:</strong>{" "}
          {vehicleMaintenance.length}
        </p>

        <p>
          <strong>Maintenance Spent:</strong>{" "}
          ${totalMaintenanceCost.toFixed(2)}
        </p>

        <p>
          <strong>Cost Per Mile:</strong>{" "}
          ${costPerMile.toFixed(3)}
        </p>

        <p>
          <strong>Last Service:</strong>{" "}
          {lastService
            ? lastService.serviceType
            : "—"}
        </p>

        <p>
          <strong>Last Service Mileage:</strong>{" "}
          {lastService
            ? `${lastService.mileage.toLocaleString()} miles`
            : "—"}
        </p>

        <p>
  <strong>Last Service Date:</strong>{" "}
  {lastServiceDate
    ? lastServiceDate.toLocaleDateString()
    : "—"}
</p>

<p>
  <strong>Days Since Last Service:</strong>{" "}
  {daysSinceLastService !== null
    ? `${daysSinceLastService} days`
    : "—"}
</p>
      </div>

      <div className="button-row">
        <button
          type="button"
          className="edit-btn"
          onClick={() => onEdit(vehicle)}
        >
          ✏️ Edit
        </button>

        <button
          type="button"
          className="delete-btn"
          onClick={() => onDelete(vehicle.id)}
        >
          🗑 Delete
        </button>

        <button
  type="button"
  onClick={() => onViewDetails(vehicle.id)}
>
  👁 View Details
</button>
      </div>

      <div style={{ marginTop: "15px" }}>
        <button
          type="button"
          className="maintenance-btn"
          onClick={() =>
            onMaintenance(vehicle.id)
          }
        >
          🔧 Maintenance
        </button>
      </div>
    </div>
  );
}