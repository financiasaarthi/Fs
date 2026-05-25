import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Search, Layers, MessageCircle, TrendingUp, Loader2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const LeftTeam = () => {
  const { user, token } = useAuth(); 

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchLeftTeam = async () => {
      if (!user?.userId) return;

      try {
        setLoading(true);
        // 🟢 FIX: Yahan type 'left' bhej rahe hain
        const res = await axios.post('/api/user/my-team', {
          userId: user.userId,
          type: 'left' 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMembers(Array.isArray(res.data) ? res.data : []);
      } catch (err) { 
        console.error("Left Downline loading error:", err); 
      } finally { 
        setLoading(false); 
      }
    };

    fetchLeftTeam();
  }, [user?.userId, token]);

  // 🔥 SEARCH LOGIC
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
  const totalBusiness = members.reduce((sum, m) => sum + (Number(m.currentPackage) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans min-h-screen">
      
      {/* 🔵 BLUE THEME HEADER FOR LEFT TEAM */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6 sm:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden mb-8 border-b-4 border-blue-400/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 sm:p-4 rounded-xl backdrop-blur-md border border-white/10">
                <Layers className="text-blue-300 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">Left Downline</h2>
                <p className="text-blue-200 text-xs sm:text-sm font-medium uppercase mt-1">Your Left Team Network</p>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 w-full md:w-auto text-center md:text-left">
             <span className="text-xs font-semibold uppercase text-blue-300 block mb-1">Left Business</span>
             <span className="text-2xl sm:text-3xl font-bold text-yellow-400">${totalBusiness.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 relative z-10">
          <div className="bg-white/10 p-4 sm:p-5 rounded-xl border border-white/10 flex items-center gap-4">
            <div className="bg-blue-500/30 p-2.5 rounded-lg"><Users className="text-blue-300" size={24}/></div>
            <div>
                <p className="text-xs font-medium uppercase text-blue-200">Left Team Count</p>
                <h3 className="text-xl font-bold">{members.length} Members</h3>
            </div>
          </div>
          <div className="bg-white/10 p-4 sm:p-5 rounded-xl border border-white/10 flex items-center gap-4">
            <div className="bg-emerald-500/30 p-2.5 rounded-lg"><CheckCircle className="text-emerald-300" size={24}/></div>
            <div>
                <p className="text-xs font-medium uppercase text-blue-200">Active IDs</p>
                <h3 className="text-xl font-bold text-emerald-400">{activeCount} Paid</h3>
            </div>
          </div>
          <div className="bg-white/10 p-4 sm:p-5 rounded-xl border border-white/10 flex items-center gap-4">
            <div className="bg-purple-500/30 p-2.5 rounded-lg"><TrendingUp className="text-purple-300" size={24}/></div>
            <div>
                <p className="text-xs font-medium uppercase text-blue-200">Today's Joins</p>
                <h3 className="text-xl font-bold text-purple-300">
                    +{members.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length}
                </h3>
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

      {/* 📋 TABLE AREA */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
             <p className="font-medium text-gray-500 text-sm">Mapping Left Downline...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">S.No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Mobile</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sponsor</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Active Plan</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Join Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500 text-sm font-medium">
                      No left team members found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((member, index) => (
                    <tr key={member._id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{indexOfFirst + index + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">{member.name || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">{member.userId || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {member.mobile ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{member.mobile}</span>
                            <a href={`https://wa.me/${member.mobile}`} target="_blank" rel="noreferrer" className="bg-emerald-100 p-1.5 rounded-full text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors shadow-sm" title="Chat on WhatsApp">
                              <MessageCircle size={14} /> 
                            </a>
                          </div>
                        ) : <span className="text-sm text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-200">{member.sponsorId || 'System'}</span>
                      </td>
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
          <button onClick={handlePrev} disabled={currentPage === 1} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            ← Previous
          </button>
          <span className="text-sm font-medium text-gray-600">
            Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredMembers.length)} of {filteredMembers.length}
          </span>
          <button onClick={handleNext} disabled={currentPage === totalPages} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default LeftTeam;