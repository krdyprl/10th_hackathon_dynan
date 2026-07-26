import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function HandwritingRadarChart({ data }) {
  // data berisi metrik kinematik ternormalisasi (0-100)
  // Contoh format data:
  // [
  //   { subject: 'Velocity', value: 80 },
  //   { subject: 'Acceleration', value: 60 },
  //   { subject: 'Jerk', value: 40 },
  //   { subject: 'Pen Lifts', value: 50 },
  //   { subject: 'Erase Count', value: 30 }
  // ]
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#d8d8d8" />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          name="Kinematika Tulisan"
          dataKey="value"
          stroke="#7a3dff" // Accent Purple
          fill="#7a3dff"
          fillOpacity={0.2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
