import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface LifestyleState {
  sleep_hours: number;
  steps_daily: number;
  hydration_liters: number;
  stress_level: number;
}

const initialState: LifestyleState = {
  sleep_hours: 7.5,
  steps_daily: 6000,
  hydration_liters: 2.0,
  stress_level: 5,
};

export const lifestyleSlice = createSlice({
  name: 'lifestyle',
  initialState,
  reducers: {
    updateLifestyle: (state, action: PayloadAction<Partial<LifestyleState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateLifestyle } = lifestyleSlice.actions;
export default lifestyleSlice.reducer;
