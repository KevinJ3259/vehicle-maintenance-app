import { useState } from "react";
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
  // --------------------------------
  // Search and sorting
  // --------------------------------

  const [fuelSearch, setFuelSearch] = useState("");
  const [fuelSort, setFuelSort] = useState("newest");

  // --------------------------------
  // Automatic fuel cost
  // --------------------------------

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

  // --------------------------------
  // Fuel summary calculations
  // --------------------------------

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

  // --------------------------------
  // Search and sort fuel history
  // --------------------------------

  const filteredAndSortedFuelRecords = [...fuelRecords]
    .filter((record) => {
      const search = fuelSearch.toLowerCase().trim();

      if (!search) {
        return true;
      }

      return (
        record.station
          ?.toLowerCase()
          .includes(search) ||
        record.notes
          ?.toLowerCase()
          .includes(search) ||
        record.date.toLowerCase().includes(search) ||
        record.mileage.toString().includes(search)
      );
    })
    .sort((a, b) => {
      switch (fuelSort) {
        case "oldest":
          return (
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
          );

        case "mileage":
          return b.mileage - a.mileage;

        case "cost":
          return (
            (b.totalCost ?? 0) -
            (a.totalCost ?? 0)
          );

        case "newest":
        default:
          return (
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
          );
      }
    });

  // --------------------------------
  // MPG helper
  //
  // IMPORTANT:
  // Use the original fuelRecords array to find
  // the previous fill-up. This keeps MPG correct
  // even when the displayed list is searched or
  // sorted differently.
  // --------------------------------

  function calculateMpg(record: FuelRecord) {
    const sortedRecords = [...fuelRecords].sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

    const recordIndex = sortedRecords.findIndex(
      (item) => item.id === record.id
    );

    if (recordIndex === -1) {
      return null;
    }

    const previousRecord =
      sortedRecords[recordIndex + 1];

    if (!previousRecord || record.gallons <= 0) {
      return null;
    }

    const milesDriven =
      record.mileage - previousRecord.mileage;

    if (milesDriven <= 0) {
      return null;
    }

    return milesDriven / record.gallons;
  }

  return (
    <div className="card">
      <h2>⛽ Fuel Tracker</h2>

      {/* Fuel summary cards */}

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

      {/* Fuel form */}

      <form
        onSubmit={onSubmit}
        className="maintenance-form"
      >
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

      {/* Search and sorting */}

      <div className="maintenance-search">
        <input
          type="text"
          placeholder="Search fuel history..."
          value={fuelSearch}
          onChange={(e) =>
            setFuelSearch(e.target.value)
          }
        />
      </div>

      <div className="maintenance-sort">
        <label htmlFor="fuel-sort">
          Sort Fuel:{" "}
        </label>

        <select
          id="fuel-sort"
          value={fuelSort}
          onChange={(e) =>
            setFuelSort(e.target.value)
          }
        >
          <option value="newest">
            Newest First
          </option>

          <option value="oldest">
            Oldest First
          </option>

          <option value="mileage">
            Highest Mileage
          </option>

          <option value="cost">
            Highest Cost
          </option>
        </select>
      </div>

      {/* Fuel history */}

      <div className="maintenance-list">
        {filteredAndSortedFuelRecords.length === 0 ? (
          <p>
            {fuelRecords.length === 0
              ? "No fuel records yet."
              : "No fuel records match your search."}
          </p>
        ) : (
          filteredAndSortedFuelRecords.map(
            (record) => {
              const mpg = calculateMpg(record);

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
                    {record.mileage.toLocaleString()}{" "}
                    miles
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
                      ? `$${record.pricePerGallon.toFixed(
                          3
                        )}`
                      : "—"}
                  </p>

                  <p>
                    <strong>Total Cost:</strong>{" "}
                    {record.totalCost !== null
                      ? `$${record.totalCost.toFixed(
                          2
                        )}`
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
                    {mpg !== null
                      ? mpg.toFixed(1)
                      : "—"}
                  </p>

                  <div className="button-row">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() =>
                        onEdit(record)
                      }
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
            }
          )
        )}
      </div>
    </div>
  );
}