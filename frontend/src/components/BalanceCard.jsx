import React from 'react';
import { Wallet } from 'lucide-react';
// 🟢 FIX 1: useAuth import kiya
import { useAuth } from '../context/AuthContext'; 

// ❌ Props se 'user' hata diya, ab ye khud context se data lega
const BalanceCard = () => {
  // 🟢 FIX 2: Context se user nikala
  const { user } = useAuth();

  // 💰 Safe Balance Check: 
  // Ye line dhoondhegi ki balance 'wallets.mainBalance' mein hai ya seedha 'walletBalance' mein
  const mainBalance = user?.wallets?.mainBalance ?? user?.walletBalance ?? user?.balance ?? 0;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-md relative overflow-hidden h-full group hover:shadow-lg transition-all duration-300">
      
      {/* Background Decorative Element */}
      <div className="absolute -right-6 -top-6 bg-white/10 w-24 h-24 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
      
      <div className="flex justify-between items-center z-10 relative">
        <div>
          <p className="text-blue-200 font-bold text-xs flex items-center mb-1 uppercase tracking-widest">
            <Wallet size={14} className="mr-2" /> Main Balance
          </p>
          {/* ✅ Ab balance hamesha live update hoga */}
          <h3 className="text-4xl font-black tracking-tight font-sans">
            ${Number(mainBalance).toFixed(2)}
          </h3>
          <p className="text-[10px] text-blue-300 font-bold mt-1 uppercase tracking-tighter">
            User ID: {user?.userId || 'Loading...'}
          </p>
        </div>

        {/* 🟢 Status Badge */}
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black shadow-sm border border-white/20 animate-pulse ${user?.isActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {user?.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
          {/* Subtle decoration */}
          <div className="text-white/20">
            <Wallet size={32} strokeWidth={1} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;