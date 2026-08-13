import type { FormEvent } from "react";

type VehicleFormProps = {
  editingId: string | null;

  year: string;
  make: string;
  model: string;
  trim: string;
  licensePlate: string;
  currentMileage: string;

  setYear: (value: string) => void;
  setMake: (value: string) => void;
  setModel: (value: string) => void;
  setTrim: (value: string) => void;
  setLicensePlate: (value: string) => void;
  setCurrentMileage: (value: string) => void;

  onSubmit: (event: FormEvent) => void;
  onCancelEdit: () => void;
};

export default function VehicleForm({
  editingId,
  year,
  make,
  model,
  trim,
  licensePlate,
  currentMileage,
  setYear,
  setMake,
  setModel,
  setTrim,
  setLicensePlate,
  setCurrentMileage,
  onSubmit,
  onCancelEdit,
}: VehicleFormProps) {
  return (
    <form onSubmit={onSubmit} className="card">
      <h2>{editingId ? "Edit Vehicle" : "Add Vehicle"}</h2>

      <div className="form-grid">
        <input
          required
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />

        <input
          required
          placeholder="Make"
          value={make}
          onChange={(e) => setMake(e.target.value)}
        />

        <input
          required
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />

        <input
          placeholder="Trim"
          value={trim}
          onChange={(e) => setTrim(e.target.value)}
        />

        <input
          placeholder="License Plate"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
        />

        <input
          required
          type="number"
          placeholder="Current Mileage"
          value={currentMileage}
          onChange={(e) => setCurrentMileage(e.target.value)}
        />
      </div>

      <button type="submit" className="primary-btn">
        {editingId ? "Save Changes" : "Add Vehicle"}
      </button>

      {editingId && (
        <button
          type="button"
          className="secondary-btn"
          onClick={onCancelEdit}
        >
          Cancel Edit
        </button>
      )}
    </form>
  );
}