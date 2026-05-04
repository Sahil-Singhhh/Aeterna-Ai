import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  parsedInsights: [],
};

export const reportAnalysisSlice = createSlice({
  name: "reportAnalysis",
  initialState,
  reducers: {
    addInsight: (state, action) => {
      state.parsedInsights.push(action.payload);
    },
    clearInsights: (state) => {
      state.parsedInsights = [];
    },
  },
});

export const { addInsight, clearInsights } = reportAnalysisSlice.actions;
export default reportAnalysisSlice.reducer;
