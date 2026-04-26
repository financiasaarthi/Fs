import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

const WithdrawHistory = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/withdrawals/${user.userId}`);
        setHistory(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (user?.userId) fetchHistory();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 uppercase">
            <ArrowUpCircle className="text-orange-500" /> Cashout History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="p-5">Transaction Date</th>
                <th className="p-5">Wallet Type</th>
                <th className="p-5">Amount</th>
                <th className="p-5 text-right">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5 text-xs font-bold text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="p-5 font-black text-gray-700 uppercase text-xs">{item.walletType}</td>
                  <td className="p-5 font-black text-orange-600 text-lg">${item.amount}</td>
                  <td className="p-5 text-right">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full ${
                      item.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
                      item.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {item.status === 'PENDING' ? <Clock size={10}/> : item.status === 'SUCCESS' ? <CheckCircle size={10}/> : <XCircle size={10}/>}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WithdrawHistory;