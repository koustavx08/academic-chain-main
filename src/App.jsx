import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import IssueCredentials from './pages/IssueCredentials';
import VerifyCredentials from './pages/VerifyCredentials';
import Institutions from './pages/Institutions';
import InstitutionDashboard from './pages/InstitutionDashboard';
import StudentDashboard from './pages/StudentDashboard';

const App = () => {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/issue" element={<IssueCredentials />} />
              <Route path="/verify" element={<VerifyCredentials />} />
              <Route path="/institutions" element={<Institutions />} />
              <Route path="/institution-dashboard" element={<InstitutionDashboard />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Web3Provider>
  );
};

export default App; 