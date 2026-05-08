import React, { useState, useEffect, useMemo } from 'react';
import api from "../../api/axios"; 
import { ArrowDownToLine, Search, Loader2, Link as LinkIcon, CheckCircle2, Clock, XCircle, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const DepositHistory = () => {
  const { user, token } = useAuth(); 
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchHistory = async () => {
      const currentUser = user || JSON.parse(localStorage.getItem("user"));
      const currentToken = token || localStorage.getItem("token");

      if (!currentUser?.userId) return;

      try {
        setLoading(true);
        const res = await api.get(`/user/deposit-history/${currentUser.userId}`, {
            headers: { Authorization: `Bearer ${currentToken}` }
        });
        
        // 🟢 FIX: Backend ka response safe tareeqe se handle kiya
        let data = [];
        if (Array.isArray(res.data)) {
            data = res.data;
        } else if (res.data && Array.isArray(res.data.history)) {
            data = res.data.history;
        } else if (res.data && Array.isArray(res.data.data)) {
            data = res.data.data;
        }

        // Sorting: Newest first
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setHistory(sortedData);
        setError("");
      } catch (err) { 
        console.error("Deposit History Error:", err); 
        setError("Failed to fetch deposit records.");
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchHistory();
  }, [user?.userId, token]);

  // 🔥 Smart Search Logic
  const filteredHistory = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return history.filter(item => 
      item.txHash?.toLowerCase().includes(s) || 
      item.amount?.toString().includes(s) ||
      item.status?.toLowerCase().includes(s)
    );
  }, [history, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filteredHistory.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredHistory.length / entriesPerPage) || 1;

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // 🟢 Compact Status Badge
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const baseClass = "px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 w-fit shadow-sm border";
    
    if (s === 'completed' || s === 'success') {
        return <span className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-200`}><CheckCircle2 size={14}/> SUCCESS</span>;
    }
    if (s === 'pending') {
        return <span className={`${baseClass} bg-amber-50 text-amber-700 border-amber-200`}><Clock size={14}/> PENDING</span>;
    }
    return <span className={`${baseClass} bg-red-50 text-red-700 border-red-200`}><XCircle size={14}/> FAILED</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-screen">
      
      {/* 🔵 HEADER SECTION (Responsive & Clean) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
            <ArrowDownToLine size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Deposit Logs</h2>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Your Blockchain Deposit History</p>
          </div>
        </div>
        
        <div className="bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-100 w-full sm:w-auto text-left sm:text-right">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Total Succeeded</p>
            <p className="text-2xl font-black text-emerald-700">
              ${history.filter(h => h.status?.toLowerCase() === 'completed' || h.status?.toLowerCase() === 'success').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toFixed(2)}
            </p>
        </div>
      </div>

      {/* 🔍 FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by TxHash, Amount or Status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-700 transition-all"
          />
        </div>
        <select
          value={entriesPerPage}
          onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-medium outline-none cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
        </select>
      </div>

      {/* 📋 MAIN TABLE (Responsive Scroll) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center gap-3">
             <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
             <p className="font-medium text-gray-500 text-sm">Loading records...</p>
          </div>
        ) : error ? (
            <div className="p-16 text-center flex flex-col items-center gap-2">
                <AlertCircle size={36} className="text-red-400" />
                <p className="text-sm font-semibold text-gray-600">{error}</p>
            </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date & Time</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Transaction Hash</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Method</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap text-right">Value</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                            <FileText size={40} className="opacity-50" />
                            <span className="font-medium text-sm">No Deposit Records Found</span>
                        </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                           <span className="font-semibold text-gray-800 text-sm">{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                           <span className="text-xs font-medium text-gray-500">{new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.txHash ? (
                          <div className="flex items-center gap-1.5 group">
                             <a 
                               href={`https://bscscan.com/tx/${item.txHash}`} 
                               target="_blank" rel="noreferrer"
                               className="font-mono text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors bg-blue-50 px-2 py-1 rounded-md border border-blue-100"
                             >
                               {`${item.txHash.substring(0, 8)}...${item.txHash.slice(-8)}`}
                             </a>
                             <LinkIcon size={14} className="text-gray-400 group-hover:text-blue-500" />
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Internal</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                            {item.txHash ? 'USDT (BEP-20)' : 'Manual Admin'}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span className="font-bold text-base text-gray-900">
                          ${Number(item.amount).toFixed(2)}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                         <div className="flex justify-center">
                            {getStatusBadge(item.status || 'success')}
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📑 PAGINATION */}
      {!loading && filteredHistory.length > entriesPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 1} 
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <span className="text-sm font-medium text-gray-600">
            Page {currentPage} of {totalPages}
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

export default DepositHistory;