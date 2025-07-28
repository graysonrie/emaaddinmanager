import BasicUserStatsTable from "./BasicUserStatsTable";
import StatsByUser from "./stats-by-user";

export default function StatsDisplay() {
  return (
    <div className="flex flex-row gap-4 w-full h-full justify-center overflow-auto">
      <div className="flex flex-col w-full gap-8">
        <div>
          <p className="text-2xl font-bold">Overview</p>
          <BasicUserStatsTable />
        </div>
        <div>
          <p className="text-2xl font-bold">Stats By User</p>
          <StatsByUser />
        </div>
      </div>
    </div>
  );
}
