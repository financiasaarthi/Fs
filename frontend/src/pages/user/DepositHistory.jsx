import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownCircle, Search } from 'lucide-react';

const DepositHistory = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/api/users/deposit-history/${user.userId}`);
        setHistory(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (user?.userId) fetchHistory();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <ArrowDownCircle className="text-green-500" /> DEPOSIT HISTORY
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="p-5">Date</th>
                <th className="p-5">Method</th>
                <th className="p-5">Amount</th>
                <th className="p-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5 text-xs font-bold text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="p-5 font-black text-gray-700">Demo/Manual</td>
                  <td className="p-5 font-black text-green-600 text-lg">${item.amount}</td>
                  <td className="p-5 text-right">
                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full">SUCCESS</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && !loading && <p className="p-10 text-center text-gray-400 font-bold uppercase">No records found</p>}
        </div>
      </div>
    </div>
  );
};

export default DepositHistory;