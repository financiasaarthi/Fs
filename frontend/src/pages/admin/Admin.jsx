import React, { useEffect, useState } from 'react';
import api from "../../api/axios";
import DashboardCards from '../../components/DashboardCards';
import UserSearch from './UserSearch';
import ReferralTree from '../../components/ReferralTree';
import AdminWithdrawalTable from './AdminWithdrawalTable';
import { useNavigate } from 'react-router-dom'; 
import { Video, ArrowRight, RefreshCw } from 'lucide-react'; 

const AdminDashboard = () => {
  const navigate = useNavigate(); 
  const [stats, setStats] = useState({
    totalUsers: 0, todayUsers: 0, paidUsers: 0,
    totalDeposit: 0, todayDeposit: 0, pendingDepositToday: 0,
    totalWithdrawal: 0, todayWithdrawal: 0,  
    approvedWithdrawalTotal: 0, approvedWithdrawalToday: 0,
    pendingWithdrawalTotal: 0, pendingWithdrawalToday: 0,
  });

  const [withdrawals, setWithdrawals] = useState([]);
  const token = localStorage.getItem('adminToken');

  // 🟢 1. Check if token exists on page load
  useEffect(() => {
    if (!token) {
      // 🚀 Redirect with your secret key
      navigate('/admin/login?key=SuperSuper'); 
      return;
    }
    fetchDashboardData();
    fetchWithdrawals();
  }, [token, navigate]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      setStats({
        totalUsers: statsRes.data.totalUsers || 0, 
        todayUsers: statsRes.data.todayUsers || 0, 
        paidUsers: statsRes.data.paidUsers || 0,
        
        totalDeposit: statsRes.data.totalDeposit || 0, 
        todayDeposit: statsRes.data.todayDeposit || 0, 
        pendingDepositToday: statsRes.data.pendingDepositToday || 0,
        
        totalWithdrawal: statsRes.data.totalWithdrawal || 0, 
        todayWithdrawal: statsRes.data.approvedWithdrawalToday || 0, 
        
        approvedWithdrawalTotal: statsRes.data.approvedWithdrawalTotal || 0, 
        approvedWithdrawalToday: statsRes.data.approvedWithdrawalToday || 0,
        pendingWithdrawalTotal: statsRes.data.pendingWithdrawalTotal || 0, 
        pendingWithdrawalToday: statsRes.data.pendingWithdrawalToday || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // 🟢 2. Check if API says Token is Expired / Invalid (401 or 403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('adminToken'); 
        // 🚀 Redirect with your secret key
        navigate('/admin/login?key=SuperSuper'); 
      }
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/admin/withdrawals', { headers: { Authorization: `Bearer ${token}` } });
      setWithdrawals(res.data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      // 🟢 2. Check if API says Token is Expired / Invalid (401 or 403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('adminToken');
        // 🚀 Redirect with your secret key
        navigate('/admin/login?key=SuperSuper'); 
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8 pt-20 md:pt-24 font-sans">
      
      {/* 🔵 Header Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Admin Overview</h1>
        <p className="text-sm font-bold text-slate-500 mt-1">Real-time statistics and system management</p>
      </div>

      {/* 📊 Dashboard Stats Cards */}
      <DashboardCards stats={stats} />

      {/* 🟢 Quick Links (Video Management shortcut) */}
      <div className="mt-6 md:mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 p-5 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center text-white gap-5">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 md:p-4 rounded-xl backdrop-blur-sm">
            <Video size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black tracking-wide">Daily Task Videos</h3>
            <p className="text-blue-100 text-xs md:text-sm font-medium mt-1">Manage YouTube links for user daily tasks</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/admin/videos')} 
          className="w-full md:w-auto bg-white text-indigo-600 hover:bg-slate-50 hover:scale-105 font-black py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
        >
          Manage Videos <ArrowRight size={18} />
        </button>
      </div>

      {/* 🟠 Middle Grid (User Search & Tree) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 md:mt-8">
        
        {/* User Search Box */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="mb-4 border-b border-slate-50 pb-3">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">User Management</h3>
          </div>
          <div className="flex-1">
             <UserSearch />
          </div>
        </div>

        {/* Network Tree Box */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
          <div className="mb-4 border-b border-slate-50 pb-3">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Network Tree</h3>
          </div>
          <div className="flex-1">
             <ReferralTree />
          </div>
        </div>

      </div>

      {/* 🔴 Recent Withdrawals Table Section */}
      <div className="mt-6 md:mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-50 pb-4">
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Withdrawals</h3>
            <p className="text-[11px] text-slate-400 font-bold mt-1">Track user payout requests</p>
          </div>
          
          <button 
            onClick={fetchWithdrawals} 
            className="flex items-center gap-2 text-xs font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-100/50"
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>

        {/* Table wrapper for mobile scrolling */}
        <div className="w-full overflow-x-auto pb-2 custom-scroll">
            <div className="min-w-[1000px]"> 
                <AdminWithdrawalTable withdrawals={withdrawals} refreshWithdrawals={fetchWithdrawals} />
            </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;