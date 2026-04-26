import React from 'react';
import { CheckCircle2, Copy, PartyPopper } from 'lucide-react';

const SuccessModal = ({ 
  isOpen, 
  title, 
  message, 
  children, 
  onConfirm, 
  btnText = "CONTINUE",
  type = "success" // 'success' ya 'reward'
}) => {
  if (!isOpen) return null;

  // Custom Colors Based on Type (Reward ke liye special theme)
  const isReward = type === 'reward';
  const themeColor = isReward ? 'amber' : 'emerald';
  const Icon = isReward ? PartyPopper : CheckCircle2;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        className={`bg-white w-full max-w-sm sm:max-w-md rounded-[2rem] shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-500 border-t-4 ${isReward ? 'border-t-amber-500' : 'border-t-emerald-500'}`}
      >
        
        {/* 🟢 Premium Header Area */}
        <div className={`pt-10 pb-6 text-center relative overflow-hidden bg-gradient-to-b ${isReward ? 'from-amber-50/50' : 'from-emerald-50/50'} to-white`}>
          
          {/* Background Glow Effect */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 ${isReward ? 'bg-amber-400/20' : 'bg-emerald-400/20'} rounded-full blur-3xl pointer-events-none`}></div>
          
          {/* Floating Icon */}
          <div className="relative">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg ${isReward ? 'bg-gradient-to-tr from-amber-400 to-yellow-300' : 'bg-gradient-to-tr from-emerald-400 to-green-500'} animate-bounce-slow`}>
              <div className="bg-white/20 w-full h-full rounded-full flex items-center justify-center p-2 backdrop-blur-sm">
                 <div className="bg-white w-full h-full rounded-full flex items-center justify-center shadow-inner">
                    <Icon size={32} className={isReward ? 'text-amber-500' : 'text-emerald-500'} />
                 </div>
              </div>
            </div>
            
            {/* Sparkles (Only for reward) */}
            {isReward && (
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                 <span className="absolute top-2 right-10 text-amber-400 text-xl animate-pulse">✨</span>
                 <span className="absolute bottom-4 left-10 text-yellow-500 text-lg animate-ping">✨</span>
               </div>
            )}
          </div>

          <h2 className={`text-2xl sm:text-3xl font-black mt-6 tracking-tight uppercase ${isReward ? 'text-amber-600' : 'text-emerald-600'}`}>
            {title || "Success!"}
          </h2>
        </div>

        {/* 🟢 Content Area */}
        <div className="px-6 sm:px-8 pb-8 text-center relative z-10">
          
          {message && (
            <p className="text-gray-500 font-bold text-sm sm:text-base leading-relaxed mb-6">
              {message}
            </p>
          )}
          
          {/* Custom Content Area (For ID, Passwords, Receipts etc.) */}
          {children && (
            <div className="mb-8">
              {children}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onConfirm}
            className={`w-full py-4 rounded-[1.5rem] font-black text-xs sm:text-sm uppercase tracking-[0.2em] text-white shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 ${
              isReward 
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' 
                : 'bg-gray-900 hover:bg-black shadow-gray-900/20'
            }`}
          >
            {btnText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SuccessModal;