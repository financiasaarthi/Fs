import React, { useState, useEffect, useMemo } from 'react';
// 🟢 Raw axios ki jagah apne custom 'api' instance ko use karo
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
      // 🟢 Logic: Agar context se user na mile toh localStorage se try karo
      const currentUser = user || JSON.parse(localStorage.getItem("user"));
      const currentToken = token || localStorage.getItem("token");

      if (!currentUser?.userId) return;

      try {
        setLoading(true);
        // 🟢 Path singular 'user' rakha hai consistency ke liye
        const res = await api.get(`/user/deposit-history/${currentUser.userId}`, {
            headers: { Authorization: `Bearer ${currentToken}` }
        });
        
        // Sorting: Newest first
        const data = Array.isArray(res.data) ? res.data : [];
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setHistory(sortedData);
        setError("");
      } catch (err) { 
        console.error("Deposit History Error:", err); 
        setError("Failed to sync blockchain records.");
      } finally { 
        setLoading(false); // 🟢 Spinner stop protection
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

  // 🟢 Enhanced Status Badge (Handling both lower/upper case)
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const baseClass = "px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest flex items-center justify-center gap-1 w-fit ml-auto shadow-sm border";
    
    if (s === 'completed' || s === 'success') {
        return <span className={`${baseClass} bg-emerald-50 text-emerald-600 border-emerald-200/50`}><CheckCircle2 size={12}/> SUCCESS</span>;
    }
    if (s === 'pending') {
        return <span className={`${baseClass} bg-amber-50 text-amber-600 border-amber-200/50`}><Clock size={12}/> PENDING</span>;
    }
    return <span className={`${baseClass} bg-red-50 text-red-600 border-red-200/50`}><XCircle size={12}/> FAILED</span>;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 font-sans animate-in fade-in duration-700">
      
      {/* 🔵 HEADER SECTION */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <ArrowDownToLine size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Deposit Logs</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Blockchain Transaction History</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-gray-50/50 px-6 py-4 rounded-3xl border border-gray-100">
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Succeeded</p>
              <p className="text-2xl font-black text-emerald-600">
                  ${history.filter(h => h.status?.toLowerCase() === 'completed' || h.status?.toLowerCase() === 'success').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toFixed(2)}
              </p>
           </div>
        </div>
      </div>

      {/* 🔍 FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
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

      {/* 📋 MAIN TABLE */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
        {loading ? (
          <div className="p-32 text-center flex flex-col items-center gap-4">
             <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
             <p className="font-black text-gray-400 uppercase tracking-[0.3em] text-[10px]">Syncing Blockchain Records...</p>
          </div>
        ) : error ? (
            <div className="p-32 text-center flex flex-col items-center gap-3">
                <AlertCircle size={40} className="text-rose-400" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{error}</p>
            </div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50/30">
                  <th className="p-7 text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] border-b border-emerald-100/50">Timestamp</th>
                  <th className="p-7 text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] border-b border-emerald-100/50">Transaction Hash</th>
                  <th className="p-7 text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] border-b border-emerald-100/50">Method</th>
                  <th className="p-7 text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] border-b border-emerald-100/50">Value</th>
                  <th className="p-7 text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] border-b border-emerald-100/50 text-right">Confirmation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-32 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                            <FileText size={48} />
                            <span className="font-black uppercase tracking-[0.4em] text-xs">No Records Found</span>
                        </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-emerald-50/20 transition-all group">
                      <td className="p-7">
                        <div className="flex flex-col">
                           <span className="font-bold text-gray-800 text-sm">{new Date(item.createdAt).toLocaleDateString()}</span>
                           <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">{new Date(item.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="p-7">
                        {item.txHash ? (
                          <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                             <a 
                               href={`https://bscscan.com/tx/${item.txHash}`} 
                               target="_blank" rel="noreferrer"
                               className="font-mono text-[11px] font-bold text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 px-3 py-1 rounded-lg border border-gray-100"
                             >
                               {`${item.txHash.substring(0, 10)}...${item.txHash.slice(-10)}`}
                             </a>
                             <LinkIcon size={12} className="text-gray-300 group-hover:text-blue-500" />
                          </div>
                        ) : (
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Internal Update</span>
                        )}
                      </td>
                      <td className="p-7">
                        <span className="font-black text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl uppercase tracking-[0.1em]">
                            {item.txHash ? 'USDT (BEP-20)' : 'Manual'}
                        </span>
                      </td>
                      <td className="p-7">
                        <span className="font-black text-xl text-emerald-600 tracking-tighter">
                          +${Number(item.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-7 text-right">
                         {getStatusBadge(item.status || 'success')}
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-12 bg-white p-7 rounded-[3rem] shadow-sm border border-gray-100">
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 1} 
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-slate-900 text-white disabled:bg-gray-100 disabled:text-gray-300 font-black text-[10px] tracking-[0.2em] hover:bg-black transition-all active:scale-95"
          >
            ← PREVIOUS
          </button>
          <div className="flex items-center gap-4">
             {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
               <button key={i} onClick={() => setCurrentPage(i+1)} className={`w-8 h-8 rounded-full text-[10px] font-black ${currentPage === i+1 ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                 {i+1}
               </button>
             ))}
          </div>
          <button 
            onClick={handleNext} 
            disabled={currentPage === totalPages} 
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-slate-900 text-white disabled:bg-gray-100 disabled:text-gray-300 font-black text-[10px] tracking-[0.2em] hover:bg-black transition-all active:scale-95"
          >
            NEXT PAGE →
          </button>
        </div>
      )}
    </div>
  );
};

export default DepositHistory;