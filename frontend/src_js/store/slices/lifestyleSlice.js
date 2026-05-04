import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sleep_hours: 7.5,
  steps_daily: 6000,
  hydration_liters: 2.0,
  stress_level: 5,
};

export const lifestyleSlice = createSlice({
  name: "lifestyle",
  initialState,
  reducers: {
    updateLifestyle: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateLifestyle } = lifestyleSlice.actions;
export default lifestyleSlice.reducer;
