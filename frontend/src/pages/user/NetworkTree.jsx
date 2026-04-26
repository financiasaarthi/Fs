import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Activity, ShieldCheck, ChevronDown, Loader2 } from 'lucide-react';
// 🟢 FIX 1: useAuth import kiya
import { useAuth } from '../../context/AuthContext'; 

// 🟢 Component: Ek Single User Node
const TreeNode = ({ node, role }) => {
  if (!node) {
    return (
      <div className="flex flex-col items-center mx-2 animate-pulse">
        <div className="w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-300 font-black uppercase">
          Empty
        </div>
        <span className="text-[8px] text-gray-300 mt-2 uppercase font-black tracking-tighter">{role}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mx-2 relative group cursor-pointer">
      
      {/* 1. Main Node UI */}
      <div className={`w-20 h-20 rounded-2xl shadow-sm border-2 flex flex-col items-center justify-center p-1 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:-translate-y-1 ${node.isActive ? 'bg-white border-emerald-500' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`p-1.5 rounded-xl mb-1 ${node.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
           <User size={20} fill={node.isActive ? "currentColor" : "none"} />
        </div>
        <span className="text-[10px] font-black text-gray-800 leading-tight">{node.userId || node.id}</span>
        <span className="text-[8px] font-bold text-gray-400 truncate w-[60px] text-center uppercase tracking-tighter">{node.name}</span>
      </div>
      
      {/* Role Tag */}
      <span className={`text-[8px] font-black mt-2 uppercase px-3 py-0.5 rounded-full border shadow-sm transition-colors ${node.isActive ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white text-gray-400 border-gray-100'}`}>
        {role || "Partner"}
      </span>

      {/* 🟢 2. HOVER DETAILS CARD */}
      <div className="absolute top-24 z-[100] hidden group-hover:block w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 text-left pointer-events-none animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-3">
            <p className="text-[10px] font-black text-gray-800 uppercase flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> Business Details
            </p>
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${node.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {node.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Package</span>
            <span className="text-xs font-black text-indigo-600">${node.currentPackage || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Left Vol</span>
            <span className="text-xs font-black text-gray-700">${node.binaryBusiness?.leftVolume || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Right Vol</span>
            <span className="text-xs font-black text-gray-700">${node.binaryBusiness?.rightVolume || 0}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex justify-between items-center">
            <span className="text-[10px] text-blue-500 font-black uppercase">Matched</span>
            <span className="text-xs font-black text-blue-600">{node.binaryBusiness?.totalPairsMatched || 0}</span>
          </div>
        </div>
        
        {/* Triangle Pointer */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>
      </div>
    </div>
  );
};

// 🟢 Main Tree Component
const NetworkTree = () => {
  // 🟢 FIX 2: Context se data aur token nikala
  const { user, token } = useAuth();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      if (!user?.userId) return;
      try {
        setLoading(true);
        const res = await axios.get(`/api/network/tree/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTreeData(res.data.tree);
      } catch (error) {
        console.error("Failed to load tree", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [user?.userId, token]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="text-indigo-600 animate-spin" />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Building Network Structure...</p>
      </div>
    );
  }

  if (!treeData) return <div className="text-center p-20 font-black text-red-400 uppercase tracking-widest">Data Not Available</div>;

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 md:p-8 flex flex-col items-center animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 w-full max-w-6xl mb-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100">
                <ShieldCheck size={24} />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Binary Genealogy</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visualizing Your Team Growth</p>
            </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <span className="text-[10px] font-black text-gray-400 uppercase">Viewing ID:</span>
            <span className="text-xs font-black text-indigo-600">{user?.userId}</span>
        </div>
      </div>
      
      {/* 🌳 Tree Diagram Area */}
      <div className="flex flex-col items-center overflow-x-auto w-full pb-40 px-4 custom-scroll">
        
        {/* Level 1: YOU */}
        <div className="flex justify-center mb-16 relative">
          <TreeNode node={treeData} role="YOU" />
          {(treeData.left || treeData.right) && <div className="absolute top-[100px] w-[2px] h-12 bg-indigo-100"></div>}
        </div>

        {/* Level 2: L & R */}
        <div className="flex justify-center gap-32 md:gap-64 mb-16 relative">
          {(treeData.left || treeData.right) && (
            <div className="absolute -top-4 w-[256px] md:w-[512px] h-[2px] bg-indigo-100"></div>
          )}
          
          {/* Left Branch */}
          <div className="flex flex-col items-center relative">
            <div className="absolute -top-4 w-[2px] h-4 bg-indigo-100"></div>
            <TreeNode node={treeData.left} role="LEFT TEAM" />
            {(treeData.left?.left || treeData.left?.right) && <div className="absolute top-[100px] w-[2px] h-12 bg-indigo-100"></div>}
          </div>
          
          {/* Right Branch */}
          <div className="flex flex-col items-center relative">
            <div className="absolute -top-4 w-[2px] h-4 bg-indigo-100"></div>
            <TreeNode node={treeData.right} role="RIGHT TEAM" />
            {(treeData.right?.left || treeData.right?.right) && <div className="absolute top-[100px] w-[2px] h-12 bg-indigo-100"></div>}
          </div>
        </div>

        {/* Level 3: Grandchildren */}
        <div className="flex justify-center gap-8 md:gap-20 relative">
            
            {/* YOU -> LEFT -> (L & R) */}
            <div className="flex gap-8 relative">
                {(treeData.left?.left || treeData.left?.right) && <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[120px] md:w-[160px] h-[2px] bg-indigo-100"></div>}
                <div className="relative flex flex-col items-center">
                  {treeData.left && <div className="absolute -top-4 w-[2px] h-4 bg-indigo-100"></div>}
                  <TreeNode node={treeData.left?.left} role="L" />
                </div>
                <div className="relative flex flex-col items-center">
                  {treeData.left && <div className="absolute -top-4 w-[2px] h-4 bg-indigo-100"></div>}
                  <TreeNode node={treeData.left?.right} role="R" />
                </div>
            </div>

            {/* YOU -> RIGHT -> (L & R) */}
            <div className="flex gap-8 relative">
                {(treeData.right?.left || treeData.right?.right) && <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[120px] md:w-[160px] h-[2px] bg-indigo-100"></div>}
                <div className="relative flex flex-col items-center">
                  {treeData.right && <div className="absolute -top-4 w-[2px] h-4 bg-indigo-100"></div>}
                  <TreeNode node={treeData.right?.left} role="L" />
                </div>
                <div className="relative flex flex-col items-center">
                  {treeData.right && <div className="absolute -top-4 w-[2px] h-4 bg-indigo-100"></div>}
                  <TreeNode node={treeData.right?.right} role="R" />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default NetworkTree;