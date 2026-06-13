import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Search, MessageCircle, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const DirectTeam = () => {
  const { user, token } = useAuth(); 

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchDirects = async () => {
      if (!user?.userId) return;

      try {
        setLoading(true);
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

  // 🔥 SEARCH LOGIC
  const filteredMembers = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return members.filter(m => 
      m.name?.toLowerCase().includes(s) || 
      m.userId?.toString().includes(s) ||
      m.mobile?.toString().includes(s) ||
      m.email?.toLowerCase().includes(s)
    );
  }, [members, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // 🚀 OPTIMIZATION: Stats Calculation (Ab Tasks Done me unko ginega jinhone video dekhi hai)
  const { activeCount, tasksWorking, todayNew } = useMemo(() => {
    let active = 0;
    let tasks = 0;
    let today = 0;
    const todayStr = new Date().toDateString();

    members.forEach(m => {
      if (m.isActive) active++;
      // Agar ek bhi video dekha hai, toh Task Done list me aayega
      if ((m.dailyVideosWatched && m.dailyVideosWatched > 0) || m.taskCompletedToday) tasks++;
      if (m.createdAt && new Date(m.createdAt).toDateString() === todayStr) today++;
    });

    return { activeCount: active, tasksWorking: tasks, todayNew: today };
  }, [members]);

  // 🔥 PAGINATION LOGIC
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filteredMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMembers.length / entriesPerPage) || 1;

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // 🟢 Helper Function: Find Max Tasks based on ALL Active Packages (SUM)
  const getMaxTasks = (member) => {
      let totalTasks = 0;
      // Agar activePackages array hai, toh usko use karo, warna currentPackage ko list me daalo
      const pkgs = member.activePackages?.length > 0 ? member.activePackages : (member.currentPackage ? [member.currentPackage] : []);
      
      pkgs.forEach(pkg => {
          if (pkg === 10) totalTasks += 2;
          else if (pkg === 30) totalTasks += 6;
          else if (pkg === 50) totalTasks += 10;
          else if (pkg === 100) totalTasks += 20;
          else if (pkg === 500) totalTasks += 50;
      });

      return totalTasks;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="bg-indigo-600 p-2 sm:p-3 rounded-lg text-white shadow-sm">
          <Users size={24} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Direct Referrals
        </h2>
      </div>

      {/* 📊 SUMMARY STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-indigo-600 rounded-xl p-4 sm:p-5 text-white shadow-md">
          <h3 className="text-indigo-100 text-xs sm:text-sm font-semibold uppercase tracking-wider">Total Directs</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{members.length}</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-xs sm:text-sm font-semibold uppercase tracking-wider">Active Plans</h3>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1 sm:mt-2">
            {activeCount}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-xs sm:text-sm font-semibold uppercase tracking-wider">Members Working</h3>
          <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-1 sm:mt-2">
            {tasksWorking}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-xs sm:text-sm font-semibold uppercase tracking-wider">Today's New</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">
            {todayNew}
          </p>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Name, ID, Email or Mobile..."
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
        </select>
      </div>

      {/* 📋 TABLE AREA */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="font-medium text-gray-500 text-sm">Syncing Direct Team...</p>
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
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Tree Side</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Active Plan</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Task Progress</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Join Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-gray-500 text-sm font-medium">
                      No referrals found matching your search.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((member, index) => {
                    const maxTasks = getMaxTasks(member);
                    const watchedTasks = member.dailyVideosWatched || 0;
                    const isFullyDone = watchedTasks >= maxTasks && maxTasks > 0;

                    return (
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

                        {/* Mobile + WhatsApp Click */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {member.mobile ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800">{member.mobile}</span>
                              <a 
                                href={`https://wa.me/${member.mobile}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="bg-emerald-100 p-1.5 rounded-full text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors shadow-sm"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={14} /> 
                              </a>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>

                        {/* Tree Side */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${member.position === 'LEFT' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {member.position || "-"}
                          </span>
                        </td>

                        {/* Active Plan */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {member.isActive ? (
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-bold text-gray-900">${member.currentPackage || 0}</span>
                              {member.activePackages?.length > 1 && (
                                <span className="text-[9px] font-bold text-blue-600 uppercase bg-blue-100 px-1.5 py-0.5 rounded mt-0.5">+{member.activePackages.length - 1} More</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">No Plan</span>
                          )}
                        </td>

                        {/* 🔥 Task Progress (Exact Calculation) */}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                           {member.isActive ? (
                               <div className="flex flex-col items-center">
                                  <span className="text-xs font-black text-indigo-700">
                                      {watchedTasks} <span className="text-gray-400 font-medium">/ {maxTasks}</span>
                                  </span>
                                  {isFullyDone ? (
                                     <span className="text-[9px] font-bold text-emerald-600 uppercase bg-emerald-100 px-1.5 py-0.5 rounded mt-0.5">Done</span>
                                  ) : watchedTasks > 0 ? (
                                     <span className="text-[9px] font-bold text-blue-600 uppercase bg-blue-100 px-1.5 py-0.5 rounded mt-0.5">Working</span>
                                  ) : (
                                     <span className="text-[9px] font-bold text-orange-600 uppercase bg-orange-100 px-1.5 py-0.5 rounded mt-0.5">Pending</span>
                                  )}
                               </div>
                           ) : (
                               <span className="text-xs font-medium text-gray-400">-</span>
                           )}
                        </td>

                        {/* Join Date */}
                        <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-600">
                          {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📑 PAGINATION CONTROLS */}
      {!loading && filteredMembers.length > 0 && (
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

export default DirectTeam;