import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Users, Loader2, History, ArrowDownLeft, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const DirectIncomeHistory = () => {
  const { user, token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.userId) return;
      
      try {
        setLoading(true);
        // Backend API call for direct income
        const res = await axios.get(`/api/user/direct-income/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Handle array response safely
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load direct income history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.userId, token]);

  // 🔥 TOTAL EARNINGS CALCULATION LOGIC
  // Agar user ke wallet me value nahi hai (0 hai), toh neeche history se khud calculate kar lega
  const calculatedTotal = history.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const displayTotal = user?.wallets?.directIncome > 0 ? user.wallets.directIncome : calculatedTotal;

  // 🔥 SEARCH LOGIC (Optimized)
  const filteredHistory = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return history.filter(item => 
      item.fromUserId?.toString().toLowerCase().includes(s) || 
      item.description?.toLowerCase().includes(s) ||
      item.amount?.toString().includes(s)
    );
  }, [history, searchTerm]);

  // Reset pagination on search
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // 📊 PAGINATION LOGIC
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filteredHistory.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredHistory.length / entriesPerPage) || 1;

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans bg-gray-50 min-h-screen">
      
      {/* 🔵 Header Section */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-6 sm:p-8 rounded-2xl shadow-lg text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Users size={120} />
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm border border-white/30">
            <Users size={28} className="text-blue-50" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">Direct Bonus</h1>
            <p className="text-xs sm:text-sm text-blue-200 font-medium uppercase tracking-wider mt-1">Your Referral Earnings Log</p>
          </div>
        </div>

        {/* Total Earned Card in Header */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-center min-w-[200px] w-full md:w-auto shadow-inner">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">Total Direct Income</p>
            <h2 className="text-3xl font-bold text-yellow-400 drop-shadow-md">
              ${Number(displayTotal).toFixed(2)}
            </h2>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by User ID, Amount or Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base text-gray-700 transition-colors"
          />
        </div>
        <select
          value={entriesPerPage}
          onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium outline-none cursor-pointer hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500"
        >
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>
      </div>

      {/* 📊 Table Container */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* 🔥 Naya Sr. No. Column Add Kiya */}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sr. No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">From User ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Earned Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <span className="text-sm font-medium text-gray-500">Loading Records...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <History size={40} className="text-gray-300" />
                        <span className="text-sm font-medium text-gray-500">No Direct Referrals Found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((record, index) => (
                  <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                    
                    {/* 🔥 Sr. No. Value */}
                    <td className="px-4 py-3 text-sm text-gray-500 font-medium whitespace-nowrap">
                      {indexOfFirst + index + 1}
                    </td>

                    {/* Date Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">
                                {new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-gray-500 font-medium mt-0.5">
                                {new Date(record.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </td>

                    {/* From User Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-1.5 rounded-md">
                            <ArrowDownLeft size={14} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-blue-700">
                            ID: {record.fromUserId || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Description Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-600">
                            {record.description || "Direct referral bonus"}
                        </span>
                    </td>

                    {/* Amount Column */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                        <span className="text-sm font-bold">
                          +${Number(record.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📑 PAGINATION CONTROLS */}
      {!loading && filteredHistory.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 1} 
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <span className="text-sm font-medium text-gray-600">
            Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredHistory.length)} of {filteredHistory.length}
          </span>
          
          <button 
            onClick={handleNext} 
            disabled={currentPage === totalPages} 
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default DirectIncomeHistory;