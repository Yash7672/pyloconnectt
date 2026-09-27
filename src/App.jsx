import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { supabase, hasSupabaseConfig } from './lib/supabase';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ConfigErrorScreen from './components/ConfigErrorScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Skip session restore entirely when config is incomplete - no client
    // exists and App renders ConfigErrorScreen before this effect matters.
    if (!hasSupabaseConfig) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data: { session: current } }) => {
        if (!cancelled) {
          setSession(current);
          setAuthLoading(false);
        }
      })
      .catch((err) => {
        console.error('PYLO Web: session restore failed', err);
        if (!cancelled) setAuthLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!cancelled) setSession(newSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Missing env vars → show a helpful config screen instead of a blank page.
  // The throw that previously lived in supabase.js has been removed so
  // React can mount and display this.
  if (!hasSupabaseConfig) {
    return <ConfigErrorScreen />;
  }

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home session={session} />} />
        <Route
          path="/login"
          element={session ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <Dashboard session={session} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}