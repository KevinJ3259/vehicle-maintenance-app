import type { MaintenanceRecord, Vehicle } from "../types";
import { useState } from "react";

type DashboardProps = {
  totalVehicles: number;
  totalMaintenance: number;
  totalCost: number;
  vehicles: Vehicle[];
  maintenanceRecords: MaintenanceRecord[];
};

export default function Dashboard({
  totalVehicles,
  totalMaintenance,
  totalCost,
  vehicles,
  maintenanceRecords,
}: DashboardProps) {
  const today = new Date();

  const [statusFilter, setStatusFilter] = useState("ALL");

 function getMaintenanceStatus(
  milesRemaining: number | null,
  daysRemaining: number | null
) {
  const overdueByMileage =
    milesRemaining !== null && milesRemaining <= 0;

  const overdueByDate =
    daysRemaining !== null && daysRemaining <= 0;

  if (overdueByMileage || overdueByDate) {
    return "OVERDUE";
  }

  const dueSoonByMileage =
    milesRemaining !== null && milesRemaining <= 1000;

  const dueSoonByDate =
    daysRemaining !== null && daysRemaining <= 30;

  if (dueSoonByMileage || dueSoonByDate) {
    return "DUE SOON";
  }

  return "UPCOMING";
}

  const reminders = maintenanceRecords
    .map((record) => {
      const vehicle = vehicles.find(
        (vehicle) => vehicle.id === record.vehicleId
      );

      if (!vehicle) return null;

      const milesRemaining =
        record.nextServiceMileage !== null &&
        record.nextServiceMileage !== undefined
          ? record.nextServiceMileage - vehicle.currentMileage
          : null;

      const daysRemaining = record.nextServiceDate
        ? Math.ceil(
            (new Date(record.nextServiceDate).getTime() -
              today.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;

      return {
        ...record,
        vehicle,
        milesRemaining,
        daysRemaining,
      };
    })
    .filter((reminder) => reminder !== null)
    .sort((a, b) => {
      const aMileage = a.milesRemaining ?? Infinity;
      const bMileage = b.milesRemaining ?? Infinity;

      const aDays = a.daysRemaining ?? Infinity;
      const bDays = b.daysRemaining ?? Infinity;

      const aUrgency = Math.min(aMileage, aDays);
      const bUrgency = Math.min(bMileage, bDays);

      return aUrgency - bUrgency;
    });

    const filteredReminders = reminders.filter((reminder) => {
  if (statusFilter === "ALL") return true;

  return (
    getMaintenanceStatus(
      reminder.milesRemaining,
      reminder.daysRemaining
    ) === statusFilter
  );
});

  return (
    <>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>🚗 Vehicles</h3>
          <h1>{totalVehicles}</h1>
        </div>

        <div className="dashboard-card">
          <h3>🔧 Services</h3>
          <h1>{totalMaintenance}</h1>
        </div>

        <div className="dashboard-card">
          <h3>💲 Money Spent</h3>
          <h1>${totalCost.toFixed(2)}</h1>
        </div>
      </div>

      <div className="card">
        <h2>Upcoming Maintenance</h2>

        <div className="maintenance-filter">
  <button
    type="button"
    onClick={() => setStatusFilter("ALL")}
  >
    All
  </button>

  <button
    type="button"
    onClick={() => setStatusFilter("OVERDUE")}
  >
    Overdue
  </button>

  <button
    type="button"
    onClick={() => setStatusFilter("DUE SOON")}
  >
    Due Soon
  </button>

  <button
    type="button"
    onClick={() => setStatusFilter("UPCOMING")}
  >
    Upcoming
  </button>
</div>

        {filteredReminders.length === 0 ? (
          <p>No upcoming maintenance reminders.</p>
        ) : (
        filteredReminders.map((reminder) => (  
            <div
              key={reminder.id}
              className="maintenance-record"
            >
              <h3>{reminder.serviceType}</h3>

              <p
  className={`maintenance-status ${getMaintenanceStatus(
    reminder.milesRemaining,
    reminder.daysRemaining
  )
    .toLowerCase()
    .replace(" ", "-")}`}
>
  {getMaintenanceStatus(
    reminder.milesRemaining,
    reminder.daysRemaining
  )}
</p>

              <p>
                <strong>Vehicle:</strong>{" "}
                {reminder.vehicle.year}{" "}
                {reminder.vehicle.make}{" "}
                {reminder.vehicle.model}
              </p>

              {reminder.milesRemaining !== null && (
                <p>
                  <strong>Mileage Status:</strong>{" "}
                  {reminder.milesRemaining < 0
                    ? `Overdue by ${Math.abs(
                        reminder.milesRemaining
                      ).toLocaleString()} miles`
                    : `Due in ${reminder.milesRemaining.toLocaleString()} miles`}
                </p>
              )}

              {reminder.daysRemaining !== null && (
                <p>
                  <strong>Date Status:</strong>{" "}
                  {reminder.daysRemaining < 0
                    ? `Overdue by ${Math.abs(
                        reminder.daysRemaining
                      )} days`
                    : `Due in ${reminder.daysRemaining} days`}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}