import React from 'react';
import { Award, Zap, Target, TrendingUp, DollarSign, BarChart3, ChevronRight, ChevronLeft } from 'lucide-react';
// 🟢 FIX 1: useAuth import kiya
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
  // 🟢 FIX 2: Props hata kar Context se user nikala
  const { user } = useAuth();

  const leftVolume = Number(user?.binaryBusiness?.leftVolume || 0);
  const rightVolume = Number(user?.binaryBusiness?.rightVolume || 0);
  const matchingIncome = Number(user?.wallets?.matchingIncome || 0);

  // Matching turnover calculation ($1 income = $10 business)
  const totalMatchedVolume = (matchingIncome * 10);

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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans bg-gray-50/30 min-h-screen animate-in fade-in duration-500">
      
      {/* 🔵 HEADER SECTION */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-800 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Award size={180} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 flex items-center gap-4">
              <Award size={48} className="text-yellow-400 drop-shadow-lg" /> Business Report
            </h1>
            <p className="text-blue-100 font-bold uppercase tracking-widest text-xs opacity-80">Track your network growth and rank status</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center min-w-[220px] shadow-inner">
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-2">Current Rank</p>
            <p className="text-4xl font-black text-yellow-400 uppercase tracking-tighter drop-shadow-md">{currentRank.name}</p>
          </div>
        </div>
      </div>

      {/* 🟠 SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 mb-3 group-hover:scale-110 transition-transform"><BarChart3 size={24} /></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Matched</p>
            <h2 className="text-3xl font-black text-gray-800">${totalMatchedVolume.toFixed(2)}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center border-l-4 border-l-blue-500">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Left Carry</p>
            <h2 className="text-2xl font-black text-blue-600">${leftVolume}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center border-r-4 border-r-purple-500">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Right Carry</p>
            <h2 className="text-2xl font-black text-purple-600">${rightVolume}</h2>
        </div>
        <div className="bg-emerald-600 p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-20"><DollarSign size={60} /></div>
            <p className="text-[10px] font-black text-emerald-100 uppercase mb-1 tracking-widest">Rewards Paid</p>
            <h2 className="text-3xl font-black">${user?.wallets?.rankReward || 0}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 🟢 NEXT MILESTONE PROGRESS CARD */}
        <div className="xl:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
            <div className="text-center mb-8 pb-8 border-b border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Goal Target</p>
                <h2 className="text-4xl font-black text-gray-900 uppercase my-1">{isMax ? '🏆 ALL RANKS CLEARED' : nextRank.name}</h2>
                {!isMax && (
                  <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-[10px] font-black px-5 py-2 rounded-full mt-4 border border-green-100 uppercase tracking-widest">
                    <Zap size={14} fill="currentColor"/> Unlock Bonus: {nextRank.reward}
                  </div>
                )}
            </div>

            {!isMax && (
                <div className="space-y-8 flex-1">
                    {/* LEFT LEG PROGRESS */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-black text-blue-600 uppercase flex items-center gap-2"><ChevronLeft size={18} className="bg-blue-100 rounded-full p-0.5"/> Left Business</span>
                            <span className="text-sm font-black text-blue-700">{leftProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-blue-50 h-4 rounded-full overflow-hidden border border-blue-100 shadow-inner p-0.5">
                            <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-1000 shadow-md" style={{ width: `${leftProgress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase px-1">
                            <span className="text-gray-400">Achieved: ${leftDoneForLevel.toFixed(0)}</span>
                            <span className="text-blue-600">Target: ${targetForThisLevel}</span>
                        </div>
                        <div className="mt-2">
                            {leftNeeded === 0 ? 
                                <div className="text-center bg-green-50 text-green-600 py-2 rounded-xl text-[10px] font-black border border-green-100">✓ LEFT LEG READY</div> : 
                                <div className="text-center text-[10px] font-bold text-red-500 uppercase tracking-tighter">Required: <span className="text-sm font-black">${leftNeeded.toFixed(0)}</span></div>
                            }
                        </div>
                    </div>

                    {/* RIGHT LEG PROGRESS */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-black text-purple-600 uppercase flex items-center gap-2">Right Business <ChevronRight size={18} className="bg-purple-100 rounded-full p-0.5"/></span>
                            <span className="text-sm font-black text-purple-700">{rightProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-purple-50 h-4 rounded-full overflow-hidden border border-purple-100 shadow-inner p-0.5">
                            <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full transition-all duration-1000 shadow-md" style={{ width: `${rightProgress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase px-1">
                            <span className="text-gray-400">Achieved: ${rightDoneForLevel.toFixed(0)}</span>
                            <span className="text-purple-600">Target: ${targetForThisLevel}</span>
                        </div>
                        <div className="mt-2">
                            {rightNeeded === 0 ? 
                                <div className="text-center bg-green-50 text-green-600 py-2 rounded-xl text-[10px] font-black border border-green-100">✓ RIGHT LEG READY</div> : 
                                <div className="text-center text-[10px] font-bold text-red-500 uppercase tracking-tighter">Required: <span className="text-sm font-black">${rightNeeded.toFixed(0)}</span></div>
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* 🟣 RANK MILESTONE TABLE */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-[0.2em] flex items-center gap-3">
                    <TrendingUp size={20} className="text-indigo-600" /> Reward Milestones
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase border-b bg-gray-50/20">
                            <th className="p-8">Rank Name</th>
                            <th className="p-8">Match Target</th>
                            <th className="p-8">Reward</th>
                            <th className="p-8 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {RANKS.slice(1).map((r, i) => {
                            const achieved = totalMatchedVolume >= r.total;
                            return (
                                <tr key={i} className={`transition-all ${achieved ? 'bg-green-50/30' : 'hover:bg-gray-50/50'}`}>
                                    <td className="p-8 font-black text-gray-800 text-sm">{r.name}</td>
                                    <td className="p-8 font-bold text-blue-600 text-sm">${r.added}</td>
                                    <td className="p-8 font-black text-emerald-600 text-sm">
                                      <div className="flex items-center gap-1"><DollarSign size={14}/> {r.reward.replace('$', '')}</div>
                                    </td>
                                    <td className="p-8 text-right">
                                        {achieved ? 
                                            <span className="text-[9px] font-black text-green-600 bg-green-100 px-4 py-2 rounded-xl border border-green-200 uppercase tracking-widest shadow-sm">ACHIEVED</span> : 
                                            <span className="text-[9px] font-black text-gray-300 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 uppercase tracking-widest">LOCKED</span>
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