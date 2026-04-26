import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Search, Layers, MessageCircle, TrendingUp } from 'lucide-react';

function AllTeam({ user }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchAllTeam = async () => {
      try {
        // ✅ Endpoint Sync: Backend register /api/user se ho raha hai
        const res = await axios.post('/api/user/my-team', {
          userId: user.userId,
          type: 'all' // Backend aggregation logic use karega poore tree ke liye
        });
        
        setMembers(Array.isArray(res.data) ? res.data : []);
      } catch (err) { 
        console.error("Total downline load karne mein error aayi", err); 
      } finally { 
        setLoading(false); 
      }
    };
    if (user?.userId) fetchAllTeam();
  }, [user]);

  // 🔥 Smart Search with useMemo (Large teams ke liye optimized)
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

  // 🔥 Pagination Logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filteredMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMembers.length / entriesPerPage) || 1;

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Stats Calculation
  const totalBusiness = members.reduce((sum, m) => sum + (m.currentPackage || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 font-sans pb-20">
      
      {/* 🟢 TOP HEADER CARD (Premium Look) */}
      <div className="bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Layers className="text-purple-300" size={32} /> Total Downline
            </h2>
            <p className="text-indigo-200 mt-2 font-bold text-sm tracking-wide opacity-80">Managing your full binary tree network and hierarchy.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Network Worth</span>
             <span className="text-2xl font-black text-yellow-400">${totalBusiness.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-black/20 p-5 rounded-3xl border border-white/10">
            <p className="text-[10px] font-black uppercase opacity-60 mb-2">Team Size</p>
            <h3 className="text-3xl font-black flex items-center gap-2">{members.length} <span className="text-xs font-bold text-indigo-300">Total</span></h3>
          </div>
          <div className="bg-black/20 p-5 rounded-3xl border border-white/10">
            <p className="text-[10px] font-black uppercase opacity-60 mb-2">Active IDs</p>
            <h3 className="text-3xl font-black text-green-400">{members.filter(m => m.isActive).length} <span className="text-xs font-bold text-green-300/50">Live</span></h3>
          </div>
          <div className="bg-black/20 p-5 rounded-3xl border border-white/10">
            <p className="text-[10px] font-black uppercase opacity-60 mb-2">New Joinings</p>
            <h3 className="text-3xl font-black text-purple-300 flex items-center gap-2">
                <TrendingUp size={24} /> 
                {members.filter(m => {
                    const joinDate = new Date(m.createdAt);
                    const today = new Date();
                    return joinDate.toDateString() === today.toDateString();
                }).length}
            </h3>
          </div>
        </div>
      </div>

      {/* 🟢 SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by Name, ID, Sponsor or Mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-3xl shadow-sm focus:ring-4 focus:ring-purple-500/10 outline-none font-bold text-gray-700 transition-all"
          />
        </div>
        <select
          value={entriesPerPage}
          onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="px-8 py-4 bg-white border border-gray-100 rounded-3xl shadow-sm font-black text-xs uppercase tracking-widest outline-none cursor-pointer hover:bg-gray-50"
        >
          <option value={10}>10 Items</option>
          <option value={25}>25 Items</option>
          <option value={50}>50 Items</option>
          <option value={100}>100 Items</option>
        </select>
      </div>

      {/* 🟢 TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-24 text-center">
             <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="font-black text-gray-400 uppercase tracking-[0.2em] text-xs">Scanning Network Hierarchy...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50/50">
                  <th className="p-5 text-[10px] font-black text-purple-900/50 uppercase tracking-widest border-b border-purple-100/50">Index</th>
                  <th className="p-5 text-[10px] font-black text-purple-900/50 uppercase tracking-widest border-b border-purple-100/50">Network Member</th>
                  <th className="p-5 text-[10px] font-black text-purple-900/50 uppercase tracking-widest border-b border-purple-100/50 text-center">Referrer</th>
                  <th className="p-5 text-[10px] font-black text-purple-900/50 uppercase tracking-widest border-b border-purple-100/50 text-center">Position</th>
                  <th className="p-5 text-[10px] font-black text-purple-900/50 uppercase tracking-widest border-b border-purple-100/50 text-center">Status</th>
                  <th className="p-5 text-[10px] font-black text-purple-900/50 uppercase tracking-widest border-b border-purple-100/50 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-24 text-center font-black text-gray-300 uppercase tracking-[0.4em] text-sm">Tree is Empty</td>
                  </tr>
                ) : (
                  currentItems.map((member, index) => (
                    <tr key={member._id || index} className="hover:bg-purple-50/30 transition-all group">
                      <td className="p-5 text-xs font-bold text-gray-300 group-hover:text-purple-400">
                        {indexOfFirst + index + 1}
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm uppercase leading-tight">{member.name}</span>
                          <span className="text-[10px] font-bold text-purple-500 font-mono mt-1 flex items-center gap-1">ID: {member.userId}</span>
                          <div className="flex items-center gap-2 mt-1">
                             <a href={`https://wa.me/${member.mobile}`} target="_blank" className="text-emerald-500 hover:scale-110 transition-transform">
                                <MessageCircle size={14} fill="currentColor" fillOpacity={0.1} />
                             </a>
                             <span className="text-[10px] font-bold text-gray-400">{member.mobile || 'No Mobile'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
                          Sp: {member.sponsorId || 'System'}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest ${member.position === 'LEFT' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {member.position}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center">
                            <span className={`text-xs font-black ${member.isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                            {member.isActive ? `$${member.currentPackage}` : 'Inactive'}
                            </span>
                            {member.isActive && <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse mt-1"></div>}
                        </div>
                      </td>
                      <td className="p-5 text-right font-bold text-gray-400 text-xs">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🟢 PAGINATION */}
      {!loading && filteredMembers.length > entriesPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <button onClick={handlePrev} disabled={currentPage === 1} className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-30 font-black text-[10px] tracking-widest hover:bg-purple-600 hover:text-white transition-all">← PREVIOUS</button>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Page {currentPage} of {totalPages}</span>
          <button onClick={handleNext} disabled={currentPage === totalPages} className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm disabled:opacity-30 font-black text-[10px] tracking-widest hover:bg-purple-600 hover:text-white transition-all">NEXT STEP →</button>
        </div>
      )}
    </div>
  );
}

export default AllTeam;