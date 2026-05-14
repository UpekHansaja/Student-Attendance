const STORAGE_KEYS = {
  ADMIN_AUTH: 'admin_auth_token'
};

export const getStudentByNIC = async (nic) => {
  try {
    const res = await fetch(`/api/students/${nic}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
};

export const getTodaysAttendanceStatus = async (nic) => {
  try {
    const res = await fetch(`/api/attendance?nic=${nic}&today=true`);
    if (!res.ok) throw new Error('Failed to fetch status');
    const records = await res.json();
    
    if (records.length === 0) {
      return {
        status: 'not_marked',
        canMarkIn: true,
        canMarkOut: false,
        inTime: null,
        outTime: null
      };
    }

    const todayRecord = records[0];

    if (todayRecord.inTime && !todayRecord.outTime) {
      return {
        status: 'in',
        canMarkIn: false,
        canMarkOut: true,
        inTime: todayRecord.inTime,
        outTime: null
      };
    }

    if (todayRecord.inTime && todayRecord.outTime) {
      return {
        status: 'completed',
        canMarkIn: false,
        canMarkOut: false,
        inTime: todayRecord.inTime,
        outTime: todayRecord.outTime
      };
    }

    return {
      status: 'not_marked',
      canMarkIn: true,
      canMarkOut: false,
      inTime: null,
      outTime: null
    };
  } catch (error) {
    console.error('Error fetching attendance status:', error);
    return null;
  }
};

export const markAttendance = async (nic, type) => {
  try {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nic, type })
    });
    
    return res.ok;
  } catch (error) {
    console.error('Error marking attendance:', error);
    return false;
  }
};

export const getTodaysAttendance = async () => {
  try {
    const res = await fetch('/api/attendance?today=true');
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    return [];
  }
};

export const getAllAttendanceRecords = async () => {
  try {
    const res = await fetch('/api/attendance');
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    return [];
  }
};

export const getAllStudents = async () => {
  try {
    const res = await fetch('/api/students');
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching all students:', error);
    return [];
  }
};

// Admin authentication (kept local for simplicity as requested by previous codebase)
export const authenticateAdmin = (email, password) => {
  const validEmail = 'java.institute.gampaha01@gmail.com';
  const validPassword = 'JIATLOGIN';
  
  if (email === validEmail && password === validPassword) {
    const token = btoa(`${email}:${Date.now()}`);
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, token);
    return true;
  }
  return false;
};

export const isAdminAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
  return !!token;
};

export const logoutAdmin = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (timeString) => {
  if (!timeString) return '-';
  return timeString;
};
