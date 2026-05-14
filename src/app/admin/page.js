"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '../../components/AdminDashboard';
import AdminLogin from '../../components/AdminLogin';
import { isAdminAuthenticated } from '../../utils/dataManager';

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setIsAdminLoggedIn(isAdminAuthenticated());
  }, []);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    router.push('/');
  };

  if (!mounted) return null;

  if (isAdminLoggedIn) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  return <AdminLogin onLogin={handleAdminLogin} />;
}
