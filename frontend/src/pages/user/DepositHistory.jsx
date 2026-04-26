import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ArrowDownToLine, Search, Loader2, Link as LinkIcon, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
// 🟢 FIX 1: useAuth import kiya
import { useAuth } from '../../context/AuthContext'; 

const DepositHistory = () => {
  // 🟢 FIX 2: Context se data aur token nikala
  const { user, token } = useAuth(); 

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.userId || !token) return;

      try {
        setLoading(true);
        // API Call with Authentication Header
        const res = await axios.get(`/api/user/deposit-history/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Default sort by newest first
        const sortedData = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHistory(sortedData);
      } catch (err) { 
        console.error("Failed to load deposit history:", err); 
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

  // Reset pagination on search
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // 📊 Pagination Logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filteredHistory.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredHistory.length / entriesPerPage) || 1;

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Status Badge Renderer
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/50 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest flex items-center justify-center gap-1 w-fit ml-auto shadow-sm"><CheckCircle2 size={12}/> SUCCESS</span>;
      case 'pending':
        return <span className="bg-amber-50 text-amber-600 border border-amber-200/50 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest flex items-center justify-center gap-1 w-fit ml-auto shadow-sm"><Clock size={12}/> PENDING</span>;
      case 'failed':
        return <span className="bg-red-50 text-red-600 border border-red-200/50 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest flex items-center justify-center gap-1 w-fit ml-auto shadow-sm"><XCircle size={12}/> FAILED</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase ml-auto">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 font-sans animate-in fade-in duration-700">
      
      {/* 🔵 PREMIUM HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner border border-emerald-100">
            <ArrowDownToLine size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Deposit History</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Inbound USDT (BEP-20) Logs</p>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center gap-6 bg-gray-50/50 px-6 py-3 rounded-2xl border border-gray-100">
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Deposits</p>
              <p className="text-xl font-black text-emerald-600">
                  ${history.filter(h => h.status === 'completed' || h.status === 'success').reduce((acc, curr) => acc + (curr.amount || 0), 0).toFixed(2)}
              </p>
           </div>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by TxHash, Amount or Status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm text-gray-700 transition-all placeholder:text-gray-300"
          />
        </div>
        <select
          value={entriesPerPage}
          onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="px-8 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm font-black text-[10px] uppercase tracking-[0.2em] outline-none cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
        </select>
      </div>

      {/* 📋 TABLE AREA */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
        {loading ? (
          <div className="p-32 text-center flex flex-col items-center gap-4">
             <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
             <p className="font-black text-gray-400 uppercase tracking-[0.3em] text-[10px]">Syncing Blockchain Records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50/30">
                  <th className="p-6 text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] border-b border-emerald-100/50">Date & Time</th>
                  <th className="p-6 text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] border-b border-emerald-100/50">Transaction Hash</th>
                  <th className="p-6 text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] border-b border-emerald-100/50">Method</th>
                  <th className="p-6 text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] border-b border-emerald-100/50">Amount</th>
                  <th className="p-6 text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] border-b border-emerald-100/50 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-32 text-center flex flex-col items-center justify-center gap-3">
                        <FileText size={40} className="text-gray-200" />
                        <span className="font-black text-gray-300 uppercase tracking-[0.4em] text-xs">No Deposit Records Found</span>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-emerald-50/20 transition-all group">
                      
                      {/* Date */}
                      <td className="p-6">
                        <div className="flex flex-col">
                           <span className="font-bold text-gray-800 text-sm">
                             {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </span>
                           <span className="text-[10px] font-black text-gray-400 tracking-wider">
                             {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                      </td>

                      {/* Tx Hash */}
                      <td className="p-6">
                        {item.txHash ? (
                          <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors w-fit">
                             <div className="bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                               <LinkIcon size={12} className="text-gray-500" />
                             </div>
                             <a 
                               href={`https://bscscan.com/tx/${item.txHash}`} 
                               target="_blank" 
                               rel="noreferrer"
                               className="font-mono text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
                             >
                               {`${item.txHash.substring(0, 6)}...${item.txHash.substring(item.txHash.length - 6)}`}
                             </a>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">System / Manual</span>
                        )}
                      </td>

                      {/* Method */}
                      <td className="p-6">
                        <span className="font-black text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                            {item.txHash ? 'BEP-20 (USDT)' : 'Internal'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-6">
                        <span className="font-black text-lg text-emerald-600 tracking-tight">
                          +${Number(item.amount).toFixed(2)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-6 text-right">
                         {getStatusBadge(item.status || 'completed')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📑 PAGINATION CONTROLS */}
      {!loading && filteredHistory.length > entriesPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-10 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 1} 
            className="w-full sm:w-auto px-10 py-4 rounded-[1.5rem] bg-gray-900 text-white disabled:bg-gray-100 disabled:text-gray-300 font-black text-[10px] tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            ← PREVIOUS
          </button>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={handleNext} 
            disabled={currentPage === totalPages} 
            className="w-full sm:w-auto px-10 py-4 rounded-[1.5rem] bg-gray-900 text-white disabled:bg-gray-100 disabled:text-gray-300 font-black text-[10px] tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            NEXT PAGE →
          </button>
        </div>
      )}
    </div>
  );
};

export default DepositHistory;