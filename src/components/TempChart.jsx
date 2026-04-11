import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function TempChart({ daily }) {
  if (!daily || daily.length === 0) return null;

  const labels = daily.map((d) => new Date(d.date).toLocaleDateString());
  const max = daily.map((d) => d.temp_max);
  const min = daily.map((d) => d.temp_min);

  const data = {
    labels,
    datasets: [
      {
        label: 'Max °C',
        data: max,
        borderColor: 'rgb(255,99,132)',
        backgroundColor: 'rgba(255,99,132,0.2)',
      },
      {
        label: 'Min °C',
        data: min,
        borderColor: 'rgb(54,162,235)',
        backgroundColor: 'rgba(54,162,235,0.2)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
  };

  return <Line data={data} options={options} />;
}
