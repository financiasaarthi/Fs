import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { User, Search, Loader2, ArrowLeft, Briefcase, Table as TableIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NetworkTreeTable = () => {
  const { user, token } = useAuth();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [searchId, setSearchId] = useState('');

  const fetchTree = useCallback(async (targetId) => {
    if (!targetId || !token) return; 
    try {
      setLoading(true);
      const res = await axios.get(`/api/network/tree/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTreeData(res.data.tree);
    } catch (error) {
      console.error("Tree data fetch error:", error);
      if(error.response?.status === 404) alert("User ID not found in Network!");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.userId && token) {
      fetchTree(user.userId);
    } else {
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [user?.userId, token, fetchTree]);

  const handleNavigate = (id) => {
    if (!id || id === treeData?.userId) return;
    setHistory(prev => [...prev, treeData.userId]);
    fetchTree(id);
  };

  const handleBack = () => {
    const newHistory = [...history];
    const prevId = newHistory.pop();
    setHistory(newHistory);
    fetchTree(prevId || user.userId);
  };

  // 🟢 Helper Function: Nested Tree ko flat Array/Table row me convert karne ke liye
  const flattenedData = useMemo(() => {
    if (!treeData) return [];
    const result = [];
    
    const flatten = (node) => {
      if (!node) return;
      
      // Push current node to flat array
      result.push({
        userId: node.userId,
        name: node.name,
        isActive: node.isActive,
        package: node.currentPackage || 0,
        leftVol: node.totalLeftBusiness || 0,
        rightVol: node.totalRightBusiness || 0,
        // Pointers (Child IDs)
        leftPointer: node.left?.userId || null,
        rightPointer: node.right?.userId || null,
      });

      // Recursively process left and right children
      if (node.left) flatten(node.left);
      if (node.right) flatten(node.right);
    };

    flatten(treeData);
    return result;
  }, [treeData]);

  if (loading && !treeData) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
              <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Network...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-2 md:p-6 select-none font-sans">
      
      {/* 🔵 Header Section */}
      <div className="max-w-[1000px] mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 border border-indigo-100">
                <TableIcon size={24} />
            </div>
            <div>
                <h2 className="text-lg md:text-xl font-black text-gray-800 uppercase tracking-tight">Genealogy Table</h2>
                <p className="text-[11px] md:text-xs font-bold text-gray-400 mt-0.5">Pointer based tree representation</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleNavigate(searchId); setSearchId(''); }} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search User ID..." 
                    value={searchId} 
                    onChange={(e) => setSearchId(e.target.value)} 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                />
            </form>
            <div className="flex gap-2">
                {history.length > 0 && (
                    <button onClick={handleBack} className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 transition hover:bg-gray-50 hover:text-indigo-600 font-bold text-sm shadow-sm">
                        <ArrowLeft size={16} className="mr-1" /> Back
                    </button>
                )}
                <button onClick={() => { setHistory([]); fetchTree(user?.userId); }} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all whitespace-nowrap">
                    My Root
                </button>
            </div>
        </div>
      </div>

      {/* 📊 Data Table View (Mobile Responsive) */}
      {treeData && flattenedData.length > 0 ? (
        <div className="max-w-[1000px] mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* overflow-x-auto ensure karta hai ki mobile pe table scroll ho, bahar na nikle */}
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full min-w-[700px] text-left border-collapse">
              
              {/* Table Head (Like Image) */}
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="py-4 px-4 text-center font-black uppercase tracking-wider text-xs border-r border-indigo-500 w-1/5">Left Pointer</th>
                  <th className="py-4 px-4 text-center font-black uppercase tracking-wider text-xs border-r border-indigo-500 w-1/4">Data (User Details)</th>
                  <th className="py-4 px-4 text-center font-black uppercase tracking-wider text-xs w-1/5">Right Pointer</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="text-slate-700">
                {flattenedData.map((row, index) => (
                  <tr key={index} className={`border-b border-gray-100 hover:bg-indigo-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    
                    {/* LEFT POINTER */}
                    <td className="py-3 px-4 text-center border-r border-gray-100 align-middle">
                      {row.leftPointer ? (
                        <button 
                          onClick={() => handleNavigate(row.leftPointer)}
                          className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-indigo-100 transition shadow-sm border border-indigo-100"
                        >
                          {row.leftPointer}
                        </button>
                      ) : (
                        <span className="text-xs font-black text-slate-300">0 (NULL)</span>
                      )}
                    </td>

                    {/* DATA (User Info) */}
                    <td className="py-4 px-4 border-r border-gray-100 align-middle">
                      <div className="flex items-center justify-center gap-8">
                        <div className={`p-2 rounded-full hidden sm:block ${row.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                          <User size={18} fill={row.isActive ? "currentColor" : "none"} />
                        </div>
                        <div className="flex flex-col text-center sm:text-left">
                          <span className="text-sm font-black text-slate-800">{row.userId}</span>
                          <span className="text-xs font-bold text-slate-500 capitalize">{row.name}</span>
                          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                              {row.isActive ? `$${row.package} Pack` : 'Inactive'}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400">
                              Vol: L(${row.leftVol}) R(${row.rightVol})
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* RIGHT POINTER */}
                    <td className="py-3 px-4 text-center align-middle">
                      {row.rightPointer ? (
                        <button 
                          onClick={() => handleNavigate(row.rightPointer)}
                          className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-indigo-100 transition shadow-sm border border-indigo-100"
                        >
                          {row.rightPointer}
                        </button>
                      ) : (
                        <span className="text-xs font-black text-slate-300">0 (NULL)</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-500 font-bold mt-20">Data Not Found</div>
      )}
    </div>
  );
};

export default NetworkTreeTable;