import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, TrendingUp, AlertCircle } from 'lucide-react';

const BinaryHistory = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/binary/history/${user.userId}`);
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to load binary history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user.userId]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 p-3 rounded-lg text-white">
          <TrendingUp size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-800">Binary Matching History</h1>
          <p className="text-gray-500 font-medium text-sm">Track your daily pairs, flushes, and carry forward</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-bold">
                <th className="p-4 border-b">Date</th>
                <th className="p-4 border-b text-center">Business (L | R)</th>
                <th className="p-4 border-b text-center text-blue-600">Matched</th>
                <th className="p-4 border-b text-center text-red-500">Flushed</th>
                <th className="p-4 border-b text-center text-orange-500">Carry Forward (L|R)</th>
                <th className="p-4 border-b text-right text-green-600">Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-500 font-semibold">Loading data...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-500 font-semibold">No binary matching records yet.</td></tr>
              ) : (
                history.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                      {new Date(record.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4 text-sm text-center font-medium text-gray-600">
                      ${record.leftBusiness} | ${record.rightBusiness}
                    </td>
                    <td className="p-4 text-sm text-center font-bold text-blue-600">
                      ${record.matchedVolume}
                    </td>
                    <td className="p-4 text-sm text-center font-bold text-red-500">
                      {record.flushedVolume > 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <AlertCircle size={14} /> ${record.flushedVolume}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-sm text-center font-medium text-orange-500">
                      ${record.carryForwardLeft} | ${record.carryForwardRight}
                    </td>
                    <td className="p-4 text-sm text-right font-black text-green-600">
                      ${record.incomeEarned.toFixed(2)}
                      {record.isCapped && <span className="block text-[10px] text-red-500 font-bold uppercase mt-1">Capped Limit</span>}
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