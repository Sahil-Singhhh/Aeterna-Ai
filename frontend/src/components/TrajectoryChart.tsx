import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const TrajectoryChart: React.FC = () => {
  const { timeline, loading } = useSelector((state: RootState) => state.prediction);

  if (loading && timeline.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-accent-primary animate-pulse">
        Calculating Neural Projections...
      </div>
    );
  }

  return (
    <div className="glassmorphism rounded-2xl p-6 w-full h-[400px]">
      <h3 className="text-lg font-bold mb-4 text-white uppercase tracking-wider flex items-center justify-between border-b border-gray-800 pb-2">
        <span>Vitality Projections (60 Months)</span>
        <span className="text-xs text-text-muted bg-background-secondary px-2 py-1 rounded">V2.2.0 Model</span>
      </h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#8B949E" tick={{ fill: '#8B949E', fontSize: 12 }} />
            <YAxis domain={[0, 100]} stroke="#8B949E" tick={{ fill: '#8B949E', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(13,17,23,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                backdropFilter: 'blur(8px)'
              }}
              itemStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
              labelStyle={{ color: '#8B949E', marginBottom: '8px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="current_path_score"
              name="Current Trajectory"
              stroke="#7000FF"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#7000FF' }}
            />
            <Line
              type="monotone"
              dataKey="optimized_path_score"
              name="Simulated Optimizations"
              stroke="#00F2FF"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6, fill: '#00F2FF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrajectoryChart;
