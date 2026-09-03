import type { FormEvent } from "react";

type VehicleFormProps = {
  editingId: string | null;
  year: string;
  make: string;
  model: string;
  trim: string;
  licensePlate: string;
  currentMileage: string;
  expectedMpg: string;
  setYear: (value: string) => void;
  setMake: (value: string) => void;
  setModel: (value: string) => void;
  setTrim: (value: string) => void;
  setLicensePlate: (value: string) => void;
  setCurrentMileage: (value: string) => void;
  setExpectedMpg: (value: string) => void;
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
  expectedMpg,
  setYear,
  setMake,
  setModel,
  setTrim,
  setLicensePlate,
  setCurrentMileage,
  setExpectedMpg,
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
          onChange={(event) => setYear(event.target.value)}
        />

        <input
          required
          placeholder="Make"
          value={make}
          onChange={(event) => setMake(event.target.value)}
        />

        <input
          required
          placeholder="Model"
          value={model}
          onChange={(event) => setModel(event.target.value)}
        />

        <input
          placeholder="Trim"
          value={trim}
          onChange={(event) => setTrim(event.target.value)}
        />

        <input
          placeholder="License Plate"
          value={licensePlate}
          onChange={(event) => setLicensePlate(event.target.value)}
        />

        <input
          required
          type="number"
          placeholder="Current Mileage"
          value={currentMileage}
          onChange={(event) => setCurrentMileage(event.target.value)}
        />

        <input
          type="number"
          min="1"
          step="0.1"
          placeholder="Expected MPG (example: 34)"
          value={expectedMpg}
          onChange={(event) => setExpectedMpg(event.target.value)}
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
