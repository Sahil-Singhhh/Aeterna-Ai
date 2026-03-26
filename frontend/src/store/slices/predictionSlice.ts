import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { LifestyleState } from './lifestyleSlice';

export interface TrajectoryPoint {
  month: number;
  current_path_score: number;
  optimized_path_score: number;
}

interface PredictionState {
  timeline: TrajectoryPoint[];
  current_score: number;
  optimized_score: number;
  loading: boolean;
  error: string | null;
}

const initialState: PredictionState = {
  timeline: [],
  current_score: 0,
  optimized_score: 0,
  loading: false,
  error: null,
};

export const fetchPrediction = createAsyncThunk(
  'prediction/fetchPrediction',
  async (params: { age: number; lifestyle: LifestyleState; months: number }) => {
    const payload = {
      months: params.months,
      lifestyle: {
        age: params.age,
        sleep_hours: params.lifestyle.sleep_hours,
        steps_daily: params.lifestyle.steps_daily,
        hydration_liters: params.lifestyle.hydration_liters,
        stress_level: params.lifestyle.stress_level,
      },
    };
    
    // Fallback to absolute URL if proxy isn't setup.
    // For production, maybe use relative if hosted together.
    const response = await axios.post('http://localhost:8000/api/v1/predict-trajectory', payload);
    return response.data;
  }
);

export const predictionSlice = createSlice({
  name: 'prediction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrediction.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline = action.payload.timeline;
        state.current_score = action.payload.current_score;
        state.optimized_score = action.payload.optimized_score;
      })
      .addCase(fetchPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch prediction';
      });
  },
});

export default predictionSlice.reducer;
