import React, { useEffect, useState } from 'react';
import api from "../../api/axios";
import DashboardCards from '../../components/DashboardCards';
import UserSearch from './UserSearch';
import ReferralTree from '../../components/ReferralTree';
import AdminWithdrawalTable from './AdminWithdrawalTable';
import { useNavigate } from 'react-router-dom'; // 🟢 Naya import
import { Video, ArrowRight } from 'lucide-react'; // 🟢 Naya import

const AdminDashboard = () => {
  const navigate = useNavigate(); // 🟢 Navigation ke liye
  const [stats, setStats] = useState({
    totalUsers: 0, todayUsers: 0, paidUsers: 0,
    totalDeposit: 0, todayDeposit: 0, pendingDepositToday: 0,
    totalWithdrawal: 0, approvedWithdrawalTotal: 0, approvedWithdrawalToday: 0,
    pendingWithdrawalTotal: 0, pendingWithdrawalToday: 0,
  });

  const [withdrawals, setWithdrawals] = useState([]);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchDashboardData();
    fetchWithdrawals();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      setStats({
        totalUsers: statsRes.data.totalUsers || 0, todayUsers: statsRes.data.todayUsers || 0, paidUsers: statsRes.data.paidUsers || 0,
        totalDeposit: statsRes.data.totalDeposit || 0, todayDeposit: statsRes.data.todayDeposit || 0, pendingDepositToday: statsRes.data.pendingDepositToday || 0,
        totalWithdrawal: statsRes.data.totalWithdrawal || 0, approvedWithdrawalTotal: statsRes.data.approvedWithdrawalTotal || 0, approvedWithdrawalToday: statsRes.data.approvedWithdrawalToday || 0,
        pendingWithdrawalTotal: statsRes.data.pendingWithdrawalTotal || 0, pendingWithdrawalToday: statsRes.data.pendingWithdrawalToday || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/admin/withdrawals', { headers: { Authorization: `Bearer ${token}` } });
      setWithdrawals(res.data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 pt-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
        <p className="text-sm text-gray-500">Real-time statistics and system management</p>
      </div>

      <DashboardCards stats={stats} />

      {/* 🟢 NAYA SECTION: Quick Links (Video Management shortcut) */}
      <div className="mt-8 bg-blue-600 rounded-xl shadow-sm border border-blue-700 p-6 flex flex-col md:flex-row justify-between items-center text-white">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="bg-white/20 p-3 rounded-full"><Video size={28} /></div>
          <div>
            <h3 className="text-xl font-bold">Daily Task Videos</h3>
            <p className="text-blue-100 text-sm">Add or remove YouTube links for users' daily tasks.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/admin/videos')} 
          className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
        >
          Manage Videos <ArrowRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-4">User Management</h3>
          <UserSearch />
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Network Tree</h3>
          <ReferralTree />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-700">Recent Withdrawals</h3>
          <button onClick={fetchWithdrawals} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Refresh Data</button>
        </div>
        <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-[1000px]"> 
                <AdminWithdrawalTable withdrawals={withdrawals} refreshWithdrawals={fetchWithdrawals} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;