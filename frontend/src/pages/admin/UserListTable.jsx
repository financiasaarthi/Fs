import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios'; 
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { Search, Download, ExternalLink, Copy, UserCheck, UserX, Wallet, Award, Calendar, LogIn, Phone, Mail } from 'lucide-react';

const UserListTable = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [topUpFilter, setTopUpFilter] = useState('all'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Admin token not found');

      const res = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔥 Naye Schema ke hisaab se Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const nameMatch = user.name?.toLowerCase().includes(search.toLowerCase());
      const idMatch = String(user.userId).includes(search);
      const mobileMatch = String(user.mobile || '').includes(search);
      const createdAt = new Date(user.createdAt);

      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      const inDateRange =
        (!fromDate || createdAt >= fromDate) &&
        (!toDate || createdAt <= toDate);

      // Package / Top-Up Match Logic
      let topUpMatch = true;
      const packageAmount = user.currentPackage || user.topUpAmount || 0;
      const isUserActive = user.isActive || packageAmount > 0;

      if (topUpFilter === 'unpaid') {
        topUpMatch = !isUserActive && packageAmount === 0;
      } else if (topUpFilter === 'paid') {
        topUpMatch = isUserActive || packageAmount > 0;
      } else if (topUpFilter !== 'all') {
        topUpMatch = packageAmount === Number(topUpFilter);
      }

      return (nameMatch || idMatch || mobileMatch) && inDateRange && topUpMatch;
    });
  }, [users, search, dateFrom, dateTo, topUpFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFrom, dateTo, topUpFilter]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleEntriesChange = (e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); };

  // ✅ Export CSV
  const exportToCSV = () => {
    const csvData = filteredUsers.map(user => ({
      'User ID': user.userId,
      'Name': user.name,
      'Mobile': user.mobile,
      'Email': user.email,
      'Sponsor ID': user.sponsorId || 'N/A',
      'Status': (user.isActive || user.currentPackage > 0) ? 'Active' : 'Inactive',
      'Package ($)': user.currentPackage || user.topUpAmount || 0,
      'Main Wallet ($)': user.walletBalance?.toFixed(2) || 0,
      'Total Earned ($)': user.wallets?.totalEarned?.toFixed(2) || 0,
      'Joined Date': new Date(user.createdAt).toLocaleString(), 
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Registered_Users_List.csv');
  };

  const handleLoginAsUser = async (targetUserId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return alert("Admin not authorized");

      const res = await api.post('/admin/impersonate', { userId: targetUserId }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      const { token: userToken, user: impersonatedUser } = res.data;
      const userDataStr = JSON.stringify(impersonatedUser);
      
      let targetBaseUrl = "";
      const currentHost = window.location.hostname;

      if (currentHost === "localhost" || currentHost === "127.0.0.1") {
        targetBaseUrl = "http://localhost:5173"; 
      } else {
        targetBaseUrl = "https://financialsaarthi.live"; 
      }

      const mainWebsiteUrl = `${targetBaseUrl}/login?token=${userToken}&user=${encodeURIComponent(userDataStr)}`;
      
      const link = document.createElement('a');
      link.href = mainWebsiteUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error("Impersonation failed:", err);
      alert(err.response?.data?.message || "Failed to login as this user.");
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-semibold text-sm">Loading Users Database...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto font-sans">
      
      {/* 🔵 Controls & Filters Section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col xl:flex-row gap-5 justify-between items-start xl:items-center">
        
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full md:w-64 bg-white transition-colors"
              placeholder="Search Name, ID or Mobile..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Dates */}
          <div className="flex gap-2 w-full md:w-auto">
             <input 
                type="date" 
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-700 outline-none w-full focus:border-blue-500 transition-colors" 
                value={dateFrom} 
                onChange={e => setDateFrom(e.target.value)} 
                title="From Date"
             />
             <input 
                type="date" 
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-700 outline-none w-full focus:border-blue-500 transition-colors" 
                value={dateTo} 
                onChange={e => setDateTo(e.target.value)} 
                title="To Date"
             />
          </div>

          {/* Package Filter */}
          <select 
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white outline-none cursor-pointer focus:border-blue-500 transition-colors"
            value={topUpFilter} onChange={(e) => setTopUpFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="unpaid">Registered (Inactive)</option>
            <option value="paid">All Active / Paid</option>
            <option value="10">$10 Package</option>
            <option value="30">$30 Package</option>
            <option value="60">$60 Package</option>
            <option value="120">$120 Package</option>
            <option value="240">$240 Package</option>
            <option value="480">$480 Package</option>
            <option value="960">$960 Package</option>
          </select>
        </div>

        {/* Right Side Controls */}
        <div className="flex gap-4 items-center w-full xl:w-auto justify-between border-t xl:border-none pt-4 xl:pt-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Show:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none cursor-pointer" value={itemsPerPage} onChange={handleEntriesChange}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-sm transition-all text-sm flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* 📊 Main Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sr. No.</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">User ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Mobile</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Wallets</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Joined Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-16">
                    <UserX size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium text-sm">No users found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((user, idx) => {
                  const packageAmount = user.currentPackage || user.topUpAmount || 0;
                  const isActive = user.isActive || packageAmount > 0;

                  return (
                  <tr key={user.userId || idx} className="hover:bg-blue-50/30 transition-colors">
                    
                    {/* Sr. No. */}
                    <td className="px-4 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                        {indexOfFirstItem + idx + 1}
                    </td>

                    {/* User ID & Sponsor */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-indigo-700">{user.userId}</span>
                        <button onClick={() => handleCopy(user.userId.toString())} className="text-gray-400 hover:text-gray-700 transition-colors" title="Copy ID">
                          <Copy size={14} />
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 font-medium">
                        Sponsor: <span className="font-semibold">{user.sponsorId || 'Admin'}</span>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-gray-900">{user.name || '-'}</p>
                    </td>

                    {/* Mobile */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                         <Phone size={14} className="text-gray-400"/> {user.mobile || '-'}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-1.5 text-sm text-gray-600 max-w-[150px] truncate" title={user.email}>
                          <Mail size={14} className="text-gray-400 shrink-0"/> {user.email || '-'}
                       </div>
                    </td>

                    {/* Wallets */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800" title="Main Wallet Balance">
                          <Wallet size={14} className="text-emerald-500"/> ${user.walletBalance?.toFixed(2) || '0.00'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500" title="Total Income Earned">
                          <Award size={14} className="text-orange-500"/> Earned: ${(user.wallets?.totalEarned || 0).toFixed(2)}
                        </div>
                      </div>
                    </td>

                    {/* Status & Package */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      {isActive ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                            <UserCheck size={14} /> Active
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-md border border-emerald-100">
                            ${packageAmount} Pack
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase">
                          <UserX size={14} /> Inactive
                        </span>
                      )}
                    </td>

                    {/* Registration Date */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                         <Calendar size={14} className="text-gray-400" />
                         {new Date(user.createdAt).toLocaleDateString('en-GB')}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 ml-5">{new Date(user.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </td>

                    {/* Action (Login) */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                        <button 
                          onClick={() => handleLoginAsUser(user.userId)}
                          className="inline-flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100 hover:border-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                          title="Impersonate this user"
                        >
                          <LogIn size={14} /> Login
                        </button>
                    </td>

                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📑 Pagination Footer */}
      {!loading && filteredUsers.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={handlePrev} 
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <span className="text-sm text-gray-600 font-medium">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} Users
          </span>

          <button
            onClick={handleNext} 
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default UserListTable;