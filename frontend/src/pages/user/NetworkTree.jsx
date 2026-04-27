import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, Activity, ShieldCheck, ChevronDown, Loader2, ArrowLeft, Maximize2, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// 🟢 Component: User Node with Drill-Down
const TreeNode = ({ node, role, onNavigate }) => {
  if (!node) {
    return (
      <div className="flex flex-col items-center mx-2 opacity-40">
        <div className="w-16 h-16 bg-slate-100 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[10px] text-slate-400 font-black uppercase">
          Empty
        </div>
        <span className="text-[8px] text-slate-400 mt-2 uppercase font-black tracking-tighter">{role}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mx-4 relative group">
      {/* 1. Main Node UI */}
      <div 
        onClick={() => onNavigate(node.userId)}
        className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] shadow-sm border-2 flex flex-col items-center justify-center p-1 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:-translate-y-2 ${node.isActive ? 'bg-white border-emerald-500' : 'bg-slate-50 border-slate-200'}`}
      >
        <div className={`p-2 rounded-2xl mb-1 ${node.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
           <User size={24} fill={node.isActive ? "currentColor" : "none"} />
        </div>
        <span className="text-[10px] md:text-xs font-black text-slate-800 leading-tight">{node.userId}</span>
        <span className="text-[8px] font-bold text-slate-400 truncate w-[70px] text-center uppercase tracking-tighter">{node.name}</span>
      </div>
      
      {/* Role Tag */}
      <span className={`text-[8px] font-black mt-2 uppercase px-3 py-1 rounded-full border shadow-sm transition-colors ${node.isActive ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white text-slate-400 border-slate-100'}`}>
        {role}
      </span>

      {/* 🟢 HOVER/TOUCH DETAILS CARD */}
      <div className="absolute top-28 z-[100] hidden group-hover:block w-56 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-5 text-left pointer-events-none animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
            <p className="text-[10px] font-black text-slate-800 uppercase flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> Business
            </p>
            <span className={`text-[8px] font-black px-2 py-1 rounded-lg ${node.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {node.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
        </div>
        
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-slate-400 font-black uppercase">Package</span>
            <span className="text-xs font-black text-blue-600">${node.currentPackage || 0}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
            <div className="text-center flex-1 border-r border-slate-200">
                <p className="text-[8px] text-slate-400 font-bold">LEFT TOTAL</p>
                <p className="text-xs font-black text-slate-800">${node.totalLeftBusiness || 0}</p>
            </div>
            <div className="text-center flex-1">
                <p className="text-[8px] text-slate-400 font-bold">RIGHT TOTAL</p>
                <p className="text-xs font-black text-slate-800">${node.totalRightBusiness || 0}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-100">
            <span className="text-[9px] text-indigo-500 font-black uppercase">Carry (L/R)</span>
            <span className="text-[10px] font-black text-slate-600">
                ${node.carryForward?.leftVolume || 0} / ${node.carryForward?.rightVolume || 0}
            </span>
          </div>
        </div>
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45"></div>
      </div>
    </div>
  );
};

const NetworkTree = () => {
  const { user, token } = useAuth();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRootId, setCurrentRootId] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchTree = useCallback(async (targetId) => {
    if (!targetId) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/network/tree/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTreeData(res.data.tree);
    } catch (error) {
      console.error("Tree error", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.userId) {
      setCurrentRootId(user.userId);
      fetchTree(user.userId);
    }
  }, [user?.userId, fetchTree]);

  const handleNavigate = (targetId) => {
    if (!targetId || targetId === treeData?.userId) return;
    setHistory(prev => [...prev, treeData.userId]);
    fetchTree(targetId);
  };

  const goBack = () => {
    const prevId = history.pop();
    setHistory([...history]);
    fetchTree(prevId || user.userId);
  };

  const resetToMe = () => {
    setHistory([]);
    fetchTree(user.userId);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Mapping Network...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 select-none">
      
      {/* 🟢 Floating Header */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
        <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3.5 rounded-2xl text-white shadow-lg shadow-blue-200">
                <Maximize2 size={24} />
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Genealogy Tree</h2>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Click any member to explore their team</p>
            </div>
        </div>

        <div className="flex items-center gap-2">
            {history.length > 0 && (
                <button onClick={goBack} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all text-slate-600">
                    <ArrowLeft size={20} />
                </button>
            )}
            <button onClick={resetToMe} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                <Home size={16} /> My Root
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100">
                <span className="text-[9px] font-black text-blue-400 uppercase">View:</span>
                <span className="text-xs font-black text-blue-700">{treeData?.userId}</span>
            </div>
        </div>
      </div>

      {/* 🌳 Dynamic Tree View Area */}
      <div className="w-full overflow-x-auto overflow-y-visible pb-32 pt-10 custom-scroll">
        <div className="min-w-[800px] flex flex-col items-center">
          
          {/* Level 1: Current Root */}
          <div className="mb-20 relative">
             <TreeNode node={treeData} role="CURRENT ROOT" onNavigate={handleNavigate} />
             {(treeData.left || treeData.right) && <div className="absolute top-24 left-1/2 w-0.5 h-16 bg-slate-200"></div>}
          </div>

          {/* Level 2 */}
          <div className="flex justify-center gap-40 md:gap-80 mb-20 relative">
            {(treeData.left || treeData.right) && (
              <div className="absolute -top-4 w-[320px] md:w-[640px] h-0.5 bg-slate-200"></div>
            )}
            
            {/* Left Section */}
            <div className="flex flex-col items-center relative">
               <div className="absolute -top-4 w-0.5 h-4 bg-slate-200"></div>
               <TreeNode node={treeData.left} role="LEFT TEAM" onNavigate={handleNavigate} />
               {(treeData.left?.left || treeData.left?.right) && <div className="absolute top-24 left-1/2 w-0.5 h-16 bg-slate-200"></div>}
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-center relative">
               <div className="absolute -top-4 w-0.5 h-4 bg-slate-200"></div>
               <TreeNode node={treeData.right} role="RIGHT TEAM" onNavigate={handleNavigate} />
               {(treeData.right?.left || treeData.right?.right) && <div className="absolute top-24 left-1/2 w-0.5 h-16 bg-slate-200"></div>}
            </div>
          </div>

          {/* Level 3: Grandchildren */}
          <div className="flex justify-center gap-10 md:gap-24 relative">
             {/* Left Grandchildren */}
             <div className="flex gap-10 md:gap-20 relative">
                {(treeData.left?.left || treeData.left?.right) && <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[160px] md:w-[240px] h-0.5 bg-slate-200"></div>}
                <div className="relative flex flex-col items-center">
                    {treeData.left && <div className="absolute -top-4 w-0.5 h-4 bg-slate-200"></div>}
                    <TreeNode node={treeData.left?.left} role="L" onNavigate={handleNavigate} />
                </div>
                <div className="relative flex flex-col items-center">
                    {treeData.left && <div className="absolute -top-4 w-0.5 h-4 bg-slate-200"></div>}
                    <TreeNode node={treeData.left?.right} role="R" onNavigate={handleNavigate} />
                </div>
             </div>

             {/* Right Grandchildren */}
             <div className="flex gap-10 md:gap-20 relative">
                {(treeData.right?.left || treeData.right?.right) && <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[160px] md:w-[240px] h-0.5 bg-slate-200"></div>}
                <div className="relative flex flex-col items-center">
                    {treeData.right && <div className="absolute -top-4 w-0.5 h-4 bg-slate-200"></div>}
                    <TreeNode node={treeData.right?.left} role="L" onNavigate={handleNavigate} />
                </div>
                <div className="relative flex flex-col items-center">
                    {treeData.right && <div className="absolute -top-4 w-0.5 h-4 bg-slate-200"></div>}
                    <TreeNode node={treeData.right?.right} role="R" onNavigate={handleNavigate} />
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* Mobile Hint */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-100 shadow-2xl md:hidden">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Swipe Left/Right to explore</p>
      </div>

    </div>
  );
};

export default NetworkTree;