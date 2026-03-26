import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import DietPlan from './pages/DietPlan';
import ProfileSetup from './pages/ProfileSetup';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Progress from './pages/Progress';
import AIChat from './pages/AIChat';
import { useProfile } from './context/ProfileContext';

function ProtectedRoot({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isProfileComplete } = useProfile();
  
  if (!isProfileComplete) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoot>
            <ProfileSetup />
          </ProtectedRoot>
        } 
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoot>
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          </ProtectedRoot>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="diet-plan" element={<DietPlan />} />
        <Route path="progress" element={<Progress />} />
        <Route path="ai-chat" element={<AIChat />} />
      </Route>
    </Routes>
  );
}

export default App;
