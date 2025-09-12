import { useState, useEffect, useRef } from 'react';
import { getStudentByNIC, markAttendance, getTodaysAttendance, getTodaysAttendanceStatus } from '../utils/dataManager';

const AttendanceInterface = ({ onNavigateToAdmin }) => {
  const [nic, setNic] = useState('');
  const [student, setStudent] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const nicInputRef = useRef(null);
  const resetTimeoutRef = useRef(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
      // Cleanup reset timeout on unmount
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  // Handle NIC input
  const handleNICChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setNic(value);
    
    // Clear any pending reset timeout when user starts typing
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    
    if (value.length === 12) {
      const foundStudent = getStudentByNIC(value);
      setStudent(foundStudent);
      
      if (foundStudent) {
        const status = getTodaysAttendanceStatus(value);
        setAttendanceStatus(status);
      } else {
        setAttendanceStatus(null);
      }
      setMessage('');
    } else {
      setStudent(null);
      setAttendanceStatus(null);
      setMessage('');
    }
  };

  // Handle attendance marking
  const handleMarkAttendance = async (type) => {
    if (!student || !attendanceStatus) return;

    setIsLoading(true);
    
    try {
      const success = markAttendance(student.nic, type);
      
      if (success) {
        setMessage(`${student.fullName} marked ${type.toUpperCase()} successfully!`);
        
        // Update attendance status
        const updatedStatus = getTodaysAttendanceStatus(student.nic);
        setAttendanceStatus(updatedStatus);
        
        // Clear form after successful marking and focus input
        resetTimeoutRef.current = setTimeout(() => {
          setNic('');
          setStudent(null);
          setAttendanceStatus(null);
          setMessage('');
          // Focus the NIC input field for the next student
          if (nicInputRef.current) {
            nicInputRef.current.focus();
          }
          resetTimeoutRef.current = null;
        }, 10000);
        
        // Also focus immediately for better UX (in case user wants to continue quickly)
        setTimeout(() => {
          if (nicInputRef.current) {
            nicInputRef.current.focus();
          }
        }, 1000);
      } else {
        if (type === 'in' && !attendanceStatus.canMarkIn) {
          setMessage('You have already marked IN today!');
        } else if (type === 'out' && !attendanceStatus.canMarkOut) {
          setMessage('You must mark IN first or have already marked OUT!');
        } else {
          setMessage('Error marking attendance. Please try again.');
        }
      }
    } catch (error) {
      setMessage('Error marking attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get today's attendance count
  const todaysAttendance = getTodaysAttendance();
  const attendanceCount = todaysAttendance.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary-800 mb-2">
            Student Attendance System
          </h1>
          <p className="text-lg text-secondary-600">
            Java Institute - Gampaha
          </p>
          <div className="mt-4 text-sm text-secondary-500">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} | {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-secondary-800 mb-6 text-center">
              Mark Attendance
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Enter Student NIC Number
                </label>
                <input
                  ref={nicInputRef}
                  type="text"
                  value={nic}
                  onChange={handleNICChange}
                  placeholder="Enter 12-digit NIC number"
                  maxLength={12}
                  className="input-field text-center text-lg tracking-wider"
                  autoFocus
                />
              </div>

              {student && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center space-x-4 mb-3">
                    <img
                      src={student.profilePicture}
                      alt={student.fullName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary-300"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-800">
                        {student.fullName}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        NIC: {student.nic}
                      </p>
                    </div>
                  </div>
                  
                  {/* Attendance Status */}
                  {attendanceStatus && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-secondary-700">Today's Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            attendanceStatus.status === 'not_marked' 
                              ? 'bg-gray-100 text-gray-700' 
                              : attendanceStatus.status === 'in'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {attendanceStatus.status === 'not_marked' && 'Not Marked'}
                            {attendanceStatus.status === 'in' && 'Present (IN)'}
                            {attendanceStatus.status === 'completed' && 'Completed (IN & OUT)'}
                          </span>
                        </div>
                        {attendanceStatus.inTime && (
                          <span className="text-xs text-secondary-500">
                            IN: {attendanceStatus.inTime}
                          </span>
                        )}
                      </div>
                      {attendanceStatus.outTime && (
                        <div className="mt-2 text-xs text-secondary-500">
                          OUT: {attendanceStatus.outTime}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {student && attendanceStatus && (
                <div className="space-y-4">
                  {/* Show single button based on status */}
                  {attendanceStatus.canMarkIn && (
                    <button
                      onClick={() => handleMarkAttendance('in')}
                      disabled={isLoading}
                      className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50 w-full text-lg py-4"
                    >
                      {isLoading ? 'Processing...' : '🎯 Mark IN'}
                    </button>
                  )}
                  
                  {attendanceStatus.canMarkOut && (
                    <button
                      onClick={() => handleMarkAttendance('out')}
                      disabled={isLoading}
                      className="btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50 w-full text-lg py-4"
                    >
                      {isLoading ? 'Processing...' : '🚪 Mark OUT'}
                    </button>
                  )}
                  
                  {!attendanceStatus.canMarkIn && !attendanceStatus.canMarkOut && (
                    <div className="text-center py-4">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="text-gray-600 font-medium">
                          ✅ Attendance Complete for Today
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          IN: {attendanceStatus.inTime} | OUT: {attendanceStatus.outTime}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {message && (
                <div className={`p-3 rounded-lg text-center font-medium ${
                  message.includes('successfully') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-secondary-800 mb-6 text-center">
              Today's Summary
            </h2>
            
            <div className="space-y-4">
              <div className="bg-primary-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-primary-700">
                  {attendanceCount}
                </div>
                <div className="text-sm text-primary-600">
                  Total Attendance Records
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-secondary-700">Recent Activity</h3>
                {todaysAttendance.slice(-5).reverse().map((record, index) => {
                  const student = getStudentByNIC(record.nic);
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student?.profilePicture || 'https://via.placeholder.com/40'}
                          alt={student?.fullName || 'Unknown'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-secondary-800">
                            {student?.fullName || 'Unknown Student'}
                          </div>
                          <div className="text-xs text-secondary-500">
                            {record.inTime && `IN: ${record.inTime}`}
                            {record.inTime && record.outTime && ' | '}
                            {record.outTime && `OUT: ${record.outTime}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Access */}
        <div className="text-center mt-8">
          <button
            onClick={onNavigateToAdmin}
            className="text-sm text-primary-600 hover:text-primary-700 underline"
          >
            Admin Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceInterface;
