import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { NewIncidentPage } from './pages/NewIncidentPage';
import { AdvisorPage } from './pages/AdvisorPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        {/* Render Sidebar on app routes (excluding landing, login, signup) */}
        {!isAuthPage && !isLandingPage && (
          <Sidebar className="hidden md:flex shrink-0" />
        )}
        <main className={`flex-1 overflow-y-auto ${!isAuthPage && !isLandingPage ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public Marketing & Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Core Application Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/incidents"
              element={
                <ProtectedRoute>
                  <IncidentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/incidents/new"
              element={
                <ProtectedRoute>
                  <NewIncidentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/advisor"
              element={
                <ProtectedRoute>
                  <AdvisorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
