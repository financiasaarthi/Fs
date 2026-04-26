import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Search, MessageCircle, Users, Loader2 } from 'lucide-react';
// 🟢 FIX 1: useAuth import kiya
import { useAuth } from '../../context/AuthContext'; 

const DirectTeam = () => {
  // 🟢 FIX 2: Props hata kar Context se data nikala
  const { user, token } = useAuth(); 

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchDirects = async () => {
      // 🎯 7-Digit numeric userId logic
      if (!user?.userId) return;

      try {
        setLoading(true);
        // ✅ Token bhej rahe hain security ke liye
        const res = await axios.post('/api/user/my-team', {
          userId: user.userId, 
          type: 'direct' 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setMembers(Array.isArray(res.data) ? res.data : []);
      } catch (err) { 
        console.error("Direct team loading error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchDirects();
  }, [user?.userId, token]);

  // 🔥 SEARCH LOGIC (Optimized with useMemo)
  const filteredMembers = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return members.filter(m => 
      m.name?.toLowerCase().includes(s) || 
      m.userId?.toString().includes(s) ||
      m.mobile?.toString().includes(s)
    );
  }, [members, searchTerm]);

  // Reset pagination on search
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // 🔥 PAGINATION LOGIC
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filteredMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMembers.length / entriesPerPage) || 1;

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 font-sans bg-gray-50/30 min-h-screen animate-in fade-in duration-500">
      
      <div className="flex items-center justify-center gap-3 mb-10">
        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100">
          <Users size={28} />
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-gray-800 uppercase tracking-tight">
          Direct Referrals
        </h2>
      </div>

      {/* 📊 SUMMARY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-6 text-center shadow-xl shadow-indigo-100 relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-125 transition-transform"><Users size={80}/></div>
          <h3 className="text-blue-100 text-[10px] font-black uppercase tracking-widest relative z-10">Total Directs</h3>
          <p className="text-4xl font-black text-white mt-1 relative z-10">{members.length}</p>
        </div>
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 text-center shadow-sm group hover:border-emerald-200 transition-all">
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Active Plans</h3>
          <p className="text-4xl font-black text-emerald-500 mt-1">
            {members.filter(m => m.isActive).length}
          </p>
        </div>
        <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 p-6 text-center shadow-sm">
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Tasks Done</h3>
          <p className="text-4xl font-black text-indigo-600 mt-1">
            {members.filter(m => m.taskCompletedToday).length}
          </p>
        </div>
        <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 p-6 text-center shadow-sm">
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Today's New</h3>
          <p className="text-4xl font-black text-blue-500 mt-1">
            {members.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by Name, ID or Mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all"
          />
        </div>
        <select
          value={entriesPerPage}
          onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm font-black text-[10px] uppercase tracking-[0.2em] outline-none cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
        </select>
      </div>

      {/* 📋 TABLE AREA */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden">
        {loading ? (
          <div className="p-24 text-center flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Syncing Direct Team...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">S.No</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">Member Identity</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Tree Side</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Active Plan</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Task Status</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-24 text-center font-black text-gray-300 uppercase tracking-[0.4em] text-sm">Empty Referral List</td>
                  </tr>
                ) : (
                  currentItems.map((member, index) => (
                    <tr key={member._id || index} className="hover:bg-indigo-50/30 transition-all group">
                      <td className="p-6 text-xs font-black text-gray-300 group-hover:text-indigo-400">
                        {String(indexOfFirst + index + 1).padStart(2, '0')}
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm uppercase leading-tight tracking-tight">{member.name}</span>
                          <span className="text-[10px] font-black text-indigo-500 mt-1.5 flex items-center gap-1">
                            <span className="bg-indigo-50 px-2 py-0.5 rounded">ID: {member.userId}</span>
                          </span>
                          <a href={`https://wa.me/${member.mobile}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 mt-2 text-emerald-600 hover:text-emerald-700 transition-colors">
                            <MessageCircle size={12} className="fill-emerald-50" /> 
                            <span className="text-[10px] font-black tracking-tighter">WhatsApp Support</span>
                          </a>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black tracking-[0.2em] border ${member.position === 'LEFT' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                          {member.position}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        {member.isActive ? (
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-black text-gray-800">${member.currentPackage}</span>
                            <span className="text-[8px] font-black text-emerald-500 uppercase">Premium</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Plan</span>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center">
                           {member.taskCompletedToday ? (
                             <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-1.5 border border-emerald-100 shadow-sm">
                               <CheckCircle size={12} /> COMPLETED
                             </span>
                           ) : (
                             <span className="bg-red-50 text-red-500 px-3 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-1.5 border border-red-100">
                               <Clock size={12} /> PENDING
                             </span>
                           )}
                        </div>
                      </td>
                      <td className="p-6 text-right font-black text-gray-400 text-[10px] uppercase">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
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
      {!loading && filteredMembers.length > entriesPerPage && (
        <div className="flex justify-between items-center mt-10 px-4">
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 1} 
            className="px-6 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-20 font-black text-[10px] tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-95"
          >
            ← PREVIOUS
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Showing {indexOfFirst + 1} - {Math.min(indexOfLast, filteredMembers.length)} of {filteredMembers.length}
            </span>
          </div>
          <button 
            onClick={handleNext} 
            disabled={currentPage === totalPages} 
            className="px-6 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-20 font-black text-[10px] tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-95"
          >
            NEXT PAGE →
          </button>
        </div>
      )}
    </div>
  );
}

export default DirectTeam;