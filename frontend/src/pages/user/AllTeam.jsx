import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Search, Layers, MessageCircle, TrendingUp, Loader2, Users } from 'lucide-react';
// 🟢 FIX 1: useAuth import kiya
import { useAuth } from '../../context/AuthContext'; 

const AllTeam = () => {
  // 🟢 FIX 2: Props hata kar Context se data aur token nikala
  const { user, token } = useAuth(); 

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchAllTeam = async () => {
      // 🎯 7-Digit Numeric ID Check
      if (!user?.userId) return;

      try {
        setLoading(true);
        // ✅ Token bhej rahe hain security ke liye
        const res = await axios.post('/api/user/my-team', {
          userId: user.userId,
          type: 'all' 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMembers(Array.isArray(res.data) ? res.data : []);
      } catch (err) { 
        console.error("Downline loading error:", err); 
      } finally { 
        setLoading(false); 
      }
    };

    fetchAllTeam();
  }, [user?.userId, token]);

  // 🔥 SEARCH LOGIC: Optimized for large arrays
  const filteredMembers = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return members.filter(m => 
      m.name?.toLowerCase().includes(s) || 
      m.userId?.toString().includes(s) ||
      m.sponsorId?.toString().includes(s) ||
      m.mobile?.toString().includes(s)
    );
  }, [members, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // 📊 PAGINATION LOGIC
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filteredMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMembers.length / entriesPerPage) || 1;

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Stats Calculation
  const activeCount = members.filter(m => m.isActive).length;
  const totalBusiness = members.reduce((sum, m) => sum + (m.currentPackage || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 font-sans pb-20 animate-in fade-in duration-700">
      
      {/* 🔵 TOP PREMIUM HEADER */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden mb-10 border-b-4 border-indigo-500/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                <Layers className="text-purple-300" size={32} />
            </div>
            <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Network Downline</h2>
                <p className="text-indigo-200 font-bold text-[10px] tracking-[0.2em] uppercase opacity-70">Total Binary Hierarchy</p>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-white/10 shadow-inner">
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300 block mb-1">Downline Worth</span>
             <span className="text-3xl font-black text-yellow-400">${totalBusiness.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-2xl"><Users className="text-blue-300" size={24}/></div>
            <div>
                <p className="text-[10px] font-black uppercase opacity-50 tracking-widest">Total Team</p>
                <h3 className="text-2xl font-black">{members.length} Members</h3>
            </div>
          </div>
          <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex items-center gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-2xl"><CheckCircle className="text-emerald-300" size={24}/></div>
            <div>
                <p className="text-[10px] font-black uppercase opacity-50 tracking-widest">Active IDs</p>
                <h3 className="text-2xl font-black text-emerald-400">{activeCount} Paid</h3>
            </div>
          </div>
          <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex items-center gap-4">
            <div className="bg-purple-500/20 p-3 rounded-2xl"><TrendingUp className="text-purple-300" size={24}/></div>
            <div>
                <p className="text-[10px] font-black uppercase opacity-50 tracking-widest">Today's Growth</p>
                <h3 className="text-2xl font-black text-purple-300">
                    +{members.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length}
                </h3>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Find member by Name, ID, Sponsor ID or Mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300"
          />
        </div>
        <select
          value={entriesPerPage}
          onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="px-8 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm font-black text-[10px] uppercase tracking-[0.2em] outline-none cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>
      </div>

      {/* 📋 TABLE AREA */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-indigo-100/20 border border-gray-50 overflow-hidden">
        {loading ? (
          <div className="p-32 text-center flex flex-col items-center gap-4">
             <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
             <p className="font-black text-gray-400 uppercase tracking-[0.3em] text-[10px]">Mapping Downline Hierarchy...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-50/50">
                  <th className="p-6 text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] border-b border-indigo-100/50">#</th>
                  <th className="p-6 text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] border-b border-indigo-100/50">Member Identity</th>
                  <th className="p-6 text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] border-b border-indigo-100/50 text-center">Referrer</th>
                  <th className="p-6 text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] border-b border-indigo-100/50 text-center">Binary Side</th>
                  <th className="p-6 text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] border-b border-indigo-100/50 text-center">Activation</th>
                  <th className="p-6 text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] border-b border-indigo-100/50 text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-32 text-center font-black text-gray-200 uppercase tracking-[0.5em] text-sm">Hierarchy is Empty</td>
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
                          <span className="text-[10px] font-black text-indigo-500 mt-1.5 flex items-center gap-2">
                             <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">ID: {member.userId}</span>
                          </span>
                          <a href={`https://wa.me/${member.mobile}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 mt-2 text-emerald-600 hover:text-emerald-700 transition-colors">
                             <MessageCircle size={12} className="fill-emerald-50" /> 
                             <span className="text-[9px] font-black uppercase tracking-tighter">Support Chat</span>
                          </a>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-tighter border border-gray-200">
                          Sponsor: {member.sponsorId || 'System'}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black tracking-[0.2em] border ${member.position === 'LEFT' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                          {member.position}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex flex-col items-center">
                            <span className={`text-xs font-black ${member.isActive ? 'text-gray-800' : 'text-gray-300'}`}>
                            {member.isActive ? `$${member.currentPackage}` : 'Inactive'}
                            </span>
                            {member.isActive && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-10 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 1} 
            className="w-full sm:w-auto px-10 py-4 rounded-[1.5rem] bg-gray-900 text-white disabled:bg-gray-100 disabled:text-gray-300 font-black text-[10px] tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            ← PREV PAGE
          </button>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
            Page {currentPage} / {totalPages}
          </span>
          <button 
            onClick={handleNext} 
            disabled={currentPage === totalPages} 
            className="w-full sm:w-auto px-10 py-4 rounded-[1.5rem] bg-gray-900 text-white disabled:bg-gray-100 disabled:text-gray-300 font-black text-[10px] tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            NEXT STEP →
          </button>
        </div>
      )}
    </div>
  );
}

export default AllTeam;