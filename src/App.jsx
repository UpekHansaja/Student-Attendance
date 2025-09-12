import { useState, useEffect } from 'react';
import AttendanceInterface from './components/AttendanceInterface';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { isAdminAuthenticated } from './utils/dataManager';

function App() {
  const [currentPage, setCurrentPage] = useState('attendance');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in
    const isLoggedIn = isAdminAuthenticated();
    setIsAdminLoggedIn(isLoggedIn);
    
    // Handle browser navigation
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('attendance');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial page based on URL
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('attendance');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setCurrentPage('admin');
    window.history.pushState({}, '', '/admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentPage('attendance');
    window.history.pushState({}, '', '/');
  };

  const navigateToAdmin = () => {
    setCurrentPage('admin');
    window.history.pushState({}, '', '/admin');
  };

  const navigateToAttendance = () => {
    setCurrentPage('attendance');
    window.history.pushState({}, '', '/');
  };

  // Render based on current page and admin status
  if (currentPage === 'admin') {
    if (isAdminLoggedIn) {
      return <AdminDashboard onLogout={handleAdminLogout} />;
    } else {
      return <AdminLogin onLogin={handleAdminLogin} />;
    }
  }

  return <AttendanceInterface onNavigateToAdmin={navigateToAdmin} />;
}

export default App;
