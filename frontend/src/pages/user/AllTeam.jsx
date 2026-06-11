import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Search, Layers, MessageCircle, TrendingUp, Loader2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const AllTeam = () => {
  const { user, token } = useAuth(); 

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchAllTeam = async () => {
      if (!user?.userId) return;

      try {
        setLoading(true);
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

  // 🔥 HIGH-PERFORMANCE SEARCH LOGIC (Cached)
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members; // Agar search khali hai toh direct poori list bhejo (Fast)
    
    const s = searchTerm.toLowerCase();
    return members.filter(m => 
      m.name?.toLowerCase().includes(s) || 
      m.userId?.toString().includes(s) ||
      m.sponsorId?.toString().includes(s) ||
      m.mobile?.toString().includes(s)
    );
  }, [members, searchTerm]);

  // Reset pagination on search
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // 📊 PAGINATION LOGIC
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filteredMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMembers.length / entriesPerPage) || 1;

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // 🚀 OPTIMIZATION: Stats Calculation ab hang nahi karega (Memoized)
  const { activeCount, totalBusiness, todayGrowth } = useMemo(() => {
    let active = 0;
    let business = 0;
    let growth = 0;
    const todayStr = new Date().toDateString();

    members.forEach(m => {
      if (m.isActive) active++;
      business += (Number(m.currentPackage) || 0);
      if (new Date(m.createdAt).toDateString() === todayStr) growth++;
    });

    return { activeCount: active, totalBusiness: business, todayGrowth: growth };
  }, [members]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans min-h-screen">
      
      {/* 🔵 TOP PREMIUM HEADER */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-6 sm:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden mb-8 border-b-4 border-indigo-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 sm:p-4 rounded-xl backdrop-blur-md border border-white/10">
                <Layers className="text-purple-300 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">Network Downline</h2>
                <p className="text-indigo-200 text-xs sm:text-sm font-medium uppercase mt-1">Total Binary Hierarchy</p>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 w-full md:w-auto text-center md:text-left">
             <span className="text-xs font-semibold uppercase text-indigo-300 block mb-1">Downline Worth</span>
             <span className="text-2xl sm:text-3xl font-bold text-yellow-400">${totalBusiness.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 relative z-10">
          <div className="bg-white/10 p-4 sm:p-5 rounded-xl border border-white/10 flex items-center gap-4">
            <div className="bg-blue-500/30 p-2.5 rounded-lg"><Users className="text-blue-300" size={24}/></div>
            <div>
                <p className="text-xs font-medium uppercase text-indigo-200">Total Team</p>
                <h3 className="text-xl font-bold">{members.length} Members</h3>
            </div>
          </div>
          <div className="bg-white/10 p-4 sm:p-5 rounded-xl border border-white/10 flex items-center gap-4">
            <div className="bg-emerald-500/30 p-2.5 rounded-lg"><CheckCircle className="text-emerald-300" size={24}/></div>
            <div>
                <p className="text-xs font-medium uppercase text-indigo-200">Active IDs</p>
                <h3 className="text-xl font-bold text-emerald-400">{activeCount} Paid</h3>
            </div>
          </div>
          <div className="bg-white/10 p-4 sm:p-5 rounded-xl border border-white/10 flex items-center gap-4">
            <div className="bg-purple-500/30 p-2.5 rounded-lg"><TrendingUp className="text-purple-300" size={24}/></div>
            <div>
                <p className="text-xs font-medium uppercase text-indigo-200">Today's Growth</p>
                <h3 className="text-xl font-bold text-purple-300">+{todayGrowth}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Find by Name, ID, Sponsor ID or Mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm sm:text-base text-gray-700 transition-colors"
          />
        </div>
        <select
          value={entriesPerPage}
          onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium outline-none cursor-pointer hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-indigo-500"
        >
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>
      </div>

      {/* 📋 TABLE AREA */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
             <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
             <p className="font-medium text-gray-500 text-sm">Mapping Downline Hierarchy...</p>
             <p className="text-xs text-gray-400 mt-1">If team is huge, this might take a few seconds...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">S.No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">User ID</th>
                   <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sponsor</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Tree Side</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Active Plan</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Join Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500 text-sm font-medium">
                      No team members found in hierarchy.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((member, index) => (
                    <tr key={member._id || index} className="hover:bg-gray-50 transition-colors">
                      
                      {/* S.No */}
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {indexOfFirst + index + 1}
                      </td>
                      
                      {/* Name */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                        {member.name || "-"}
                      </td>

                      {/* User ID */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {member.userId || "-"}
                      </td>

                      {/* Sponsor */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-200">
                          {member.sponsorId || 'System'}
                        </span>
                      </td>

                      {/* Tree Side */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${member.position === 'LEFT' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {member.position || "-"}
                        </span>
                      </td>

                      {/* Active Plan / Activation */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                            <span className={`text-sm font-bold ${member.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                              {member.isActive ? `$${member.currentPackage || 0}` : 'Inactive'}
                            </span>
                            {member.isActive && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Paid</span>
                              </div>
                            )}
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-600">
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 1} 
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <span className="text-sm font-medium text-gray-600">
            Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredMembers.length)} of {filteredMembers.length}
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
}

export default AllTeam;