import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';



interface ReportAnalysisState {
  parsedInsights: string[];
}

const initialState: ReportAnalysisState = {
  parsedInsights: [],
};

export const reportAnalysisSlice = createSlice({
  name: 'reportAnalysis',
  initialState,
  reducers: {
    addInsight: (state, action: PayloadAction<string>) => {
      state.parsedInsights.push(action.payload);
    },
    clearInsights: (state) => {
      state.parsedInsights = [];
    },
  },
});

export const { addInsight, clearInsights } = reportAnalysisSlice.actions;
export default reportAnalysisSlice.reducer;
