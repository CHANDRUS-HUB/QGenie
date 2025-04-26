import React, { lazy, useEffect, useState } from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { themeChange } from 'theme-change'
import checkAuth from './app/auth';
import initializeApp from './app/init';
import GlobalNotification from './containers/GlobalNotification';
import axios from "axios";
import baseUrl from "./utils/URL";

// Importing pages
const Layout = lazy(() => import('./containers/Layout'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Register = lazy(() => import('./pages/Register'))
const Documentation = lazy(() => import('./pages/Documentation'))

// Initializing different libraries
initializeApp()

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize daisy UI themes
    themeChange(false);

    // Check authentication status
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${baseUrl}/profile`, { withCredentials: true });
        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
        
       
         
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <>
      <Router>
        <GlobalNotification />
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/app/welcome" replace /> : <Login />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/documentation" element={<Documentation />} />

          {/* Protected routes */}
          <Route
            path="/app/*"
            element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
          />

          {/* Redirect all other routes */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/app/welcome" : "/login"} replace />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
