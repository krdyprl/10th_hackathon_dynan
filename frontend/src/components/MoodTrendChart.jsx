import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MoodTrendChart({ data }) {
  // data berisi riwayat mood (skor mood)
  // Contoh format data:
  // [
  //   { date: 'Mon', mood: 70 },
  //   { date: 'Tue', mood: 65 },
  //   { date: 'Wed', mood: 80 },
  //   { date: 'Thu', mood: 45 }
  // ]
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d8d8d8" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="mood"
          stroke="#3b89ff" // Accent Blue
          strokeWidth={2.5}
          activeDot={{ r: 6, fill: "#080808" }} // Ink Black Active Dot
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
