import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import { Award, ArrowRight, Zap, Target } from 'lucide-react';

// Components
import BalanceCard from '../../components/BalanceCard';
import ActionButtons from '../../components/ActionButtons';
import ReferralBox from '../../components/ReferralBox';
import Modals from '../../components/Modals/Modals'; 
import ActivePackageCard from '../../components/ActivePackageCard';
import IncomeStats from '../../components/IncomeStats'; 

const Dashboard = ({ user, setUser }) => {
  const [modalState, setModalState] = useState({
    deposit: false,
    withdraw: false,
    transfer: false,
    buyPackage: false
  });

  // 🔄 Profile Refresh Logic
  useEffect(() => {
    const fetchFreshProfile = async () => {
      if (user && user.userId) {
        try {
          const response = await axios.get(`http://localhost:5000/api/user/profile/${user.userId}`);
          if (response.data && response.data.user) {
            setUser(response.data.user); 
            localStorage.setItem('user', JSON.stringify(response.data.user)); 
          }
        } catch (error) {
          console.error("Profile fetch error", error);
        }
      }
    };
    fetchFreshProfile();
  }, [user?.userId]);

  return (
    /**
     * 📱 MOBILE: px-1 (Full width layout), py-2 (Tight gaps)
     * 💻 PC: px-8, py-8 (Spacious premium feel)
     */
    <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-2 sm:py-8 space-y-3 sm:space-y-6 font-sans bg-gray-50/30 min-h-screen">
      
      {/* 🟢 TOP SECTION GRID: 3 Columns on PC, 1 on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        
        {/* COLUMN 1: Financial Core (Balance + Income + Actions) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col gap-3 sm:gap-6 h-full">
           
           {/* 💰 Main Balance Card - Sleek White */}
           <div className="bg-white p-0.5 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <BalanceCard user={user} />
           </div>

           {/* 📊 Income Summary Stats */}
           <IncomeStats user={user} />
           
           {/* ⚡ Quick Actions Section */}
           <ActionButtons setModalState={setModalState} />
        </div>
        
        {/* COLUMN 2: Referral & Growth Section */}
        <div className="col-span-1 lg:col-span-1 h-full">
           <div className="bg-white h-full rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <ReferralBox userId={user?.userId} />
           </div>
        </div>
        
        {/* COLUMN 3: Network Status (Minimalist with Accent) */}
        <div className="col-span-1 lg:col-span-1 h-full">
           <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col justify-between relative overflow-hidden group border-t-2 border-t-blue-500">
             
             {/* Subtle Glow Decoration */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>

             <div className="relative z-10">
               <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-3">
                 <h3 className="text-[11px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                    <Award size={16} className="text-blue-500" /> Network Status
                 </h3>
                 <span className="bg-green-50 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-full border border-green-100 animate-pulse">LIVE</span>
               </div>
               
               {/* Left/Right Volumes (Minimalist Design) */}
               <div className="grid grid-cols-2 gap-2 mb-4">
                 <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 text-center">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Left Vol</p>
                    <p className="text-sm font-black text-gray-800">${user?.binaryBusiness?.leftVolume || 0}</p>
                 </div>
                 <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 text-center">
                    <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1">Right Vol</p>
                    <p className="text-sm font-black text-gray-800">${user?.binaryBusiness?.rightVolume || 0}</p>
                 </div>
               </div>
               
               {/* Rank & Match Highlight */}
               <div className="flex justify-between items-center mb-5 bg-blue-50/30 p-3 rounded-2xl border border-blue-100">
                 <div>
                   <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">Current Rank</p>
                   <p className="text-xs font-black text-blue-700 uppercase">{user?.currentRank || 'Standard'}</p>
                 </div>
                 <div className="text-right border-l border-blue-100 pl-3">
                   <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">Matched</p>
                   <p className="text-xs font-black text-blue-700 flex items-center gap-1">
                     <Zap size={12} className="text-blue-500 fill-current"/> ${(user?.wallets?.matchingIncome * 10) || 0}
                   </p>
                 </div>
               </div>
             </div>
             
             {/* Styled Link Button */}
             <Link 
                to="/network-status" 
                className="relative z-10 w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
             >
                Business Report <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </Link>
             
           </div>
        </div>
      </div>

      {/* 🟢 BOTTOM SECTION: Active Package (Premium Bento Box) */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden border-t-2 border-t-indigo-500">
        <ActivePackageCard user={user} setModalState={setModalState} />
      </div>

      {/* 🟢 MODALS: Popups for Actions */}
      <Modals 
        user={user} setUser={setUser} 
        modalState={modalState} setModalState={setModalState} 
      />
    </div>
  );
};

export default Dashboard;