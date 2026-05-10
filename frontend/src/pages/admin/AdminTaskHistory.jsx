import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios'; 
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { Search, Download, Calendar, User, DollarSign, XCircle, Clock, LogIn, Layers, CheckCircle2 } from 'lucide-react';

const AdminTaskHistory = () => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 

  // 📦 Backend se match karta hua Package limits
  const packagesConfig = {
    10: { maxTasks: 2 },
    30: { maxTasks: 6 },
    50: { maxTasks: 10 },
    100: { maxTasks: 20 },
    500: { maxTasks: 50 }
  };

  const fetchTaskSummary = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Admin token not found');

      const res = await api.get('/admin/task-summary', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHistory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch task history summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskSummary();
  }, []);

  // 🔥 Filter Logic
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const idMatch = String(item.userId || '').toLowerCase().includes(search.toLowerCase());
      const nameMatch = String(item.userName || '').toLowerCase().includes(search.toLowerCase());
      const createdAt = new Date(item.date); 

      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);

      const inDateRange =
        (!fromDate || createdAt >= fromDate) &&
        (!toDate || createdAt <= toDate);

      return (idMatch || nameMatch) && inDateRange;
    });
  }, [history, search, dateFrom, dateTo]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFrom, dateTo, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;

  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleEntriesChange = (e) => { setItemsPerPage(Number(e.target.value)); };

  // 🟢 LOGIN AS USER LOGIC (Impersonate)
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

  // ✅ Export CSV Update
  const exportToCSV = () => {
    const csvData = filteredHistory.map(item => {
      // Calculate totals for CSV
      const displayPackages = Array.from(new Set([...(item.activePackages || []), ...Object.keys(item.packageProgress).map(Number)]));
      let tWatched = 0, tMax = 0;
      displayPackages.forEach(pkg => {
        tWatched += (item.packageProgress[pkg] || 0);
        tMax += (packagesConfig[pkg]?.maxTasks || 0);
      });

      return {
        'Date': item.date,
        'User ID': item.userId,
        'Name': item.userName,
        'Total Tasks (Done/Max)': `${tWatched} / ${tMax}`,
        'Total Earned ($)': item.totalReward.toFixed(2),
        'Last Activity': new Date(item.lastTaskTime).toLocaleTimeString(),
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Daily_Task_Summary.csv');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-semibold text-sm">Calculating Task Summaries...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto font-sans">
      
      {/* 🔵 Controls & Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col xl:flex-row gap-5 justify-between items-start xl:items-center">
        
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-wrap">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full bg-white transition-colors"
              placeholder="Search User ID or Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
             <input type="date" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-700 outline-none w-full focus:border-blue-500" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="From Date" />
             <input type="date" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-700 outline-none w-full focus:border-blue-500" value={dateTo} onChange={e => setDateTo(e.target.value)} title="To Date" />
          </div>
        </div>

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

          <button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 sm:px-5 rounded-lg shadow-sm transition-all text-sm flex items-center gap-2 whitespace-nowrap">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* 📊 Main Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b">Sr. No.</th>
                <th className="px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b">Date</th>
                <th className="px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b">User ID</th>
                <th className="px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b">User Name</th>
                <th className="px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b min-w-[200px]">Package-wise Progress</th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b">Total Tasks (Done / Max)</th>
                <th className="px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b">Total Earned</th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b">Last Activity</th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-16">
                    <XCircle size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium text-sm">No task summary found</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((item, idx) => {
                  
                  // Combine packages
                  const displayPackages = Array.from(new Set([
                    ...(item.activePackages || []), 
                    ...Object.keys(item.packageProgress).map(Number)
                  ])).sort((a, b) => a - b);

                  // Calculate Total Max and Total Watched Tasks across all packages
                  let totalWatchedTasks = 0;
                  let totalMaxTasks = 0;

                  displayPackages.forEach(pkgPrice => {
                    totalWatchedTasks += (item.packageProgress[pkgPrice] || 0);
                    totalMaxTasks += (packagesConfig[pkgPrice]?.maxTasks || 0);
                  });

                  const isAllTasksCompleted = totalMaxTasks > 0 && totalWatchedTasks >= totalMaxTasks;

                  return (
                  <tr key={`${item.userId}-${item.date}`} className="hover:bg-blue-50/30 transition-colors">
                    
                    <td className="px-4 py-4 text-sm font-medium text-gray-500 whitespace-nowrap align-middle">
                        {indexOfFirstItem + idx + 1}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                         <Calendar size={14} className="text-gray-400" />
                         {new Date(item.date).toLocaleDateString('en-GB')}
                      </div>
                    </td>

                    {/* 🟢 Separate User ID Column */}
                    <td className="px-4 py-4 whitespace-nowrap align-middle">
                      <span className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                        <User size={14} className="text-indigo-400" /> {item.userId}
                      </span>
                    </td>

                    {/* 🟢 Separate User Name Column */}
                    <td className="px-4 py-4 whitespace-nowrap align-middle">
                      <span className="text-sm font-bold text-gray-800">{item.userName || '-'}</span>
                    </td>

                    {/* 🚀 Multi-Package Progress Bar */}
                    <td className="px-4 py-4 whitespace-nowrap align-middle">
                      <div className="flex flex-col gap-3">
                        {displayPackages.map(pkgPrice => {
                          const max = packagesConfig[pkgPrice]?.maxTasks || 0;
                          const watched = item.packageProgress[pkgPrice] || 0;
                          const progressPercentage = max > 0 ? Math.min((watched / max) * 100, 100) : 0;
                          
                          return (
                            <div key={pkgPrice} className="w-full">
                              <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                                <span className="text-gray-700 flex items-center gap-1">
                                  <Layers size={12} className="text-purple-500"/> ${pkgPrice} Pack: {watched}/{max}
                                </span>
                                <span className={progressPercentage === 100 ? 'text-emerald-600' : 'text-blue-600'}>
                                  {Math.round(progressPercentage)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5 shadow-inner">
                                <div 
                                  className={`h-1.5 rounded-full transition-all ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* 🟢 NEW: Total Tasks Combined */}
                    <td className="px-4 py-4 whitespace-nowrap align-middle text-center">
                      <div className={`inline-flex flex-col items-center justify-center px-4 py-1.5 rounded-xl border ${isAllTasksCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
                        <span className={`text-base font-black ${isAllTasksCompleted ? 'text-emerald-700' : 'text-blue-700'} flex items-center gap-1`}>
                           {isAllTasksCompleted && <CheckCircle2 size={16} className="text-emerald-500"/>}
                           {totalWatchedTasks} <span className="text-gray-400 text-sm">/ {totalMaxTasks}</span>
                        </span>
                        <span className={`text-[9px] uppercase tracking-wider font-bold mt-0.5 ${isAllTasksCompleted ? 'text-emerald-600' : 'text-blue-500'}`}>
                          Total Tasks
                        </span>
                      </div>
                    </td>

                    {/* Total Income Earned */}
                    <td className="px-4 py-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5 text-sm font-black text-emerald-600">
                        <DollarSign size={14} /> {item.totalReward.toFixed(2)}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center whitespace-nowrap align-middle">
                      <div className="flex items-center justify-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 w-fit mx-auto">
                        <Clock size={12} /> {new Date(item.lastTaskTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>

                    {/* 🟢 Action Column (Login Button Moved Here) */}
                    <td className="px-4 py-4 text-center whitespace-nowrap align-middle border-l border-gray-100">
                      <button 
                        onClick={() => handleLoginAsUser(item.userId)}
                        className="bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-indigo-200 hover:border-indigo-600 flex items-center justify-center gap-2 mx-auto shadow-sm active:scale-95"
                        title="Login as this user"
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

      {/* 📑 Pagination */}
      {!loading && filteredHistory.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button onClick={handlePrev} disabled={currentPage === 1} className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            ← Previous
          </button>
          
          <span className="text-sm text-gray-600 font-medium">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredHistory.length)} of {filteredHistory.length} Daily Records
          </span>

          <button onClick={handleNext} disabled={currentPage === totalPages} className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTaskHistory;