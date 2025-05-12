import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Users from './pages/Users';
import Episodes from './pages/Episodes';
import DashboardLayout from './layouts/DashboardLayout';
import Stories from './pages/Stories';
import PoochaPolice from './pages/PoochaPolice';
import ForceUpdate from './pages/ForceUpdate';
import SingleStories from './pages/SingleStories';


// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Users />} />
          <Route path="episodes" element={<Episodes />} />
          <Route path="stories" element={<Stories />} />
          <Route path="single-stories" element={<SingleStories />} />
          <Route path="poocha-police" element={<PoochaPolice />} />
          <Route path="force-update" element={<ForceUpdate/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
