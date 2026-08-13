import type { FormEvent } from "react";
import type { MaintenanceRecord } from "../types";

type MaintenanceSectionProps = {
  maintenanceRecords: MaintenanceRecord[];

  serviceType: string;
  serviceDate: string;
  maintenanceMileage: string;
  cost: string;
  shop: string;
  notes: string;

  setServiceType: (value: string) => void;
  setServiceDate: (value: string) => void;
  setMaintenanceMileage: (value: string) => void;
  setCost: (value: string) => void;
  setShop: (value: string) => void;
  setNotes: (value: string) => void;

  editingMaintenanceId: string | null;

  onSubmit: (event: FormEvent) => void;
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (id: string) => void;
};

export default function MaintenanceSection({
  maintenanceRecords,
  serviceType,
  serviceDate,
  maintenanceMileage,
  cost,
  shop,
  notes,
  setServiceType,
  setServiceDate,
  setMaintenanceMileage,
  setCost,
  setShop,
  setNotes,
  editingMaintenanceId,
  onSubmit,
  onEdit,
  onDelete,
}: MaintenanceSectionProps) {
  return (
    <div className="card">
      <h2>Maintenance Records</h2>

      <form onSubmit={onSubmit} className="maintenance-form">
        <input
          required
          placeholder="Service Type"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
        />

        <input
          required
          type="date"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
        />

        <input
          required
          type="number"
          placeholder="Mileage"
          value={maintenanceMileage}
          onChange={(e) => setMaintenanceMileage(e.target.value)}
        />

        <input
          type="number"
          step="0.01"
          placeholder="Cost"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />

        <input
          placeholder="Shop"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
        />

        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button type="submit">
          {editingMaintenanceId
            ? "Save Changes"
            : "Save Maintenance"}
        </button>
      </form>

      <div className="maintenance-list">
        {maintenanceRecords.length === 0 ? (
          <p>No maintenance records yet.</p>
        ) : (
          maintenanceRecords.map((record) => (
            <div
              key={record.id}
              className="maintenance-record"
            >
              <h3>{record.serviceType}</h3>

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
                {record.cost !== undefined &&
                record.cost !== null
                  ? `$${record.cost.toFixed(2)}`
                  : "—"}
              </p>

              <p>
                <strong>Shop:</strong>{" "}
                {record.shop || "—"}
              </p>

              <p>
                <strong>Notes:</strong>{" "}
                {record.notes || "—"}
              </p>

              <div className="button-row">
                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => onEdit(record)}
                >
                  ✏️ Edit Record
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => onDelete(record.id)}
                >
                  🗑 Delete Record
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}