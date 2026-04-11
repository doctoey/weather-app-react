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
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.12)',
        tension: 0.36,
        pointRadius: 3,
      },
      {
        label: 'Min °C',
        data: min,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.08)',
        tension: 0.36,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#cbd5e1' } },
      tooltip: { mode: 'index', intersect: false },
    },
    maintainAspectRatio: false,
    elements: { line: { borderWidth: 2 } },
  };

  return <Line data={data} options={options} />;
}
