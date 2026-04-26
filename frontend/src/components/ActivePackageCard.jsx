import React, { useState, useEffect } from 'react';
import { Package, PlayCircle, AlertCircle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActivePackageCard = ({ user, setModalState }) => {
  const navigate = useNavigate();
  const [localProgress, setLocalProgress] = useState({});

  const packagesConfig = {
    10: { name: 'Starter Plan', tasks: 2 },
    30: { name: 'Basic Plan', tasks: 6 },
    50: { name: 'Pro Plan', tasks: 10 },
    100: { name: 'Premium Plan', tasks: 20 },
    500: { name: 'VIP Plan', tasks: 50 }
  };

  const activePackages = user?.activePackages?.length > 0
      ? [...user.activePackages].sort((a, b) => a - b)
      : user?.currentPackage ? [user.currentPackage] : [];

  useEffect(() => {
    if (user?._id) {
      const storedProgress = JSON.parse(localStorage.getItem(`pkgProgress_${user._id}`)) || {};
      setLocalProgress(storedProgress);
    }
  }, [user?._id, user?.dailyVideosWatched]);

  // 🔴 NO PACKAGE STATE (Sleek UI)
  if (activePackages.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 border-t-2 border-t-amber-500 p-8 flex flex-col items-center text-center shadow-sm">
        <div className="bg-amber-50 p-4 rounded-2xl text-amber-500 mb-4">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">No Active Package</h2>
        <p className="text-xs text-gray-500 font-bold mt-2 mb-6 max-w-[250px]">
          Invest in a plan now to start receiving daily task rewards.
        </p>
        <button
          onClick={() => setModalState((prev) => ({ ...prev, buyPackage: true }))}
          className="w-full sm:w-auto px-10 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
        >
          Explore Plans <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activePackages.map((pkgPrice, index) => {
        const pkgDetails = packagesConfig[pkgPrice];
        if (!pkgDetails) return null;

        const watchedForPkg = localProgress[pkgPrice] || 0;
        const maxForPkg = pkgDetails.tasks;
        const isCompleted = watchedForPkg >= maxForPkg;
        const progressPercent = Math.min((watchedForPkg / maxForPkg) * 100, 100);

        return (
          <div
            key={index}
            className="bg-white rounded-[2rem] border border-gray-100 border-t-2 border-t-indigo-600 p-4 sm:p-6 shadow-sm relative overflow-hidden"
          >
            {/* Background Decorative Icon */}
            <Package size={120} className="absolute -right-8 -bottom-8 text-gray-50 opacity-10 pointer-events-none" />

            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 relative z-10">
              
              {/* LEFT SECTION: Package Details */}
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className={`p-4 rounded-2xl shadow-inner ${isCompleted ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Package size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                      {pkgDetails.name}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                        Done
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <h2 className="text-3xl font-black text-gray-900">${pkgPrice}</h2>
                    <span className="text-xs font-bold text-gray-400">/ Investment</span>
                  </div>
                </div>
              </div>

              {/* RIGHT SECTION: Task Progress (Bento Box Style) */}
              <div className="w-full lg:w-[45%] bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Daily Progress</span>
                  </div>
                  <span className={`text-sm font-black ${isCompleted ? 'text-green-600' : 'text-indigo-600'}`}>
                    {watchedForPkg} <span className="text-gray-300">/</span> {maxForPkg}
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${isCompleted ? 'bg-green-500' : 'bg-indigo-600'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* ACTION BUTTON */}
                {isCompleted ? (
                  <div className="w-full py-2.5 bg-green-100 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-green-200">
                    <CheckCircle size={14} /> Today's Goal Met
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate('/tasks')}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
                  >
                    <PlayCircle size={14} className="group-hover:scale-110 transition-transform" /> 
                    Watch Tasks
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