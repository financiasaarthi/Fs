import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Calendar, Loader2, History, DollarSign, TrendingUp, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const DirectIncomeHistory = () => {
  const { user, token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Total Direct Income from Context
  const totalDirectIncome = user?.wallets?.directIncome || 0;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.userId) return;
      
      try {
        setLoading(true);
        // Backend API call for direct income
      
        // Dhyan se dekho, yahan Backtick (`) use hua hai
const res = await axios.get(`/api/user/direct-income/${user.userId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to load direct income history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.userId, token]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-700">
      
      {/* 🔵 Header Section */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-6 sm:p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Users size={150} />
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30">
            <Users size={28} className="text-blue-100" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Direct Bonus</h1>
            <p className="text-[10px] sm:text-xs text-blue-200 font-bold uppercase tracking-widest mt-1">Your Referral Earnings Log</p>
          </div>
        </div>

        {/* Total Earned Card in Header */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center min-w-[200px] w-full md:w-auto shadow-inner">
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Total Direct Income</p>
            <h2 className="text-3xl font-black text-yellow-400 drop-shadow-md">
              ${Number(totalDirectIncome).toFixed(2)}
            </h2>
        </div>
      </div>

      {/* 📊 Table Container */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto custom-scroll w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 text-[10px] sm:text-xs uppercase tracking-[0.15em] font-black border-b border-gray-100">
                <th className="p-4 sm:p-6">Date & Time</th>
                <th className="p-4 sm:p-6">From User ID</th>
                <th className="p-4 sm:p-6">Description</th>
                <th className="p-4 sm:p-6 text-right text-emerald-600">Earned Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Records...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                        <History size={48} className="text-gray-400" />
                        <span className="text-sm font-black text-gray-500 uppercase tracking-widest">No Direct Referrals Yet</span>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((record, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                    
                    {/* Date Column */}
                    <td className="p-4 sm:p-6 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-black text-gray-800 uppercase">
                                {new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">
                                {new Date(record.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </td>

                    {/* From User Column */}
                    <td className="p-4 sm:p-6">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-1.5 rounded-lg">
                            <ArrowDownLeft size={16} className="text-blue-600" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                            ID: {record.fromUserId || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Description Column */}
                    <td className="p-4 sm:p-6">
                        <span className="text-[11px] sm:text-xs font-bold text-gray-500">
                            {record.description || "Direct referral bonus"}
                        </span>
                    </td>

                    {/* Amount Column */}
                    <td className="p-4 sm:p-6 text-right">
                      <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
                        <span className="text-sm sm:text-base font-black">
                          +${Number(record.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DirectIncomeHistory;