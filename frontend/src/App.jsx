import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
// Layout Components
import Navbar from './components/Navbar';
import UserSidebar from './components/UserSidebar'; 
import AdminSidebar from './pages/admin/Sidebar';

// 🌟 HOME PAGE
import Home from './pages/Home'; 

// Auth & User Pages
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/user/Dashboard';
import MyTeam from './pages/user/MyTeam';
import NetworkTree from './pages/user/NetworkTree'; 
import TaskCenter from './pages/user/TaskCenter';
import WithdrawHistory from './pages/user/WithdrawHistory'; 
import BinaryHistory from './pages/user/BinaryHistory'; 
import NetworkStatusPage from './pages/user/NetworkStatusPage';
import DirectTeam from './pages/user/DirectTeam';
import AllTeam from './pages/user/AllTeam';
import TransferFunds from './pages/user/TransferFunds';
import DepositHistory from './pages/user/DepositHistory';
import PackageHistory from './pages/user/PackageHistory';
import ConvertHistory from './pages/user/ConvertHistory'; 
import AllTransactions from './pages/user/AllTransactions';
import WalletHistory from './pages/user/WalletHistory'; 
import UserProfile from './pages/user/UserProfile'; 
import DirectIncomeHistory from './pages/user/DirectIncomeHistory'; // Path check kar lena apne hisaab se
import TaskHistory from './pages/user/TaskHistory';
// Admin Pages
import AdminPage from './pages/admin/Admin'; 
import AdminDashboard from './pages/admin/AdminDashboard';
import UserListTable from './pages/admin/UserListTable';
import DepositTable from './pages/admin/DepositTable';
import AdminTransactions from './pages/admin/AdminTransactions';
import TotalTopUpPage from './pages/admin/TotalTopUpPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import RequestWithdrawalPage from './pages/admin/RequestWithdrawalPage';
import AllWithdrawalsPage from './pages/admin/AllWithdrawalsPage';
import DirectIncomePage from './pages/admin/DirectIncomePage';
import LevelIncomePage from './pages/admin/LevelIncomePage';
import WalletSummaryPage from './pages/admin/WalletSummaryPage';
import CreditToWalletPage from './pages/admin/CreditToWallet';
import BlockedUsers from "./pages/admin/BlockedUsers";
import ReverseTransaction from './pages/admin/ReverseTransaction';
import AddUser from './pages/admin/AddUser';
import AdminNotifications from './pages/admin/AdminCreateNotification';
import AdminSupport from "./pages/admin/AdminSupport";
import ManualDeposit from './pages/admin/ManualDeposit';
import AdminLoginStats from './pages/admin/AdminLoginStats';
import AdminSecurity from './pages/admin/AdminSecurity';
import DeviceManager from './pages/admin/DeviceManager';
import AdminVideos from './pages/admin/AdminVideos';

import './index.css';

// 🟢 USER LAYOUT
 

// 🔴 ADMIN LAYOUT
 

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

// Layout components same rahenge...
const UserLayout = ({ children, isSidebarOpen, toggleSidebar }) => (
  <div className="flex w-full min-h-[calc(100vh-65px)] overflow-x-hidden font-sans relative">
    <UserSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    <div className="flex-1 p-1 sm:p-4 md:p-6 lg:p-8 bg-[#F4F5F7] w-full transition-all duration-300">
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  </div>
);

const AdminLayout = ({ isSidebarOpen, toggleSidebar }) => (
  <div className="flex w-full min-h-[calc(100vh-65px)] overflow-x-hidden font-sans relative">
    <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 bg-[#EEF2F5] w-full transition-all duration-300 border-l border-gray-200">
      <div className="max-w-7xl mx-auto"><Outlet /></div>
    </div>
  </div>
);

function App() {
  // 🟢 FIX 2: Purani local 'user' state hata di. Ab Context se le rahe hain.
  const { user, logout } = useAuth(); 

  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem('adminToken'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  
  const location = useLocation();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isAuthPage = ['/login', '/register', '/admin/login', '/'].includes(location.pathname);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F7]">
      <ScrollToTop />
      
      {/* 🟢 FIX 3: Navbar ko ab context wala user milega */}
      {!isAuthPage && <Navbar user={user} toggleSidebar={toggleSidebar} />}
      
      <main className="flex-1 flex relative">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin setIsAdmin={setIsAdmin} />} />

          {/* 🔐 USER ROUTES (Ab ye hamesha update honge jaise hi login hoga) */}
          <Route path="/dashboard" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><Dashboard /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><UserProfile /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/my-team" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><MyTeam /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/network-tree" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><NetworkTree /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/network-status" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><NetworkStatusPage /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/tasks" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><TaskCenter /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/withdraw-history" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><WithdrawHistory /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/deposit-history" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><DepositHistory /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/direct-team" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><DirectTeam /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/all-team" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><AllTeam /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/transfer" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><TransferFunds /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/package-history" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} ><PackageHistory /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/binary-history" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><BinaryHistory /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/all-transactions" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><AllTransactions /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/wallet-history" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><WalletHistory /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/convert-history" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><ConvertHistory /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/direct-income" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><DirectIncomeHistory /></UserLayout> : <Navigate to="/login" replace />} />
          <Route path="/task-history" element={user ? <UserLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><TaskHistory /></UserLayout> : <Navigate to="/login" replace />} />
          {/* 👑 ADMIN ROUTES */}
          <Route 
            path="/admin" 
            element={isAdmin ? <AdminLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> : <Navigate to="/admin/login" replace />}
          >
            <Route index element={<AdminPage />} /> 
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserListTable />} />
            <Route path="topups" element={<TotalTopUpPage />} />
            <Route path="deposits" element={<DepositTable />} />
            <Route path="withdrawals/request" element={<RequestWithdrawalPage />} />
            <Route path="withdrawals/all" element={<AllWithdrawalsPage />} />
            <Route path="direct-income" element={<DirectIncomePage />} />
            <Route path="level-income" element={<LevelIncomePage />} />
            <Route path="wallet-summary" element={<WalletSummaryPage />} />
            <Route path="credit-to-wallet" element={<CreditToWalletPage />} />
            <Route path="blocked-users" element={<BlockedUsers />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="transactions/reverse" element={<ReverseTransaction />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="security" element={<AdminSecurity />} />
            <Route path="login-stats" element={<AdminLoginStats />} />
            <Route path="device-manager" element={<DeviceManager />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="add-user" element={<AddUser />} />
            <Route path="manual-deposit" element={<ManualDeposit />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="videos" element={<AdminVideos />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;