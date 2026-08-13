import type { Vehicle } from "../types";

type VehicleCardProps = {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onMaintenance: (id: string) => void;
};

export default function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  onMaintenance,
}: VehicleCardProps) {
  return (
    <div className="card vehicle-card">
      <h3>
        {vehicle.year} {vehicle.make} {vehicle.model}
      </h3>

      <div className="vehicle-info">
        <p>
          <strong>Trim:</strong> {vehicle.trim || "—"}
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
      </div>

      <div style={{ marginTop: "15px" }}>
        <button
          type="button"
          className="maintenance-btn"
          onClick={() => onMaintenance(vehicle.id)}
        >
          🔧 Maintenance
        </button>
      </div>
    </div>
  );
}