import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { EditorPage } from './pages/EditorPage';
import { PublishedSitePage } from './pages/PublishedSitePage';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 }, mutations: { retry: 0 } } });

const Private: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const Public: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Public><LoginPage /></Public>} />
          <Route path="/register" element={<Public><RegisterPage /></Public>} />
          <Route path="/dashboard" element={<Private><DashboardPage /></Private>} />
          <Route path="/editor/:id" element={<Private><EditorPage /></Private>} />
          {/* Public site renderer */}
          <Route path="/s/:slug" element={<PublishedSitePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1c1c1f', color: '#fafafa', border: '1px solid #2a2a2e', borderRadius: '10px', fontSize: '13px' },
        success: { iconTheme: { primary: '#6ee7b7', secondary: '#000' } },
        error: { iconTheme: { primary: '#f87171', secondary: '#000' } },
      }} />
    </QueryClientProvider>
  );
}
