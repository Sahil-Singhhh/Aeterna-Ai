import { createSlice } from "@reduxjs/toolkit";

// Check localStorage for existing session
const savedAuth = localStorage.getItem("aeterna_auth_session");
const initialState = savedAuth
  ? JSON.parse(savedAuth)
  : {
      isAuthenticated: false,
      user: null,
    };

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("aeterna_auth_session", JSON.stringify(state));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("aeterna_auth_session");
      // Also clear profile so next user starts fresh
      localStorage.removeItem("aeterna_user_profile");
    },
    setUser: (state, action) => {
      if (state.user) {
        state.user.age = action.payload.age;
        localStorage.setItem("aeterna_auth_session", JSON.stringify(state));
      } else {
        // Fallback if somehow setting user without full profile
        state.user = {
          age: action.payload.age,
          name: "Unknown",
          email: "",
          memberSince: "",
        };
        state.isAuthenticated = true;
      }
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
