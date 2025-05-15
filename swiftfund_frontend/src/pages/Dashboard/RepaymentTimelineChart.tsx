import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RepaymentData {
  date: string;          // e.g. '2025-05-01'
  amountRepaid: number;  // e.g. 5000
}

const data: RepaymentData[] = [
  { date: '2025-05-01', amountRepaid: 2000 },
  { date: '2025-05-05', amountRepaid: 5000 },
  { date: '2025-05-10', amountRepaid: 3000 },
  { date: '2025-05-15', amountRepaid: 7000 },
  { date: '2025-05-20', amountRepaid: 10000 },
];

const RepaymentTimelineChart: React.FC = () => {
  return (
    <div className="w-full h-[300px] bg-white p-4 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Repayment Timeline</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="amountRepaid" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RepaymentTimelineChart;