import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Search, MessageCircle } from 'lucide-react';

function DirectTeam({ user }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchDirects = async () => {
      try {
        // ✅ Naya Endpoint: Humne backend me /api/user register kiya hai
        // Note: Agar aapne index.js me /api/users rakha hai to wahi rehne de
        const res = await axios.post('http://localhost:5000/api/user/my-team', {
          userId: user.userId, // 7-digit ID bhejna hai
          type: 'direct' 
        });

        // Backend se array directly aa raha hai
        setMembers(Array.isArray(res.data) ? res.data : []);
      } catch (err) { 
        console.error("Direct team load karne me galti hui", err); 
      } finally { 
        setLoading(false); 
      }
    };
    
    if (user?.userId) fetchDirects();
  }, [user]);

  // 🔥 SEARCH LOGIC
  const filteredMembers = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return members.filter(m => 
      m.name?.toLowerCase().includes(s) || 
      m.userId?.toString().includes(s) ||
      m.mobile?.toString().includes(s)
    );
  }, [members, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // 🔥 PAGINATION LOGIC
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filteredMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMembers.length / entriesPerPage) || 1;

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 font-sans bg-white/50 rounded-3xl mt-4">
      
      <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-8 text-center uppercase tracking-[0.2em]">
        👥 My Direct Referrals
      </h2>

      {/* 🟢 STATS */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-6 text-center shadow-xl shadow-blue-100">
          <h3 className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Total Directs</h3>
          <p className="text-4xl font-black text-white mt-1">{members.length}</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 p-6 text-center shadow-sm">
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Active Now</h3>
          <p className="text-4xl font-black text-emerald-500 mt-1">
            {members.filter(m => m.isActive).length}
          </p>
        </div>
      </div>

      {/* 🟢 SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700"
          />
        </div>
        <select
          value={entriesPerPage}
          onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm font-black text-xs uppercase tracking-widest outline-none"
        >
          <option value={10}>10 Rows</option>
          <option value={25}>25 Rows</option>
          <option value={50}>50 Rows</option>
        </select>
      </div>

      {/* 🟢 TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Loading Team...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">#</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Member Details</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">Side</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">Plan</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">Task</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center font-black text-gray-300 uppercase tracking-[0.3em]">No Data Found</td>
                  </tr>
                ) : (
                  currentItems.map((member, index) => (
                    <tr key={member._id || index} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="p-5 text-xs font-bold text-gray-300 group-hover:text-indigo-400">
                        {indexOfFirst + index + 1}
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm uppercase leading-tight">{member.name}</span>
                          <span className="text-[10px] font-bold text-indigo-500 font-mono mt-1">ID: {member.userId}</span>
                          <a href={`https://wa.me/${member.mobile}`} target="_blank" className="flex items-center gap-1 mt-1 text-emerald-500 hover:underline">
                            <MessageCircle size={10} /> <span className="text-[10px] font-black">{member.mobile}</span>
                          </a>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest ${member.position === 'LEFT' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {member.position}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`text-xs font-black ${member.isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                          {member.isActive ? `$${member.currentPackage}` : '---'}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center">
                           {member.taskCompletedToday ? (
                             <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[9px] font-black flex items-center gap-1">
                               <CheckCircle size={10} /> DONE
                             </span>
                           ) : (
                             <span className="bg-red-50 text-red-500 px-2 py-1 rounded-md text-[9px] font-black flex items-center gap-1">
                               <Clock size={10} /> PENDING
                             </span>
                           )}
                        </div>
                      </td>
                      <td className="p-5 text-right font-bold text-gray-400 text-xs">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB') : '-'}
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
        <div className="flex justify-between items-center mt-8">
          <button onClick={handlePrev} disabled={currentPage === 1} className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm disabled:opacity-30 font-black text-[10px] tracking-widest">← PREV</button>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
          <button onClick={handleNext} disabled={currentPage === totalPages} className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm disabled:opacity-30 font-black text-[10px] tracking-widest">NEXT →</button>
        </div>
      )}
    </div>
  );
}

export default DirectTeam;