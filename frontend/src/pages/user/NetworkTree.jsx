import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Activity } from 'lucide-react';

// 🟢 Component: Ek Single User Box (With Detail Hover Card)
const TreeNode = ({ node, role }) => {
  if (!node) {
    return (
      <div className="flex flex-col items-center mx-2">
        <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-xs text-gray-400 font-bold">
          Empty
        </div>
        <span className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">{role}</span>
      </div>
    );
  }

  return (
    // 'group' class zaroori hai hover effect ke liye
    <div className="flex flex-col items-center mx-2 relative group cursor-pointer">
      
      {/* 1. Main Node Box */}
      <div className={`w-20 h-20 rounded-lg shadow-sm border-2 flex flex-col items-center justify-center p-1 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${node.isActive ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-400'}`}>
        <User size={24} className={node.isActive ? "text-green-600" : "text-red-500"} />
        <span className="text-xs font-black text-gray-800 mt-1">{node.id}</span>
        <span className="text-[9px] font-semibold text-gray-500 truncate w-full text-center">{node.name}</span>
      </div>
      <span className="text-[10px] font-bold text-gray-600 mt-1 uppercase bg-white px-3 py-[2px] rounded-full border shadow-sm">{role || "Root"}</span>

      {/* 🟢 2. HOVER DETAILS CARD (Ye mouse laane par dikhega) */}
      <div className="absolute top-24 z-50 hidden group-hover:block w-48 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 text-left pointer-events-none transform transition-all">
        <p className="text-sm font-bold text-gray-800 border-b pb-2 mb-2 flex items-center gap-2">
          <Activity size={14} className="text-blue-500" /> Business Info
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs border-b border-gray-50 pb-1">
            <span className="text-gray-500 font-semibold">Package:</span>
            <span className={`font-black ${node.currentPackage > 0 ? 'text-green-600' : 'text-red-500'}`}>
              ${node.currentPackage || 0}
            </span>
          </div>
          <div className="flex justify-between text-xs border-b border-gray-50 pb-1">
            <span className="text-gray-500 font-semibold">Left Vol:</span>
            <span className="font-black text-gray-700">${node.binaryBusiness?.leftVolume || 0}</span>
          </div>
          <div className="flex justify-between text-xs border-b border-gray-50 pb-1">
            <span className="text-gray-500 font-semibold">Right Vol:</span>
            <span className="font-black text-gray-700">${node.binaryBusiness?.rightVolume || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-blue-500 font-semibold">Matched Pairs:</span>
            <span className="font-black text-blue-600">{node.binaryBusiness?.totalPairsMatched || 0}</span>
          </div>
        </div>
        
        {/* Pointer Triangle */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45"></div>
      </div>
      
    </div>
  );
};

// 🟢 Main Tree Component
const NetworkTree = ({ user }) => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const currentUserId = user?.userId; 

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/network/tree/${currentUserId}`);
        setTreeData(res.data.tree);
      } catch (error) {
        console.error("Failed to load tree", error);
      } finally {
        setLoading(false);
      }
    };
    if(currentUserId) fetchTree();
  }, [currentUserId]);

  if (loading) return <div className="text-center p-10 font-bold text-blue-600 mt-20 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div> Loading Your Team Tree...</div>;
  if (!treeData) return <div className="text-center p-10 text-red-500">Tree data not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 flex flex-col items-center">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-6xl mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800">My Binary Network</h2>
          <p className="text-sm text-gray-500 mt-1">Hover over any user to see their package and volume details.</p>
        </div>
      </div>
      
      {/* 🌳 CSS Flexbox based Tree Diagram */}
      <div className="flex flex-col items-center overflow-x-auto w-full pb-32">
        
        {/* Level 1: ROOT */}
        <div className="flex justify-center mb-10 relative">
          <TreeNode node={treeData} role="YOU" />
          {(treeData.left || treeData.right) && <div className="absolute top-24 w-[2px] h-10 bg-gray-300"></div>}
        </div>

        {/* Level 2: L & R Children */}
        <div className="flex justify-center gap-24 md:gap-48 mb-10 relative">
          {(treeData.left || treeData.right) && <div className="absolute -top-10 w-[calc(100%-6rem)] md:w-[calc(100%-12rem)] h-[2px] bg-gray-300"></div>}
          
          <div className="flex flex-col items-center relative">
            <div className="absolute -top-10 w-[2px] h-10 bg-gray-300"></div>
            <TreeNode node={treeData.left} role="LEFT TEAM" />
            {(treeData.left?.left || treeData.left?.right) && <div className="absolute top-24 w-[2px] h-10 bg-gray-300"></div>}
          </div>
          
          <div className="flex flex-col items-center relative">
            <div className="absolute -top-10 w-[2px] h-10 bg-gray-300"></div>
            <TreeNode node={treeData.right} role="RIGHT TEAM" />
            {(treeData.right?.left || treeData.right?.right) && <div className="absolute top-24 w-[2px] h-10 bg-gray-300"></div>}
          </div>
        </div>

        {/* Level 3: Grandchildren */}
        <div className="flex justify-center gap-6 md:gap-16 relative mt-4">
            {/* Left Child's Children */}
            <div className="flex gap-6 relative">
                {(treeData.left?.left || treeData.left?.right) && <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] h-[2px] bg-gray-300"></div>}
                <div className="relative">
                  {treeData.left && <div className="absolute -top-14 w-[2px] h-14 bg-gray-300 left-1/2"></div>}
                  <TreeNode node={treeData.left?.left} role="L" />
                </div>
                <div className="relative">
                  {treeData.left && <div className="absolute -top-14 w-[2px] h-14 bg-gray-300 left-1/2"></div>}
                  <TreeNode node={treeData.left?.right} role="R" />
                </div>
            </div>

            {/* Right Child's Children */}
            <div className="flex gap-6 relative">
                {(treeData.right?.left || treeData.right?.right) && <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] h-[2px] bg-gray-300"></div>}
                <div className="relative">
                  {treeData.right && <div className="absolute -top-14 w-[2px] h-14 bg-gray-300 left-1/2"></div>}
                  <TreeNode node={treeData.right?.left} role="L" />
                </div>
                <div className="relative">
                   {treeData.right && <div className="absolute -top-14 w-[2px] h-14 bg-gray-300 left-1/2"></div>}
                  <TreeNode node={treeData.right?.right} role="R" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTree;