import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import "../styles/main.scss";

ChartJS.register(ArcElement, Tooltip, Legend);

export const ChartComponent = ({ data }: { data: any }) => {
  if (!data) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className='diagram'>
      <Pie
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  const label = tooltipItem.label || '';
                  const value = tooltipItem.raw;
                  return `${label}: ${value}`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
};

