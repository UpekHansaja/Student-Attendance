"use client";
import { useRouter } from 'next/navigation';
import AttendanceInterface from '../components/AttendanceInterface';

export default function Home() {
  const router = useRouter();
  
  const navigateToAdmin = () => {
    router.push('/admin');
  };

  return <AttendanceInterface onNavigateToAdmin={navigateToAdmin} />;
}
