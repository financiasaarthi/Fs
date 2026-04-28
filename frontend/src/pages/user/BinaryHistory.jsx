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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans bg-gray-50 min-h-screen">
      
      {/* 🔵 Header Section */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="bg-blue-600 p-2 sm:p-3 rounded-lg text-white shadow-sm">
          <TrendingUp size={24} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Matching History
          </h2>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
            Binary Pairs & Carry Forward Logs
          </p>
        </div>
      </div>

      {/* 📊 Table Container */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Match (L | R)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Vol Used</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Flushed</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Carry (L | R)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Income</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <span className="text-sm font-medium text-gray-500">Fetching Logs...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <History size={40} className="text-gray-300" />
                        <span className="text-sm font-medium text-gray-500">No Records Found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Date */}
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">
                      {new Date(record.createdAt || record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    
                    {/* Match L | R */}
                    <td className="px-4 py-3 text-sm text-center font-medium text-gray-500 whitespace-nowrap">
                      <span className="text-blue-600 font-bold">${record.leftBusiness || 0}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-purple-600 font-bold">${record.rightBusiness || 0}</span>
                    </td>
                    
                    {/* Volume Used */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">
                        ${record.matchedVolume || 0}
                      </span>
                    </td>
                    
                    {/* Flushed */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {record.flushedVolume > 0 ? (
                        <span className="inline-flex items-center justify-center gap-1 text-red-600 font-semibold text-xs bg-red-50 px-2 py-1 rounded-md border border-red-100">
                          <AlertCircle size={14} /> ${record.flushedVolume}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm font-medium">—</span>
                      )}
                    </td>
                    
                    {/* Carry L | R */}
                    <td className="px-4 py-3 text-sm text-center font-bold text-orange-600 whitespace-nowrap bg-orange-50/30">
                      {record.carryForwardLeft || 0} <span className="text-orange-200 mx-1">|</span> {record.carryForwardRight || 0}
                    </td>
                    
                    {/* Income */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-emerald-600">
                          +${Number(record.incomeEarned || 0).toFixed(2)}
                        </span>
                        {record.isCapped && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase mt-1">
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