import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, Activity, Search, Loader2, ArrowLeft, Home, ZoomIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// 🟢 Node Component (Thoda chhota aur compact design)
const TreeNode = ({ node, role, onNavigate }) => {
  if (!node) {
    return (
      <div className="flex flex-col items-center mx-1 opacity-20">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[8px] text-slate-400 font-bold uppercase italic">
          Empty
        </div>
        <span className="text-[7px] text-slate-400 mt-1 uppercase font-black">{role}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mx-1 relative group">
      <div 
        onClick={() => onNavigate(node.userId)}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl shadow-md border-2 flex flex-col items-center justify-center p-1 cursor-pointer transition-all duration-500 hover:scale-110 z-10 ${
          node.isActive ? 'bg-white border-emerald-500 shadow-emerald-100' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className={`p-1 rounded-lg mb-0.5 ${node.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
           <User size={16} fill={node.isActive ? "currentColor" : "none"} />
        </div>
        <span className="text-[8px] md:text-[9px] font-black text-slate-800 leading-tight">ID: {node.userId}</span>
        <span className="text-[7px] font-bold text-slate-400 truncate w-12 text-center uppercase">{node.name}</span>
      </div>
      
      <div className={`mt-1 px-2 py-0.5 rounded-full border text-[7px] font-black uppercase shadow-sm ${
        node.isActive ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-100'
      }`}>
        {node.isActive ? `$${node.currentPackage}` : 'Inactive'}
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
    if (!targetId) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/network/tree/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTreeData(res.data.tree);
    } catch (error) {
      console.error("Tree data error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.userId) fetchTree(user.userId);
  }, [user?.userId, fetchTree]);

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

  if (loading && !treeData) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-2 md:p-4 select-none font-sans">
      
      {/* Header & Search */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl shadow-lg border border-white">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><ZoomIn size={18} /></div>
            <h2 className="text-md font-black text-slate-900 uppercase">Hierarchy</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleNavigate(searchId); setSearchId(''); }} className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search ID..." value={searchId} onChange={(e) => setSearchId(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
        </form>
        <div className="flex gap-2">
            {history.length > 0 && <button onClick={handleBack} className="p-2 bg-slate-100 rounded-lg text-slate-600"><ArrowLeft size={16} /></button>}
            <button onClick={() => { setHistory([]); fetchTree(user.userId); }} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">My Root</button>
        </div>
      </div>

      {/* 🌳 4-Level Responsive Tree View */}
      <div className="w-full overflow-x-auto pb-40 pt-5 custom-scroll">
        <div className="min-w-[1200px] flex flex-col items-center">
          
          {/* Level 1 */}
          <div className="mb-14"><TreeNode node={treeData} role="ROOT" onNavigate={handleNavigate} /></div>

          {/* Level 2 */}
          <div className="flex justify-center gap-64 mb-14">
             <TreeNode node={treeData?.left} role="LEFT" onNavigate={handleNavigate} />
             <TreeNode node={treeData?.right} role="RIGHT" onNavigate={handleNavigate} />
          </div>

          {/* Level 3 */}
          <div className="flex justify-center gap-20 mb-14">
             <div className="flex gap-24">
                <TreeNode node={treeData?.left?.left} role="L" onNavigate={handleNavigate} />
                <TreeNode node={treeData?.left?.right} role="R" onNavigate={handleNavigate} />
             </div>
             <div className="flex gap-24">
                <TreeNode node={treeData?.right?.left} role="L" onNavigate={handleNavigate} />
                <TreeNode node={treeData?.right?.right} role="R" onNavigate={handleNavigate} />
             </div>
          </div>

          {/* 🔥 Level 4 (Ab aapki missing IDs yahan dikhengi) */}
          <div className="flex justify-center gap-4">
             {/* Under Left-Left */}
             <div className="flex gap-4 border-r border-slate-200 pr-4">
                <TreeNode node={treeData?.left?.left?.left} role="L" onNavigate={handleNavigate} />
                <TreeNode node={treeData?.left?.left?.right} role="R" onNavigate={handleNavigate} />
             </div>
             {/* Under Left-Right */}
             <div className="flex gap-4 border-r border-slate-200 pr-4">
                <TreeNode node={treeData?.left?.right?.left} role="L" onNavigate={handleNavigate} />
                <TreeNode node={treeData?.left?.right?.right} role="R" onNavigate={handleNavigate} />
             </div>
             {/* Under Right-Left */}
             <div className="flex gap-4 border-r border-slate-200 pr-4">
                <TreeNode node={treeData?.right?.left?.left} role="L" onNavigate={handleNavigate} />
                <TreeNode node={treeData?.right?.left?.right} role="R" onNavigate={handleNavigate} />
             </div>
             {/* Under Right-Right */}
             <div className="flex gap-4">
                <TreeNode node={treeData?.right?.right?.left} role="L" onNavigate={handleNavigate} />
                <TreeNode node={treeData?.right?.right?.right} role="R" onNavigate={handleNavigate} />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NetworkTree;