import { FullReport } from '../components/FullReport';
import { WeeklyReport } from '../components/WeeklyReport';

export const ReportPage = ({ householdId }: { householdId: string }) => {
  return (
    <div>
      <h1>Reports</h1>
      <div>
        <FullReport householdId={householdId} />
      </div>
      <div>
        <WeeklyReport householdId={householdId} />
      </div>
    </div>
  );
};
