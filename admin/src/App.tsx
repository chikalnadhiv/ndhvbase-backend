import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Pricing from './pages/Pricing';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import Layout from './components/Layout';

import { API_URL } from './config';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Verify token
      fetch(`${API_URL}/api/admin/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => {
          if (res.ok) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('admin_token');
          }
        })
        .catch(() => localStorage.removeItem('admin_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login onLogin={() => setIsAuthenticated(true)} />
        } />
        <Route path="/" element={
          isAuthenticated ? <Layout onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/login" />
        }>
          <Route index element={<Dashboard />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="projects" element={<Projects />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
