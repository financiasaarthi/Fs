import React from 'react';
import { Award, Zap, Target, TrendingUp, DollarSign, BarChart3, ChevronRight, ChevronLeft } from 'lucide-react';

const RANKS = [
  { name: 'None',     added: 0,     total: 0,     reward: '$0' },
  { name: 'Bronze',   added: 100,   total: 100,   reward: '$20' },
  { name: 'Silver',   added: 500,   total: 600,   reward: '$50' },
  { name: 'Gold',     added: 1000,  total: 1600,  reward: '$100' },
  { name: 'Platinum', added: 2500,  total: 4100,  reward: '$300' },
  { name: 'Diamond',  added: 5000,  total: 9100,  reward: '$1000' },
  { name: 'Ruby',     added: 10000, total: 19100, reward: '$1500' }
];

const NetworkStatusPage = ({ user }) => {
  const leftVolume = Number(user?.binaryBusiness?.leftVolume || 0);
  const rightVolume = Number(user?.binaryBusiness?.rightVolume || 0);
  const matchingIncome = Number(user?.wallets?.matchingIncome || 0);

  const totalMatchedVolume = (matchingIncome * 10);

  // Current Rank Index dhundho
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

  // ==========================================
  // 🟢 SMART LEG-BY-LEG CALCULATION
  // ==========================================
  const targetForThisLevel = isMax ? 0 : nextRank.added; 
  const matchedInThisLevel = isMax ? 0 : Math.max(0, totalMatchedVolume - currentRank.total);
  const shortfall = isMax ? 0 : targetForThisLevel - matchedInThisLevel; // Kitna aur MATCH karna hai

  // Left aur Right ke liye kitna aur chahiye (Pending volume ko minus karke)
  const leftNeeded = isMax ? 0 : Math.max(0, shortfall - leftVolume);
  const rightNeeded = isMax ? 0 : Math.max(0, shortfall - rightVolume);

  // Left aur Right ne is level ke liye kitna contribute kar diya
  const leftDoneForLevel = targetForThisLevel - leftNeeded;
  const rightDoneForLevel = targetForThisLevel - rightNeeded;

  const leftProgress = isMax ? 100 : Math.min((leftDoneForLevel / targetForThisLevel) * 100, 100);
  const rightProgress = isMax ? 100 : Math.min((rightDoneForLevel / targetForThisLevel) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans bg-gray-50/30">
      
      {/* HEADER CARD */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Award size={150} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
              <Award size={40} className="text-yellow-400" /> Rank & Rewards
            </h1>
            <p className="text-blue-100 font-medium">Track your left and right business requirements for the next rank.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center min-w-[200px]">
            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Current Status</p>
            <p className="text-3xl font-black text-yellow-400 uppercase">{currentRank.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Total Matching Turnover */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <BarChart3 size={24} className="text-blue-600 mb-2" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Matching</p>
            <h2 className="text-3xl font-black text-gray-800">${totalMatchedVolume.toFixed(2)}</h2>
        </div>
        {/* Left & Right Pending */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center border-l-4 border-l-blue-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Left Available</p>
            <h2 className="text-2xl font-black text-gray-800">${leftVolume}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center border-r-4 border-r-purple-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Right Available</p>
            <h2 className="text-2xl font-black text-gray-800">${rightVolume}</h2>
        </div>
        {/* Current Reward Wallet */}
        <div className="bg-emerald-600 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center text-white">
            <DollarSign size={20} className="mb-1" />
            <p className="text-[10px] font-bold text-emerald-100 uppercase mb-1">Rewards Won</p>
            <h2 className="text-3xl font-black">${user?.wallets?.rankReward || 0}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* 🟢 ADVANCED MISSION CARD (Left vs Right Focus) */}
        <div className="xl:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
            <div className="text-center mb-6 pb-6 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Next Milestone</p>
                <h2 className="text-3xl font-black text-gray-800 uppercase my-1">{isMax ? 'ALL RANKS CLEARED' : nextRank.name}</h2>
                {!isMax && <span className="inline-block bg-green-100 text-green-700 text-xs font-black px-4 py-1.5 rounded-full mt-2">BONUS: {nextRank.reward}</span>}
            </div>

            {!isMax && (
                <div className="space-y-6 flex-1">
                    {/* LEFT LEG PROGRESS */}
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black text-blue-600 uppercase flex items-center gap-1"><ChevronLeft size={16}/> Left Leg Status</span>
                            <span className="text-[10px] font-bold text-gray-500">{leftProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-blue-100 h-3 rounded-full overflow-hidden mb-2">
                            <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${leftProgress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase mt-1">
                            <span className="text-gray-500">Done: ${leftDoneForLevel.toFixed(0)}</span>
                            <span className="text-blue-600">Target: ${targetForThisLevel}</span>
                        </div>
                        <div className="mt-3 text-center">
                            {leftNeeded === 0 ? 
                                <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-md">✓ LEFT LEG COMPLETE</span> : 
                                <span className="text-[11px] font-bold text-red-500">Need <span className="font-black">${leftNeeded.toFixed(0)}</span> more</span>
                            }
                        </div>
                    </div>

                    {/* RIGHT LEG PROGRESS */}
                    <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black text-purple-600 uppercase flex items-center gap-1">Right Leg Status <ChevronRight size={16}/></span>
                            <span className="text-[10px] font-bold text-gray-500">{rightProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-purple-100 h-3 rounded-full overflow-hidden mb-2">
                            <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: `${rightProgress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase mt-1">
                            <span className="text-gray-500">Done: ${rightDoneForLevel.toFixed(0)}</span>
                            <span className="text-purple-600">Target: ${targetForThisLevel}</span>
                        </div>
                        <div className="mt-3 text-center">
                            {rightNeeded === 0 ? 
                                <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-md">✓ RIGHT LEG COMPLETE</span> : 
                                <span className="text-[11px] font-bold text-red-500">Need <span className="font-black">${rightNeeded.toFixed(0)}</span> more</span>
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* 🟢 REWARD TABLE */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500" /> Reward Milestones
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase border-b">
                            <th className="p-6">Rank</th>
                            <th className="p-6">Matching Target</th>
                            <th className="p-6">Bonus</th>
                            <th className="p-6 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {RANKS.slice(1).map((r, i) => {
                            const achieved = totalMatchedVolume >= r.total;
                            return (
                                <tr key={i} className={`transition-colors ${achieved ? 'bg-green-50/20' : ''}`}>
                                    <td className="p-6 font-black text-gray-700 text-sm">{r.name}</td>
                                    <td className="p-6 font-bold text-blue-600 text-sm">${r.added}</td>
                                    <td className="p-6 font-black text-emerald-600 text-sm">{r.reward}</td>
                                    <td className="p-6 text-right">
                                        {achieved ? 
                                            <span className="text-[10px] font-black text-green-600 bg-green-100 px-3 py-1.5 rounded-xl border border-green-200">ACHIEVED</span> : 
                                            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">LOCKED</span>
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