import type { FormEvent } from "react";
import type { MaintenanceRecord } from "../types";

type MaintenanceSectionProps = {
  maintenanceRecords: MaintenanceRecord[];

  serviceType: string;
  customServiceType: string;
  serviceDate: string;
  maintenanceMileage: string;
  cost: string;
  shop: string;
  notes: string;
  nextServiceDate: string;
  nextServiceMileage: string;
  

  setServiceType: (value: string) => void;
  setCustomServiceType: (value: string) => void;
  setServiceDate: (value: string) => void;
  setMaintenanceMileage: (value: string) => void;
  setCost: (value: string) => void;
  setShop: (value: string) => void;
  setNotes: (value: string) => void;
  setNextServiceDate: (value: string) => void;
  setNextServiceMileage: (value: string) => void;

  editingMaintenanceId: string | null;

  onSubmit: (event: FormEvent) => void;
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (id: string) => void;
};

export default function MaintenanceSection({
  maintenanceRecords,
  serviceType,
  customServiceType,
  serviceDate,
  maintenanceMileage,
  cost,
  shop,
  notes,
  nextServiceDate,
  nextServiceMileage,
  setServiceType,
  setCustomServiceType,
  setServiceDate,
  setMaintenanceMileage,
  setCost,
  setShop,
  setNotes,
  setNextServiceDate,
  setNextServiceMileage,
  editingMaintenanceId,
  onSubmit,
  onEdit,
  onDelete,
}: MaintenanceSectionProps) {
  function applyServiceSuggestion(value: string) {
    setServiceType(value);

    if (!maintenanceMileage || !serviceDate) return;

    const mileage = Number(maintenanceMileage);
    const date = new Date(`${serviceDate}T00:00:00`);

    if (Number.isNaN(mileage)) return;

    let mileageInterval = 0;
    let monthsInterval = 0;

    switch (value.toLowerCase().trim()) {
      case "oil change":
        mileageInterval = 5000;
        monthsInterval = 3;
        break;

      case "tire rotation":
        mileageInterval = 5000;
        monthsInterval = 6;
        break;

      case "brake inspection":
        mileageInterval = 10000;
        monthsInterval = 12;
        break;

      case "air filter":
        mileageInterval = 15000;
        monthsInterval = 12;
        break;

      default:
        return;
    }

    setNextServiceMileage(
      (mileage + mileageInterval).toString()
    );

    date.setMonth(date.getMonth() + monthsInterval);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    setNextServiceDate(`${year}-${month}-${day}`);
  }

  return (
    <div className="card">
      <h2>Maintenance Records</h2>

      <form onSubmit={onSubmit} className="maintenance-form">
      <select
  required
  value={serviceType}
  onChange={(e) =>
    applyServiceSuggestion(e.target.value)
  }
>
  <option value="">Select Service Type</option>
  <option value="Oil Change">Oil Change</option>
  <option value="Tire Rotation">Tire Rotation</option>
  <option value="Brake Inspection">Brake Inspection</option>
  <option value="Brake Service">Brake Service</option>
  <option value="Air Filter">Air Filter</option>
  <option value="Cabin Air Filter">Cabin Air Filter</option>
  <option value="Transmission Fluid">Transmission Fluid</option>
  <option value="Coolant Service">Coolant Service</option>
  <option value="Spark Plugs">Spark Plugs</option>
  <option value="Battery Replacement">Battery Replacement</option>
  <option value="Tire Replacement">Tire Replacement</option>
  <option value="Wheel Alignment">Wheel Alignment</option>
  <option value="Custom Service">Custom Service</option>
</select>

{serviceType === "Custom Service" && (
  <input
    required
    placeholder="Enter Custom Service"
    value={customServiceType}
    onChange={(e) =>
      setCustomServiceType(e.target.value)
    }
  />
)}

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
          onChange={(e) =>
            setMaintenanceMileage(e.target.value)
          }
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

        <input
          type="date"
          value={nextServiceDate}
          onChange={(e) =>
            setNextServiceDate(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Next Service Mileage"
          value={nextServiceMileage}
          onChange={(e) =>
            setNextServiceMileage(e.target.value)
          }
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

              <p>
                <strong>Next Service Date:</strong>{" "}
                {record.nextServiceDate
                  ? new Date(
                      record.nextServiceDate
                    ).toLocaleDateString()
                  : "—"}
              </p>

              <p>
                <strong>Next Service Mileage:</strong>{" "}
                {record.nextServiceMileage !== null &&
                record.nextServiceMileage !== undefined
                  ? `${record.nextServiceMileage.toLocaleString()} miles`
                  : "—"}
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