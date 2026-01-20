import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Login from './components/Login';
import AuthGuard from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

// Monitoring components
import Repositories from './components/monitoring/Repositories';
import CloudflareResources from './components/monitoring/CloudflareResources';
import HealthMonitoring from './components/monitoring/HealthMonitoring';
import Controls from './components/monitoring/Controls';
import ActivityFeed from './components/monitoring/ActivityFeed';

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
                      <Route path="/repos" element={<Repositories />} />
                      <Route path="/cloudflare" element={<CloudflareResources />} />
                      <Route path="/health" element={<HealthMonitoring />} />
                      <Route path="/activity" element={<ActivityFeed />} />
                      <Route path="/controls" element={<Controls />} />
                      <Route path="/projects" element={<Projects />} />
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
