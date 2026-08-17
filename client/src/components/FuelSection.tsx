import type { FormEvent } from "react";
import type { FuelRecord } from "../types";

type FuelSectionProps = {
  fuelRecords: FuelRecord[];

  fuelDate: string;
  fuelMileage: string;
  gallons: string;
  pricePerGallon: string;
  totalFuelCost: string;
  station: string;
  fuelNotes: string;

  setFuelDate: (value: string) => void;
  setFuelMileage: (value: string) => void;
  setGallons: (value: string) => void;
  setPricePerGallon: (value: string) => void;
  setTotalFuelCost: (value: string) => void;
  setStation: (value: string) => void;
  setFuelNotes: (value: string) => void;

  editingFuelId: string | null;

  onSubmit: (event: FormEvent) => void;
  onEdit: (record: FuelRecord) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
};

export default function FuelSection({
  fuelRecords,
  fuelDate,
  fuelMileage,
  gallons,
  pricePerGallon,
  totalFuelCost,
  station,
  fuelNotes,
  setFuelDate,
  setFuelMileage,
  setGallons,
  setPricePerGallon,
  setTotalFuelCost,
  setStation,
  setFuelNotes,
  editingFuelId,
  onSubmit,
  onEdit,
  onDelete,
  onCancelEdit,
}: FuelSectionProps) {
  function updateFuelCost(
    newGallons: string,
    newPricePerGallon: string
  ) {
    const gallonsNumber = Number(newGallons);
    const priceNumber = Number(newPricePerGallon);

    if (
      newGallons &&
      newPricePerGallon &&
      !Number.isNaN(gallonsNumber) &&
      !Number.isNaN(priceNumber)
    ) {
      setTotalFuelCost(
        (gallonsNumber * priceNumber).toFixed(2)
      );
    }
  }

  const totalGallons = fuelRecords.reduce(
    (sum, record) => sum + record.gallons,
    0
  );

  const totalFuelSpent = fuelRecords.reduce(
    (sum, record) => sum + (record.totalCost ?? 0),
    0
  );

  const mpgValues = fuelRecords
    .map((record, index) => {
      const previousRecord = fuelRecords[index + 1];

      if (!previousRecord || record.gallons <= 0) {
        return null;
      }

      const mpg =
        (record.mileage - previousRecord.mileage) /
        record.gallons;

      return mpg > 0 ? mpg : null;
    })
    .filter((value): value is number => value !== null);

  const averageMpg =
    mpgValues.length > 0
      ? mpgValues.reduce((sum, mpg) => sum + mpg, 0) /
        mpgValues.length
      : null;

  return (
    <div className="card">
      <h2>⛽ Fuel Tracker</h2>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>⛽ Total Gallons</h3>
          <h2>{totalGallons.toFixed(2)}</h2>
        </div>

        <div className="dashboard-card">
          <h3>💲 Fuel Spent</h3>
          <h2>${totalFuelSpent.toFixed(2)}</h2>
        </div>

        <div className="dashboard-card">
          <h3>📊 Average MPG</h3>
          <h2>
            {averageMpg !== null
              ? averageMpg.toFixed(1)
              : "—"}
          </h2>
        </div>
      </div>

      <form onSubmit={onSubmit} className="maintenance-form">
        <input
          required
          type="date"
          value={fuelDate}
          onChange={(e) =>
            setFuelDate(e.target.value)
          }
        />

        <input
          required
          type="number"
          placeholder="Mileage"
          value={fuelMileage}
          onChange={(e) =>
            setFuelMileage(e.target.value)
          }
        />

        <input
          required
          type="number"
          step="0.001"
          placeholder="Gallons"
          value={gallons}
          onChange={(e) => {
            setGallons(e.target.value);

            updateFuelCost(
              e.target.value,
              pricePerGallon
            );
          }}
        />

        <input
          type="number"
          step="0.001"
          placeholder="Price Per Gallon"
          value={pricePerGallon}
          onChange={(e) => {
            setPricePerGallon(e.target.value);

            updateFuelCost(
              gallons,
              e.target.value
            );
          }}
        />

        <input
          type="number"
          step="0.01"
          placeholder="Total Cost"
          value={totalFuelCost}
          onChange={(e) =>
            setTotalFuelCost(e.target.value)
          }
        />

        <input
          placeholder="Gas Station"
          value={station}
          onChange={(e) =>
            setStation(e.target.value)
          }
        />

        <textarea
          placeholder="Notes"
          value={fuelNotes}
          onChange={(e) =>
            setFuelNotes(e.target.value)
          }
        />

        <button type="submit">
          {editingFuelId
            ? "Save Changes"
            : "Save Fill-Up"}
        </button>

        {editingFuelId && (
          <button
            type="button"
            onClick={onCancelEdit}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="maintenance-list">
        {fuelRecords.length === 0 ? (
          <p>No fuel records yet.</p>
        ) : (
          fuelRecords.map((record, index) => {
            const previousRecord =
              fuelRecords[index + 1];

            const mpg =
              previousRecord &&
              record.gallons > 0
                ? (record.mileage -
                    previousRecord.mileage) /
                  record.gallons
                : null;

            return (
              <div
                key={record.id}
                className="maintenance-record"
              >
                <h3>⛽ Fuel Fill-Up</h3>

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
                  {record.gallons.toFixed(3)}
                </p>

                <p>
                  <strong>
                    Price Per Gallon:
                  </strong>{" "}
                  {record.pricePerGallon !== null
                    ? `$${record.pricePerGallon.toFixed(3)}`
                    : "—"}
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

                <p>
                  <strong>Notes:</strong>{" "}
                  {record.notes || "—"}
                </p>

                <p>
                  <strong>MPG:</strong>{" "}
                  {mpg !== null && mpg > 0
                    ? mpg.toFixed(1)
                    : "—"}
                </p>

                <div className="button-row">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => onEdit(record)}
                  >
                    ✏️ Edit Fuel Record
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() =>
                      onDelete(record.id)
                    }
                  >
                    🗑 Delete Fuel Record
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}