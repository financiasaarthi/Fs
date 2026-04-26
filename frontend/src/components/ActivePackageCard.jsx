import React, { useState, useEffect } from 'react';
import { Package, PlayCircle, AlertCircle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// 🟢 FIX: AuthContext se user data connect kiya
import { useAuth } from '../context/AuthContext'; 

const ActivePackageCard = ({ setModalState }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const [localProgress, setLocalProgress] = useState({});

  // Packages ki jankari
  const packagesConfig = {
    10: { name: 'Starter Plan', tasks: 2 },
    30: { name: 'Basic Plan', tasks: 6 },
    50: { name: 'Pro Plan', tasks: 10 },
    100: { name: 'Premium Plan', tasks: 20 },
    500: { name: 'VIP Plan', tasks: 50 }
  };

  /**
   * 🟢 MULTI-PACKAGE LOGIC:
   * Agar user ke paas 'activePackages' array hai toh usey sort karke dikhayenge.
   * Agar nahi hai toh 'currentPackage' ko array mein convert karke dikhayenge.
   */
  const activePackages = user?.activePackages && user.activePackages.length > 0
      ? [...new Set(user.activePackages)].sort((a, b) => a - b) // Duplicate hatane ke liye Set use kiya
      : user?.currentPackage ? [user.currentPackage] : [];

  useEffect(() => {
    // 🎯 7-DIGIT ID USE KIYA HAI (userId)
    // Isse aapka task progress hamesha sahi account se connect rahega
    if (user?.userId) {
      const storedProgress = JSON.parse(localStorage.getItem(`pkgProgress_${user.userId}`)) || {};
      setLocalProgress(storedProgress);
    }
  }, [user?.userId, user?.dailyVideosWatched]);

  // 🔴 AGAR KOI PACKAGE NAHI HAI (Empty State)
  if (activePackages.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 border-t-2 border-t-amber-500 p-8 flex flex-col items-center text-center shadow-sm">
        <div className="bg-amber-50 p-4 rounded-2xl text-amber-500 mb-4 shadow-inner">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">No Active Package</h2>
        <p className="text-xs text-gray-500 font-bold mt-2 mb-6 max-w-[250px]">
          Invest in a plan now to start receiving daily task rewards and binary income.
        </p>
        <button
          onClick={() => setModalState((prev) => ({ ...prev, buyPackage: true }))}
          className="w-full sm:w-auto px-10 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
        >
          Activate Now <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 🟢 AB YAHAN SAARE ACTIVE PACKAGES EK-EK KARKE DIKHENGE */}
      {activePackages.map((pkgPrice, index) => {
        const pkgDetails = packagesConfig[pkgPrice];
        if (!pkgDetails) return null;

        const watchedForPkg = localProgress[pkgPrice] || 0;
        const maxForPkg = pkgDetails.tasks;
        const isCompleted = watchedForPkg >= maxForPkg;
        const progressPercent = Math.min((watchedForPkg / maxForPkg) * 100, 100);

        return (
          <div
            key={`${pkgPrice}-${index}`}
            className="bg-white rounded-[2rem] border border-gray-100 border-t-2 border-t-indigo-600 p-4 sm:p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300"
          >
            {/* Background Decoration */}
            <Package size={120} className="absolute -right-8 -bottom-8 text-gray-50 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />

            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 relative z-10">
              
              {/* LEFT: Plan Name & Price */}
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className={`p-4 rounded-2xl shadow-inner transition-colors ${isCompleted ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Package size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                      {pkgDetails.name}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-green-100">
                        Task Done
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <h2 className="text-3xl font-black text-gray-900">${pkgPrice}</h2>
                    <span className="text-[10px] font-black text-gray-400 uppercase">Package</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Progress Tracking */}
              <div className="w-full lg:w-[45%] bg-gray-50/80 p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Progress</span>
                  </div>
                  <span className={`text-sm font-black ${isCompleted ? 'text-green-600' : 'text-indigo-600'}`}>
                    {watchedForPkg} <span className="text-gray-300">/</span> {maxForPkg}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-green-500' : 'bg-indigo-600'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Button */}
                {isCompleted ? (
                  <div className="w-full py-2.5 bg-green-100 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-green-200 shadow-sm">
                    <CheckCircle size={14} /> Completed
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate('/tasks')}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-black transition-all flex items-center justify-center gap-2 group"
                  >
                    <PlayCircle size={14} className="group-hover:scale-110 transition-transform" /> 
                    Start Tasks
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivePackageCard;