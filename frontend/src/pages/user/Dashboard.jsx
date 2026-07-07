import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import { Award, ArrowRight, Zap } from 'lucide-react';

// 🟢 FIX 1: useAuth se 'updateUser' aur 'token' bhi nikalo
import { useAuth } from '../../context/AuthContext';

// Components
import BalanceCard from '../../components/BalanceCard';
import ActionButtons from '../../components/ActionButtons';
import ReferralBox from '../../components/ReferralBox';
import Modals from '../../components/Modals/Modals'; 
import ActivePackageCard from '../../components/ActivePackageCard';
import IncomeStats from '../../components/IncomeStats'; 
import TelegramBanner from '../../components/TelegramBanner'; 
import UpgradeTimerBanner from '../../components/UpgradeTimerBanner'; // 🔴 TIMER BANNER IMPORT KIYA

const Dashboard = () => {
  // ✅ updateUser aur token bhi nikala taaki data sync kar sakein
  const { user, updateUser, token } = useAuth(); 

  const [modalState, setModalState] = useState({
    deposit: false,
    withdraw: false,
    transfer: false,
    buyPackage: false
  });

  // 🔄 FIX 2: Profile Sync Logic
  // Ye logic solve karega ki login ke baad package kyu gayab ho rahe the
  useEffect(() => {
    const fetchFreshProfile = async () => {
      // 🎯 7-Digit userId use kar rahe hain
      if (user?.userId && token) {
        try {
          const response = await axios.get(`/api/user/profile/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.user) {
            // 🟢 Context ko fresh data se update kar do
            updateUser(response.data.user); 
          }
        } catch (error) {
          console.error("Dashboard Sync Error:", error);
        }
      }
    };

    fetchFreshProfile();
  }, [token]); // Sirf tab chalega jab token milega (login ke baad)

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-2 sm:py-8 space-y-3 sm:space-y-6 font-sans bg-gray-50/30 min-h-screen">
      
      {/* 🔴 NEW UPGRADE BANNER: 30 June ke baad wale $10 users ke liye */}
      <UpgradeTimerBanner user={user} />

      {/* 🟢 NEW LAYOUT GRID: Ye Grid Mobile aur PC dono me perfectly adjust karega */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        
        {/* 1. BALANCE CARD & TELEGRAM (PC: Top Left | Mobile: 1st) */}
        <div className="col-span-1 lg:col-span-1 order-1 lg:order-1 flex flex-col gap-3 sm:gap-6">
           <div className="bg-white p-0.5 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <BalanceCard user={user} />
           </div>
           
           {/* 🔵 TELEGRAM BANNER YAHAN LAGA DIYA HAI - Balance ke theek niche */}
           <TelegramBanner />
        </div>

        {/* 2. REFERRAL BOX (PC: Top Middle | Mobile: 4th) */}
        <div className="col-span-1 lg:col-span-1 order-4 lg:order-2 h-full">
           <div className="bg-white h-full rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <ReferralBox userId={user?.userId} />
           </div>
        </div>
        
        {/* 3. NETWORK STATUS (PC: Top Right | Mobile: 5th) */}
        <div className="col-span-1 lg:col-span-1 order-5 lg:order-3 h-full">
           <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col justify-between relative overflow-hidden group border-t-2 border-t-blue-500">
             
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>

             <div className="relative z-10">
               <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-3">
                 <h3 className="text-[11px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                    <Award size={16} className="text-blue-500" /> Network Status
                 </h3>
                 <span className="bg-green-50 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-full border border-green-100 animate-pulse">LIVE</span>
               </div>
               
               {/* Binary Business Stats */}
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
               
               <div className="flex justify-between items-center mb-5 bg-blue-50/30 p-3 rounded-2xl border border-blue-100">
                 <div>
                   <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">Rank</p>
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
             
             <Link 
                to="/network-status" 
                className="relative z-10 w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
             >
                Business Report <ArrowRight size={14} />
             </Link>
             
           </div>
        </div>

        {/* 4. INCOME STATS (PC: Middle Row Full Width | Mobile: 2nd) */}
        <div className="col-span-1 lg:col-span-3 order-2 lg:order-4 w-full">
           <IncomeStats user={user} />
        </div>

        {/* 5. ACTION BUTTONS (PC: Bottom Row Full Width | Mobile: 3rd) */}
        <div className="col-span-1 lg:col-span-3 order-3 lg:order-5 w-full">
           <ActionButtons setModalState={setModalState} />
        </div>

      </div>

      {/* BOTTOM SECTION: Active Package */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden border-t-2 border-t-indigo-500 mt-3 sm:mt-6">
        <ActivePackageCard setModalState={setModalState} />
      </div>

      {/* MODALS */}
      <Modals 
        modalState={modalState} 
        setModalState={setModalState} 
      />
    </div>
  );
};

export default Dashboard;