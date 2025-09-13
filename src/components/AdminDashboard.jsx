import { useState, useEffect } from 'react';
import { 
  getAllAttendanceRecords, 
  getTodaysAttendance, 
  getStudentByNIC, 
  formatDate, 
  formatTime,
  logoutAdmin,
  exportAttendanceData,
  getAttendanceDataAsJson 
} from '../utils/dataManager';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const allRecords = getAllAttendanceRecords();
  const todaysRecords = getTodaysAttendance();

  // Filter records based on search term
  const filteredRecords = allRecords.filter(record => {
    const student = getStudentByNIC(record.nic);
    return student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           record.nic.includes(searchTerm);
  });

  // Group records by student for individual view
  const groupedRecords = filteredRecords.reduce((acc, record) => {
    if (!acc[record.nic]) {
      acc[record.nic] = [];
    }
    acc[record.nic].push(record);
    return acc;
  }, {});

  const handleLogout = () => {
    logoutAdmin();
    onLogout();
  };

  const handleExportData = () => {
    const jsonData = getAttendanceDataAsJson();
    
    // Copy to clipboard
    navigator.clipboard.writeText(jsonData).then(() => {
      alert('Attendance data copied to clipboard! Paste it into attendance.json file.');
    }).catch(() => {
      // Fallback: show in alert
      alert(`Attendance data:\n\n${jsonData}\n\nCopy this data to attendance.json file.`);
    });
  };

  const renderTodayTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-700">
            {todaysRecords.length}
          </div>
          <div className="text-sm text-primary-600">Today's Records</div>
        </div>
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">
            {todaysRecords.filter(r => r.inTime).length}
          </div>
          <div className="text-sm text-green-600">Students In</div>
        </div>
        <div className="bg-blue-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">
            {todaysRecords.filter(r => r.outTime).length}
          </div>
          <div className="text-sm text-blue-600">Students Out</div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">
          Today's Attendance Records
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-secondary-700">Student</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-700">NIC</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-700">In Time</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-700">Out Time</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {todaysRecords.map((record, index) => {
                const student = getStudentByNIC(record.nic);
                const status = record.outTime ? 'Completed' : record.inTime ? 'Present' : 'Absent';
                const statusColor = record.outTime ? 'text-green-600' : record.inTime ? 'text-blue-600' : 'text-red-600';
                
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student?.profilePicture || 'https://via.placeholder.com/40'}
                          alt={student?.fullName || 'Unknown'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-medium text-secondary-800">
                          {student?.fullName || 'Unknown Student'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-secondary-600">{record.nic}</td>
                    <td className="py-3 px-4 text-secondary-600">{formatTime(record.inTime)}</td>
                    <td className="py-3 px-4 text-secondary-600">{formatTime(record.outTime)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${statusColor}`}>{status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderIndividualTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">
          Search Student Records
        </h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student name or NIC..."
          className="input-field"
        />
      </div>

      <div className="space-y-4">
        {Object.entries(groupedRecords).map(([nic, records]) => {
          const student = getStudentByNIC(nic);
          const sortedRecords = records.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          return (
            <div key={nic} className="card">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={student?.profilePicture || 'https://via.placeholder.com/60'}
                  alt={student?.fullName || 'Unknown'}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-semibold text-secondary-800">
                    {student?.fullName || 'Unknown Student'}
                  </h4>
                  <p className="text-sm text-secondary-600">NIC: {nic}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-secondary-700">Date</th>
                      <th className="text-left py-2 px-3 font-medium text-secondary-700">In Time</th>
                      <th className="text-left py-2 px-3 font-medium text-secondary-700">Out Time</th>
                      <th className="text-left py-2 px-3 font-medium text-secondary-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRecords.map((record, index) => {
                      const status = record.outTime ? 'Completed' : record.inTime ? 'Present' : 'Absent';
                      const statusColor = record.outTime ? 'text-green-600' : record.inTime ? 'text-blue-600' : 'text-red-600';
                      
                      return (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-3 text-secondary-600">{formatDate(record.date)}</td>
                          <td className="py-2 px-3 text-secondary-600">{formatTime(record.inTime)}</td>
                          <td className="py-2 px-3 text-secondary-600">{formatTime(record.outTime)}</td>
                          <td className="py-2 px-3">
                            <span className={`font-medium ${statusColor}`}>{status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary-800">
                Admin Dashboard
              </h1>
              <p className="text-sm text-secondary-600">
                Java Institute - Gampaha | {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleExportData}
                className="btn-secondary text-sm"
                title="Export attendance data to JSON file"
              >
                📥 Export
              </button>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('today')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'today'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-gray-300'
                }`}
              >
                Today's Attendance
              </button>
              <button
                onClick={() => setActiveTab('individual')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'individual'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-gray-300'
                }`}
              >
                Individual Records
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'today' && renderTodayTab()}
        {activeTab === 'individual' && renderIndividualTab()}
      </div>
    </div>
  );
};

export default AdminDashboard;
