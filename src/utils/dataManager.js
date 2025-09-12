// Data management utilities for local storage
import studentsData from '../data/students.json';

const STORAGE_KEYS = {
  ATTENDANCE: 'student_attendance_data',
  ADMIN_AUTH: 'admin_auth_token'
};

// Get attendance data from localStorage
export const getAttendanceData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading attendance data:', error);
    return [];
  }
};

// Save attendance data to localStorage
export const saveAttendanceData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving attendance data:', error);
    return false;
  }
};

// Get student by NIC
export const getStudentByNIC = (nic) => {
  return studentsData.find(student => student.nic === nic);
};

// Get today's attendance status for a student
export const getTodaysAttendanceStatus = (nic) => {
  const attendanceData = getAttendanceData();
  const today = new Date().toISOString().split('T')[0];
  
  const todayRecord = attendanceData.find(record => 
    record.nic === nic && record.date === today
  );

  if (!todayRecord) {
    return {
      status: 'not_marked',
      canMarkIn: true,
      canMarkOut: false,
      inTime: null,
      outTime: null
    };
  }

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
};

// Mark attendance (In or Out)
export const markAttendance = (nic, type) => {
  const attendanceData = getAttendanceData();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Find existing record for today
  let todayRecord = attendanceData.find(record => 
    record.nic === nic && record.date === today
  );

  if (todayRecord) {
    // Update existing record - prevent duplicate entries
    if (type === 'in' && !todayRecord.inTime) {
      todayRecord.inTime = currentTime;
      todayRecord.lastUpdated = new Date().toISOString();
    } else if (type === 'out' && !todayRecord.outTime && todayRecord.inTime) {
      todayRecord.outTime = currentTime;
      todayRecord.lastUpdated = new Date().toISOString();
    } else {
      // Already marked this type today
      return false;
    }
  } else {
    // Create new record - only allow IN for new records
    if (type === 'in') {
      const newRecord = {
        nic,
        date: today,
        inTime: currentTime,
        outTime: null,
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      attendanceData.push(newRecord);
    } else {
      // Cannot mark OUT without marking IN first
      return false;
    }
  }

  return saveAttendanceData(attendanceData);
};

// Get today's attendance records
export const getTodaysAttendance = () => {
  const attendanceData = getAttendanceData();
  const today = new Date().toISOString().split('T')[0];
  
  return attendanceData.filter(record => record.date === today);
};

// Get attendance records for a specific student
export const getStudentAttendance = (nic) => {
  const attendanceData = getAttendanceData();
  return attendanceData.filter(record => record.nic === nic);
};

// Get all attendance records
export const getAllAttendanceRecords = () => {
  return getAttendanceData();
};

// Admin authentication
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

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
  return !!token;
};

// Logout admin
export const logoutAdmin = () => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
};

// Format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time for display
export const formatTime = (timeString) => {
  if (!timeString) return '-';
  return timeString;
};
