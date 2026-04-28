import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, Search, Loader2, ArrowLeft, ZoomIn, Briefcase, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// 🟢 Advanced Node Component
const TreeNode = ({ node, role, onNavigate }) => {
  if (!node) {
    return (
      <div className="flex flex-col items-center mx-1 md:mx-2 opacity-30">
        <div className="w-14 h-14 md:w-20 md:h-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[9px] text-slate-400 font-bold uppercase">
          Empty
        </div>
        <span className="text-[8px] text-slate-400 mt-1 uppercase font-black tracking-widest">{role}</span>
      </div>
    );
  }

  // Active / Inactive Styling
  const isActive = node.isActive;
  const cardBg = isActive ? 'bg-white border-indigo-200 shadow-indigo-100/50' : 'bg-slate-50 border-slate-200';
  const iconBg = isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500';
  const badgeColor = isActive ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-200 text-slate-500 border-slate-300';

  return (
    <div className="flex flex-col items-center mx-1 md:mx-2 relative group w-24 md:w-28">
      {/* 🟢 CARD MAIN BODY */}
      <div 
        onClick={() => onNavigate(node.userId)}
        className={`w-full rounded-2xl shadow-md border-2 flex flex-col items-center p-2 md:p-3 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl z-10 ${cardBg}`}
      >
        {/* User Icon & ID */}
        <div className={`p-1.5 md:p-2 rounded-full mb-1.5 ${iconBg}`}>
           <User size={20} fill={isActive ? "currentColor" : "none"} />
        </div>
        <span className="text-[9px] md:text-[10px] font-black text-slate-800 tracking-wide mb-0.5">ID: {node.userId}</span>
        <span className="text-[8px] md:text-[9px] font-bold text-slate-500 truncate w-full text-center capitalize mb-1">{node.name}</span>

        {/* 🟢 Package Badge */}
        <div className={`w-full text-center py-0.5 rounded text-[8px] font-black uppercase tracking-wider border shadow-sm ${badgeColor}`}>
          {isActive ? `$${node.currentPackage || 0} Pack` : 'Inactive'}
        </div>

        {/* 🟢 MLM Business Data (Left/Right Volume) */}
        {node.carryForward && (
           <div className="w-full flex justify-between mt-2 pt-2 border-t border-slate-100/50">
              <div className="flex flex-col items-center w-1/2 border-r border-slate-100">
                 <span className="text-[7px] text-slate-400 font-bold uppercase">Left</span>
                 <span className="text-[8px] font-black text-emerald-600">${node.totalLeftBusiness || 0}</span>
              </div>
              <div className="flex flex-col items-center w-1/2">
                 <span className="text-[7px] text-slate-400 font-bold uppercase">Right</span>
                 <span className="text-[8px] font-black text-emerald-600">${node.totalRightBusiness || 0}</span>
              </div>
           </div>
        )}
      </div>

      {/* Role Label */}
      <div className="mt-1 flex flex-col items-center">
         <ChevronDown size={12} className="text-slate-300 -mb-1" />
         <span className="text-[8px] font-black text-slate-400 tracking-widest uppercase">{role}</span>
      </div>
    </div>
  );
};

const NetworkTree = () => {
  const { user, token } = useAuth();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [searchId, setSearchId] = useState('');

  const fetchTree = useCallback(async (targetId) => {
    if (!targetId || !token) return; 
    try {
      setLoading(true);
      // 🟢 FIX: Wapas wahi path laga diya jo pehle properly chal raha tha
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
      <div className="max-w-[1200px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 border border-indigo-100">
                <Briefcase size={24} />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Genealogy Tree</h2>
                <p className="text-xs font-bold text-gray-400 mt-0.5">Explore your binary network downline</p>
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
                <button onClick={() => { setHistory([]); fetchTree(user?.userId); }} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
                    My Root
                </button>
            </div>
        </div>
      </div>

      {/* 🌳 4-Level Detailed Tree View */}
      {treeData ? (
        <div className="w-full overflow-x-auto pb-40 pt-5 custom-scroll bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="min-w-[1400px] flex flex-col items-center py-10">
            
            {/* Level 1 */}
            <div className="mb-16"><TreeNode node={treeData} role="ROOT" onNavigate={handleNavigate} /></div>

            {/* Level 2 */}
            <div className="flex justify-center gap-80 mb-16 relative">
               <div className="absolute top-[-40px] left-1/4 right-1/4 h-px bg-slate-200"></div>
               <TreeNode node={treeData?.left} role="LEFT" onNavigate={handleNavigate} />
               <TreeNode node={treeData?.right} role="RIGHT" onNavigate={handleNavigate} />
            </div>

            {/* Level 3 */}
            <div className="flex justify-center gap-24 mb-16">
               <div className="flex gap-32">
                  <TreeNode node={treeData?.left?.left} role="L" onNavigate={handleNavigate} />
                  <TreeNode node={treeData?.left?.right} role="R" onNavigate={handleNavigate} />
               </div>
               <div className="flex gap-32">
                  <TreeNode node={treeData?.right?.left} role="L" onNavigate={handleNavigate} />
                  <TreeNode node={treeData?.right?.right} role="R" onNavigate={handleNavigate} />
               </div>
            </div>

            {/* Level 4 */}
            <div className="flex justify-center gap-4">
               <div className="flex gap-8 border-r border-slate-100 pr-8">
                  <TreeNode node={treeData?.left?.left?.left} role="L" onNavigate={handleNavigate} />
                  <TreeNode node={treeData?.left?.left?.right} role="R" onNavigate={handleNavigate} />
               </div>
               <div className="flex gap-8 border-r border-slate-100 pr-8">
                  <TreeNode node={treeData?.left?.right?.left} role="L" onNavigate={handleNavigate} />
                  <TreeNode node={treeData?.left?.right?.right} role="R" onNavigate={handleNavigate} />
               </div>
               <div className="flex gap-8 border-r border-slate-100 pr-8">
                  <TreeNode node={treeData?.right?.left?.left} role="L" onNavigate={handleNavigate} />
                  <TreeNode node={treeData?.right?.left?.right} role="R" onNavigate={handleNavigate} />
               </div>
               <div className="flex gap-8">
                  <TreeNode node={treeData?.right?.right?.left} role="L" onNavigate={handleNavigate} />
                  <TreeNode node={treeData?.right?.right?.right} role="R" onNavigate={handleNavigate} />
               </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="text-center text-slate-500 font-bold mt-20">Data Not Found</div>
      )}
    </div>
  );
};

export default NetworkTree;