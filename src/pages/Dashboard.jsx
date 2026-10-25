import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, absentToday: 0 });
  const [classStats, setClassStats] = useState([]);
  const [lowAttendance, setLowAttendance] = useState([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [profileData, setProfileData] = useState({ newUsername: '', currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const token = localStorage.getItem('adminToken');

  const fetchData = async () => {
    try {
      const [statsRes, classRes, lowRes] = await Promise.all([
        axios.get(`${API_BASE}/api/attendance/dashboard-stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/api/attendance/class-stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/api/attendance/low-attendance?className=${selectedClassFilter}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setClassStats(classRes.data.data);
      setLowAttendance(lowRes.data.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token, selectedClassFilter]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      const res = await axios.put(`${API_BASE}/api/auth/update-profile`, profileData, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem('adminData', JSON.stringify(res.data.teacher));
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => { setShowModal(false); window.location.reload(); }, 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    }
  };

  const chartData = [40, 65, 80, 55, 90, 70, 85]; 
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-8 animate-pop relative">
      
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 p-8 rounded-3xl shadow-[0_10px_30px_rgba(22,101,52,0.3)] text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-green-600/50">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Welcome back, Sir Principal!</h3>
          <p className="text-green-100 max-w-xl">Here is the live overview of GCIT Collage. You can manage students, print ID cards, and view attendance reports.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-white/10 hover:bg-white/20 transition-all px-5 py-2.5 rounded-xl text-sm font-bold backdrop-blur-md border border-white/20 z-10 flex items-center gap-2 shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Security
        </button>
      </div>

      {/* MODAL (Same as before) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div><h3 className="text-xl font-bold text-slate-800 dark:text-white">Account Security</h3><p className="text-xs text-slate-500 dark:text-slate-400">Update your login credentials</p></div>
            </div>
            {msg.text && <div className={`p-3 rounded-xl mb-6 text-sm font-bold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>}
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Password *</label><input type="password" value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white" required /></div>
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Username</label><input type="text" value={profileData.newUsername} onChange={(e) => setProfileData({...profileData, newUsername: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" /></div>
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label><input type="password" value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" /></div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold py-3 rounded-xl">Cancel</button><button type="submit" className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700">Update</button></div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 LIVE STATS CARDS (With Neon Glow) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-lg p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-700 flex items-center space-x-5 hover:border-green-500/50 transition-colors duration-300">
          <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{loading ? '-' : stats.totalStudents}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-lg p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(16,185,129,0.1)] border border-slate-200 dark:border-emerald-500/30 flex items-center space-x-5 hover:border-emerald-500/50 transition-colors duration-300">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Present Today</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{loading ? '-' : stats.presentToday}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-lg p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(239,68,68,0.1)] border border-slate-200 dark:border-red-500/30 flex items-center space-x-5 hover:border-red-500/50 transition-colors duration-300">
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Absent Today</p>
            <p className="text-3xl font-extrabold text-red-500 dark:text-red-400">{loading ? '-' : stats.absentToday}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🚀 PREMIUM SMOOTH CHART */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg text-slate-800 dark:text-white">Weekly Overview</h4>
            <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">Live</span>
          </div>
          <div className="relative h-48 w-full flex items-end justify-between gap-2 mt-4">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
               <defs>
                 <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4"/>
                   <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
                 </linearGradient>
               </defs>
               <path d="M 0 60 Q 10 40 20 65 T 40 30 T 60 50 T 80 20 T 100 40 L 100 100 L 0 100 Z" fill="url(#chartGradient)" />
               <path d="M 0 60 Q 10 40 20 65 T 40 30 T 60 50 T 80 20 T 100 40" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {chartData.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group z-10">
                <div className="w-2 h-2 rounded-full bg-green-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2">{days[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CLASS-WISE STATS */}
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Classes</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
            {classStats.length === 0 ? (
              <p className="text-slate-500 text-sm">No data available.</p>
            ) : (
              classStats.map((cls, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Class {cls.className}</span>
                  <div className="flex gap-4 text-sm font-bold">
                    <span className="text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {cls.present}P</span>
                    <span className="text-red-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> {cls.absent}A</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* LOW ATTENDANCE ALERT */}
      <div className="bg-white dark:bg-slate-800/80 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-red-200 dark:border-red-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">⚠️</span>
            <h4 className="font-bold text-lg text-red-600 dark:text-red-400">Low Attendance Alert</h4>
          </div>
          <select value={selectedClassFilter} onChange={(e) => setSelectedClassFilter(e.target.value)} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm cursor-pointer">
            <option value="all">All Classes</option>
            {classStats.map((cls, idx) => (<option key={idx} value={cls.className}>Class {cls.className}</option>))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {lowAttendance.length === 0 ? (
            <p className="text-slate-500 text-sm col-span-full">All students in this class have good attendance. 🎉</p>
          ) : (
            lowAttendance.map((student) => (
              <Link to={`/student/${student._id}`} key={student._id} className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 hover:shadow-md hover:border-red-300 transition">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{student.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Roll: {student.rollNumber} | Class: {student.className}</p>
                </div>
                <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg">{student.percentage}%</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;