import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, AlertCircle, Calendar, Loader2, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const BinaryHistory = () => {
  const { user, token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.userId) return;
      
      try {
        setLoading(true);
        // Ensure ye route backend me bana ho!
        const res = await axios.get(`/api/user/binary-history/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to load binary history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.userId, token]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-700">
      
      {/* 🔵 Header Section */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <TrendingUp size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Matching History</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Binary Pairs & Carry Forward Logs</p>
          </div>
        </div>
      </div>

      {/* 📊 Table Container */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-100">
                <th className="p-4 sm:p-6">Date</th>
                <th className="p-4 sm:p-6 text-center">Match (L | R)</th>
                <th className="p-4 sm:p-6 text-center text-blue-600">Vol Used</th>
                <th className="p-4 sm:p-6 text-center text-red-500">Flushed</th>
                <th className="p-4 sm:p-6 text-center text-orange-500">Carry (L | R)</th>
                <th className="p-4 sm:p-6 text-right text-emerald-600">Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Fetching Logs...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                        <History size={48} className="text-gray-400" />
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">No Records Found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((record, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 sm:p-6 text-[10px] sm:text-xs font-black text-gray-800 whitespace-nowrap uppercase">
                      {/* 🟢 FIX: createdAt use kiya */}
                      {new Date(record.createdAt || record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 sm:p-6 text-[10px] sm:text-xs text-center font-bold text-gray-500">
                      <span className="text-blue-600">${record.leftBusiness || 0}</span>
                      <span className="mx-2 text-gray-200">|</span>
                      <span className="text-purple-600">${record.rightBusiness || 0}</span>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black border border-blue-100">
                        ${record.matchedVolume || 0}
                      </span>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      {record.flushedVolume > 0 ? (
                        <span className="flex items-center justify-center gap-1 text-red-500 font-black text-[10px] sm:text-xs">
                          <AlertCircle size={12} /> ${record.flushedVolume}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-[10px] font-bold">—</span>
                      )}
                    </td>
                    <td className="p-4 sm:p-6 text-[10px] sm:text-xs text-center font-black text-orange-500 italic">
                      {record.carryForwardLeft || 0} <span className="text-gray-300">|</span> {record.carryForwardRight || 0}
                    </td>
                    <td className="p-4 sm:p-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs sm:text-sm font-black text-emerald-600">
                          +${Number(record.incomeEarned || 0).toFixed(2)}
                        </span>
                        {record.isCapped && (
                          <span className="text-[8px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-black uppercase mt-1 border border-red-100">
                            Daily Cap Hit
                          </span>
                        )}
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

export default BinaryHistory;