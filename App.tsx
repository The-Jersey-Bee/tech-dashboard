import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Login from './components/Login';
import AuthGuard from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

const StatusPlaceholder = () => (
  <div className="py-20 text-center">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">System Status</h1>
    <p className="text-gray-600">Real-time health monitoring coming in Phase 3.</p>
  </div>
);

const SettingsPlaceholder = () => (
  <div className="py-20 text-center">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">Settings</h1>
    <p className="text-gray-600">Profile and organization preferences coming soon.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/status" element={<StatusPlaceholder />} />
                      <Route path="/settings" element={<SettingsPlaceholder />} />
                    </Routes>
                  </Layout>
                </AuthGuard>
              }
            />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
};

export default App;
