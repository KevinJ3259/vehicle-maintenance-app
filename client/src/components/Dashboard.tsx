type DashboardProps = {
  totalVehicles: number;
  totalMaintenance: number;
  totalCost: number;
};

export default function Dashboard({
  totalVehicles,
  totalMaintenance,
  totalCost,
}: DashboardProps) {
  return (
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
  );
}