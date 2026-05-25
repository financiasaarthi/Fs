import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Award, Zap, Target, TrendingUp, DollarSign, BarChart3, ChevronRight, ChevronLeft, Users } from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext'; 

const RANKS = [
  { name: 'None',     added: 0,     total: 0,     reward: '$0' },
  { name: 'Bronze',   added: 100,   total: 100,   reward: '$20' },
  { name: 'Silver',   added: 500,   total: 600,   reward: '$50' },
  { name: 'Gold',     added: 1000,  total: 1600,  reward: '$100' },
  { name: 'Platinum', added: 2500,  total: 4100,  reward: '$300' },
  { name: 'Diamond',  added: 5000,  total: 9100,  reward: '$1000' },
  { name: 'Ruby',     added: 10000, total: 19100, reward: '$1500' }
];

const NetworkStatusPage = () => {
  const { user, updateUser, token } = useAuth();
  
  // 🟢 NAYE STATES LIVE COUNT KE LIYE
  const [leftTeamCount, setLeftTeamCount] = useState(0);
  const [rightTeamCount, setRightTeamCount] = useState(0);

  useEffect(() => {
    const fetchFreshProfile = async () => {
      if (user?.userId && token) {
        try {
          const response = await axios.get(`/api/user/profile/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.user) {
            updateUser(response.data.user); 
          }
        } catch (error) {
          console.error("Network Status Sync Error:", error);
        }
      }
    };

    // 🟢 NAYA LOGIC: Live Team Count Mangaane ke liye
    const fetchLiveTeamCounts = async () => {
      if (user?.userId && token) {
        try {
          // Fetch Left Team
          const leftRes = await axios.post('/api/user/my-team', { userId: user.userId, type: 'left' }, { headers: { Authorization: `Bearer ${token}` }});
          setLeftTeamCount(Array.isArray(leftRes.data) ? leftRes.data.length : 0);

          // Fetch Right Team
          const rightRes = await axios.post('/api/user/my-team', { userId: user.userId, type: 'right' }, { headers: { Authorization: `Bearer ${token}` }});
          setRightTeamCount(Array.isArray(rightRes.data) ? rightRes.data.length : 0);
        } catch (error) {
          console.error("Live Team Count Error:", error);
        }
      }
    };

    fetchFreshProfile();
    fetchLiveTeamCounts(); 
  }, [token, user?.userId]);

  // Business Volumes
  const leftVolume = Number(user?.binaryBusiness?.leftVolume || 0);
  const rightVolume = Number(user?.binaryBusiness?.rightVolume || 0);

  // Wallet Incomes
  const matchingIncome = Number(user?.wallets?.matchingIncome || 0); 
  const rankRewardIncome = Number(user?.wallets?.rankReward || 0);

  // Rank calculation using lifetime income
  const lifetimeMatchedIncome = Number(user?.wallets?.totalMatchingIncome || matchingIncome);
  const totalMatchedVolume = (lifetimeMatchedIncome * 10);

  // Current Rank Index Calculation
  let currentIdx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalMatchedVolume >= RANKS[i].total) {
      currentIdx = i;
      break;
    }
  }

  const currentRank = RANKS[currentIdx];
  const isMax = currentIdx === RANKS.length - 1;
  const nextRank = isMax ? currentRank : RANKS[currentIdx + 1];

  // Logic for Next Milestone
  const targetForThisLevel = isMax ? 0 : nextRank.added; 
  const matchedInThisLevel = isMax ? 0 : Math.max(0, totalMatchedVolume - currentRank.total);
  const shortfall = isMax ? 0 : targetForThisLevel - matchedInThisLevel;

  const leftNeeded = isMax ? 0 : Math.max(0, shortfall - leftVolume);
  const rightNeeded = isMax ? 0 : Math.max(0, shortfall - rightVolume);

  const leftDoneForLevel = targetForThisLevel - leftNeeded;
  const rightDoneForLevel = targetForThisLevel - rightNeeded;

  const leftProgress = isMax ? 100 : Math.min((leftDoneForLevel / targetForThisLevel) * 100, 100);
  const rightProgress = isMax ? 100 : Math.min((rightDoneForLevel / targetForThisLevel) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 font-sans bg-gray-50/30 min-h-screen animate-in fade-in duration-500">
      
      {/* 🔵 HEADER SECTION */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-800 p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <Award size={150} className="sm:w-[180px] sm:h-[180px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-2 sm:mb-3 flex items-center gap-3 sm:gap-4">
              <Award className="text-yellow-400 drop-shadow-lg w-10 h-10 sm:w-12 sm:h-12" /> Business Report
            </h1>
            <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px] sm:text-xs opacity-80">Track your network growth and rank status</p>
          </div>
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-xl p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/20 text-center min-w-[200px] shadow-inner">
            <p className="text-[9px] sm:text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-1 sm:mb-2">Current Rank</p>
            <p className="text-3xl sm:text-4xl font-black text-yellow-400 uppercase tracking-tighter drop-shadow-md">{currentRank.name}</p>
          </div>
        </div>
      </div>

      {/* 🟠 SUMMARY GRID (Mobile Optimized - Left/Right Aamne Saamne) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        
        {/* 🟢 Box 1: Left Team Count (Order 1) */}
        <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center border-t-4 border-t-blue-400 hover:shadow-md transition-all order-1 lg:order-1 col-span-1">
            <div className="bg-blue-50 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl text-blue-500 mb-1.5 sm:mb-3"><Users size={16} className="sm:w-6 sm:h-6" /></div>
            <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Left Team</p>
            <h2 className="text-lg sm:text-3xl font-black text-gray-800">{leftTeamCount}</h2>
        </div>

        {/* Box 2: Total Matched (Order 5 for Mobile, so it goes down. Full width on mobile) */}
        <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all col-span-2 lg:col-span-1 order-5 lg:order-2">
            <div className="bg-indigo-50 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl text-indigo-600 mb-1.5 sm:mb-3 group-hover:scale-110 transition-transform"><BarChart3 size={16} className="sm:w-6 sm:h-6" /></div>
            <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Matched</p>
            <h2 className="text-xl sm:text-3xl font-black text-gray-800">${totalMatchedVolume.toFixed(2)}</h2>
        </div>

        {/* 🟢 Box 3: Right Team Count (Order 2) */}
        <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center border-t-4 border-t-purple-400 hover:shadow-md transition-all order-2 lg:order-3 col-span-1">
            <div className="bg-purple-50 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl text-purple-500 mb-1.5 sm:mb-3"><Users size={16} className="sm:w-6 sm:h-6" /></div>
            <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Right Team</p>
            <h2 className="text-lg sm:text-3xl font-black text-gray-800">{rightTeamCount}</h2>
        </div>

        {/* Box 4: Left Carry (Order 3) */}
        <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-3xl shadow-sm border border-gray-100 text-center border-l-4 border-l-blue-500 flex flex-col justify-center order-3 lg:order-4 col-span-1">
            <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase mb-1 sm:mb-2 tracking-widest">Left Carry</p>
            <h2 className="text-lg sm:text-2xl font-black text-blue-600">${leftVolume}</h2>
        </div>

        {/* Box 5: Rewards Paid (Order 6 for Mobile. Full width on mobile) */}
        <div className="bg-emerald-600 p-3 sm:p-6 rounded-xl sm:rounded-3xl shadow-xl flex flex-col items-center justify-center text-center text-white relative overflow-hidden col-span-2 lg:col-span-1 order-6 lg:order-5">
            <div className="absolute -right-2 -bottom-2 opacity-20 pointer-events-none"><DollarSign size={60} className="sm:w-16 sm:h-16" /></div>
            <p className="text-[8px] sm:text-[10px] font-black text-emerald-100 uppercase mb-0.5 sm:mb-1 tracking-widest relative z-10">Rewards Paid</p>
            <h2 className="text-xl sm:text-3xl font-black relative z-10">${rankRewardIncome}</h2>
        </div>

        {/* Box 6: Right Carry (Order 4) */}
        <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-3xl shadow-sm border border-gray-100 text-center border-r-4 border-r-purple-500 flex flex-col justify-center order-4 lg:order-6 col-span-1">
            <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase mb-1 sm:mb-2 tracking-widest">Right Carry</p>
            <h2 className="text-lg sm:text-2xl font-black text-purple-600">${rightVolume}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        
        {/* 🟢 NEXT MILESTONE PROGRESS CARD */}
        <div className="xl:col-span-1 bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
            <div className="text-center mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-100">
                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1 sm:mb-2">Goal Target</p>
                <h2 className="text-2xl sm:text-4xl font-black text-gray-900 uppercase my-1">{isMax ? '🏆 ALL RANKS CLEARED' : nextRank.name}</h2>
                {!isMax && (
                  <div className="inline-flex items-center gap-1 sm:gap-2 bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-black px-4 py-1.5 sm:px-5 sm:py-2 rounded-full mt-3 sm:mt-4 border border-green-100 uppercase tracking-widest">
                    <Zap size={12} className="sm:w-3.5 sm:h-3.5" fill="currentColor"/> Unlock Bonus: {nextRank.reward}
                  </div>
                )}
            </div>

            {!isMax && (
                <div className="space-y-6 sm:space-y-8 flex-1">
                    {/* LEFT LEG PROGRESS */}
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] sm:text-[11px] font-black text-blue-600 uppercase flex items-center gap-1.5 sm:gap-2"><ChevronLeft size={16} className="bg-blue-100 rounded-full p-0.5 sm:w-[18px] sm:h-[18px]"/> Left Business</span>
                            <span className="text-xs sm:text-sm font-black text-blue-700">{leftProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-blue-50 h-3 sm:h-4 rounded-full overflow-hidden border border-blue-100 shadow-inner p-0.5">
                            <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-1000 shadow-md" style={{ width: `${leftProgress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[8px] sm:text-[9px] font-black uppercase px-1">
                            <span className="text-gray-400">Achieved: ${leftDoneForLevel.toFixed(0)}</span>
                            <span className="text-blue-600">Target: ${targetForThisLevel}</span>
                        </div>
                        <div className="mt-2">
                            {leftNeeded === 0 ? 
                                <div className="text-center bg-green-50 text-green-600 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black border border-green-100">✓ LEFT LEG READY</div> : 
                                <div className="text-center text-[9px] sm:text-[10px] font-bold text-red-500 uppercase tracking-tighter">Required: <span className="text-xs sm:text-sm font-black">${leftNeeded.toFixed(0)}</span></div>
                            }
                        </div>
                    </div>

                    {/* RIGHT LEG PROGRESS */}
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] sm:text-[11px] font-black text-purple-600 uppercase flex items-center gap-1.5 sm:gap-2">Right Business <ChevronRight size={16} className="bg-purple-100 rounded-full p-0.5 sm:w-[18px] sm:h-[18px]"/></span>
                            <span className="text-xs sm:text-sm font-black text-purple-700">{rightProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-purple-50 h-3 sm:h-4 rounded-full overflow-hidden border border-purple-100 shadow-inner p-0.5">
                            <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full transition-all duration-1000 shadow-md" style={{ width: `${rightProgress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[8px] sm:text-[9px] font-black uppercase px-1">
                            <span className="text-gray-400">Achieved: ${rightDoneForLevel.toFixed(0)}</span>
                            <span className="text-purple-600">Target: ${targetForThisLevel}</span>
                        </div>
                        <div className="mt-2">
                            {rightNeeded === 0 ? 
                                <div className="text-center bg-green-50 text-green-600 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black border border-green-100">✓ RIGHT LEG READY</div> : 
                                <div className="text-center text-[9px] sm:text-[10px] font-bold text-red-500 uppercase tracking-tighter">Required: <span className="text-xs sm:text-sm font-black">${rightNeeded.toFixed(0)}</span></div>
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* 🟣 RANK MILESTONE TABLE */}
        <div className="xl:col-span-2 bg-white rounded-3xl sm:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-5 sm:p-8 border-b bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-xs sm:text-sm font-black text-gray-700 uppercase tracking-[0.2em] flex items-center gap-2 sm:gap-3">
                    <TrendingUp size={18} className="text-indigo-600 sm:w-5 sm:h-5" /> Reward Milestones
                </h3>
            </div>
            {/* MOBILE SCROLL FIX: Wrapper div added for overflow */}
            <div className="overflow-x-auto w-full custom-scroll">
                <table className="w-full text-left min-w-[450px]">
                    <thead>
                        <tr className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase border-b bg-gray-50/20">
                            <th className="p-4 sm:p-6 xl:p-8">Rank Name</th>
                            <th className="p-4 sm:p-6 xl:p-8">Match Target</th>
                            <th className="p-4 sm:p-6 xl:p-8">Reward</th>
                            <th className="p-4 sm:p-6 xl:p-8 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {RANKS.slice(1).map((r, i) => {
                            const achieved = totalMatchedVolume >= r.total;
                            return (
                                <tr key={i} className={`transition-all ${achieved ? 'bg-green-50/30' : 'hover:bg-gray-50/50'}`}>
                                    <td className="p-4 sm:p-6 xl:p-8 font-black text-gray-800 text-xs sm:text-sm">{r.name}</td>
                                    <td className="p-4 sm:p-6 xl:p-8 font-bold text-blue-600 text-xs sm:text-sm">${r.added}</td>
                                    <td className="p-4 sm:p-6 xl:p-8 font-black text-emerald-600 text-xs sm:text-sm">
                                      <div className="flex items-center gap-1"><DollarSign size={12} className="sm:w-3.5 sm:h-3.5"/> {r.reward.replace('$', '')}</div>
                                    </td>
                                    <td className="p-4 sm:p-6 xl:p-8 text-right">
                                        {achieved ? 
                                            <span className="text-[8px] sm:text-[9px] font-black text-green-600 bg-green-100 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-green-200 uppercase tracking-widest shadow-sm">ACHIEVED</span> : 
                                            <span className="text-[8px] sm:text-[9px] font-black text-gray-300 bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-gray-100 uppercase tracking-widest">LOCKED</span>
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatusPage;