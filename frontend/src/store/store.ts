import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import lifestyleReducer from './slices/lifestyleSlice';
import predictionReducer from './slices/predictionSlice';
import reportAnalysisReducer from './slices/reportAnalysisSlice';

const appReducer = combineReducers({
  auth: authReducer,
  lifestyle: lifestyleReducer,
  prediction: predictionReducer,
  reportAnalysis: reportAnalysisReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
