// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import RoadmapDetail from "./pages/RoadmapDetail";
import AdminResources from "./pages/AdminResources";
import AdminRoute from "./components/AdminRoute";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/roadmap/:roadmapId" element={<RoadmapDetail />} />
          <Route path="/admin/resources" element={
            <AdminRoute>
              <AdminResources />
            </AdminRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;