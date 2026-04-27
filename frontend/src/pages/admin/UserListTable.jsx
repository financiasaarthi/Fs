import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios'; 
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { Search, Download, ExternalLink, Copy, UserCheck, UserX, Wallet, Award } from 'lucide-react';

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

  // 🔥 Naye Schema ke hisaab se Filter Logic Update kiya
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

      // Package / Top-Up Match Logic (Naye schema mein currentPackage ya topUpAmount dono ho sakte hain)
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
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleEntriesChange = (e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); };

  // ✅ Export CSV (Updated with new fields)
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
      
      // ✅ Popup blocker bypass via link click
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
    // Optional: Add a small toast here if you have sweetalert/toast installed
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-sm">Loading Users...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col xl:flex-row gap-4 justify-between items-center">
        
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full md:w-60 bg-gray-50"
              placeholder="Search Name, ID or Mobile..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Dates */}
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 outline-none" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 outline-none" value={dateTo} onChange={e => setDateTo(e.target.value)} />

          {/* Package Filter */}
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 bg-gray-50 outline-none cursor-pointer"
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
        <div className="flex gap-3 items-center w-full xl:w-auto justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wide">Show:</span>
            <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-gray-50 outline-none" value={itemsPerPage} onChange={handleEntriesChange}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md shadow-blue-200 transition-all text-sm flex items-center gap-2">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4 text-center">Package Status</th>
                <th className="px-6 py-4">Registration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <UserX size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No users found</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((user, idx) => {
                  const packageAmount = user.currentPackage || user.topUpAmount || 0;
                  const isActive = user.isActive || packageAmount > 0;

                  return (
                  <tr key={user.userId || idx} className="hover:bg-gray-50/50 transition-colors group">
                    
                    {/* User ID & Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleLoginAsUser(user.userId)}
                          className="text-blue-600 hover:text-blue-800 font-black text-sm flex items-center gap-1 hover:underline"
                          title="Login to this account"
                        >
                          {user.userId} <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 transition-opacity"/>
                        </button>
                        <button onClick={() => handleCopy(user.userId.toString())} className="text-gray-300 hover:text-gray-600">
                          <Copy size={14} />
                        </button>
                      </div>
                      <div className="mt-1 text-[10px] font-bold text-gray-400 uppercase">
                        Sponsor: <span className="text-gray-600">{user.sponsorId || 'Admin'}</span>
                      </div>
                    </td>

                    {/* Personal Details */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-gray-800">{user.name}</p>
                      <p className="text-xs font-bold text-gray-500 mt-0.5">{user.mobile}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[180px]" title={user.email}>{user.email}</p>
                    </td>

                    {/* Wallets */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-black text-gray-700">
                          <Wallet size={14} className="text-green-500"/> ${user.walletBalance?.toFixed(2) || '0.00'}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Award size={14} className="text-orange-500"/> Total: ${(user.wallets?.totalEarned || 0).toFixed(2)}
                        </div>
                      </div>
                    </td>

                    {/* Status & Package */}
                    <td className="px-6 py-4 text-center">
                      {isActive ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md text-xs font-black uppercase">
                            <UserCheck size={12} /> Active
                          </span>
                          <span className="text-[10px] font-black text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded-full">
                            ${packageAmount} Pack
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-md text-xs font-black uppercase">
                          <UserX size={12} /> Inactive
                        </span>
                      )}
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-gray-600">{new Date(user.createdAt).toLocaleDateString('en-GB')}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(user.createdAt).toLocaleTimeString()}</p>
                    </td>

                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredUsers.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <span className="text-gray-500 font-bold text-xs uppercase tracking-wide">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} Users
            </span>
            
            <div className="flex gap-1.5">
              <button
                onClick={handlePrev} disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white bg-gray-50 text-gray-600 transition-colors"
              >
                PREV
              </button>
              
              <button className="px-4 py-1.5 border border-blue-600 rounded-lg bg-blue-600 text-white text-xs font-black shadow-sm">
                {currentPage}
              </button>

              <button
                onClick={handleNext} disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white bg-gray-50 text-gray-600 transition-colors"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListTable;