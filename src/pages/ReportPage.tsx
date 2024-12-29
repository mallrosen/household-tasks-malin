// import { FullReport } from '../components/FullReport';
import { WeeklyReport } from '../components/WeeklyReport';


export const ReportPage = () => {
  return (
    <div>
      <h1>Reports</h1>
      {/* <div>
        <FullReport householdId={householdId} />
      </div> */}
      <div>
      <WeeklyReport/>
      </div>
    </div>
  );
};
