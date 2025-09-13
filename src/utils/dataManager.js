// Data management utilities for local storage and file sync
import studentsData from '../data/students.json';
import attendanceData from '../data/attendance.json';

const STORAGE_KEYS = {
  ATTENDANCE: 'student_attendance_data',
  ADMIN_AUTH: 'admin_auth_token'
};

// Function to update the attendance.json file in the project
const updateAttendanceJsonFile = (data) => {
  try {
    // Store the data in a special localStorage key for the JSON file
    localStorage.setItem('attendance_json_backup', JSON.stringify(data, null, 2));
    
    // Log the data for easy copying to the actual file
    console.log('=== ATTENDANCE DATA FOR attendance.json ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=== COPY THE ABOVE DATA TO attendance.json ===');
    
    return true;
  } catch (error) {
    console.error('Error updating attendance JSON:', error);
    return false;
  }
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

// Save attendance data to localStorage and update JSON backup
export const saveAttendanceData = (data) => {
  try {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data));
    
    // Update JSON file backup (no downloads!)
    updateAttendanceJsonFile(data);
    
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

// Export attendance data to JSON file (manual export)
export const exportAttendanceData = () => {
  const data = getAttendanceData();
  
  // Show the data in console for easy copying
  console.log('=== EXPORT ATTENDANCE DATA ===');
  console.log('Copy the following data to attendance.json:');
  console.log(JSON.stringify(data, null, 2));
  console.log('=== END EXPORT ===');
  
  // Also store in localStorage for backup
  localStorage.setItem('attendance_json_backup', JSON.stringify(data, null, 2));
  
  return true;
};

// Get attendance data as JSON string for copying to file
export const getAttendanceDataAsJson = () => {
  const data = getAttendanceData();
  return JSON.stringify(data, null, 2);
};

// Load attendance data from JSON file (for importing)
export const loadAttendanceFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (Array.isArray(data)) {
          // Save to localStorage
          if (saveAttendanceData(data)) {
            resolve(data);
          } else {
            reject(new Error('Failed to save imported data'));
          }
        } else {
          reject(new Error('Invalid data format'));
        }
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};
