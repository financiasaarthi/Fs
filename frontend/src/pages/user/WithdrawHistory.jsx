import React, { useState, useEffect } from 'react';
import api from "../../api/axios"; 
import { ArrowUpCircle, Clock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

const WithdrawHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem("user"));
            
            if (!user?.userId) {
                setError("User session not found.");
                return;
            }

            const res = await api.get(`/user/withdrawals/${user.userId}`);
            setHistory(res.data || []);
            setError("");
        } catch (err) {
            console.error("Withdraw Fetch Error:", err);
            setError("Failed to load cashout records.");
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const getStatusStyles = (status) => {
        const s = status?.toUpperCase() || 'PENDING';
        // 'APPROVED', 'SUCCESS', 'COMPLETED' teeno ko green karega
        if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'APPROVED') 
            return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (s === 'REJECTED' || s === 'CANCELLED') 
            return 'bg-rose-50 text-rose-600 border-rose-100';
        return 'bg-amber-50 text-amber-600 border-amber-100';
    };

    if (loading) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <Loader2 size={40} className="text-orange-500 animate-spin" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Loading History...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-100">
                            <ArrowUpCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Cashout History</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Withdrawal Logs</p>
                        </div>
                    </div>
                    <button onClick={fetchWithdrawals} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                         <Clock size={18} className="text-gray-400" />
                    </button>
                </div>

                {error ? (
                    <div className="py-20 text-center flex flex-col items-center gap-3">
                        <AlertCircle className="text-rose-400" size={40} />
                        <p className="text-xs font-black text-gray-400 uppercase">{error}</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">No transactions found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100">
                                    <th className="px-6 py-5">Date & Time</th>
                                    <th className="px-6 py-5">Gross</th>
                                    <th className="px-6 py-5">Fee</th>
                                    <th className="px-6 py-5">Net Payable</th>
                                    <th className="px-6 py-5">Wallet Address</th>
                                    <th className="px-6 py-5 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {history.map((item, idx) => {
                                    // 🟢 Backend chahe kisi bhi naam se data bheje, ye theek se pakad lega
                                    const gross = Number(item.grossAmount || item.gross || item.amount || 0);
                                    const fee = Number(item.fee || (gross * 0.10)); 
                                    const net = Number(item.netAmount || item.net || (gross - fee));
                                    const status = item.status || 'pending';

                                    return (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-all">
                                        <td className="px-6 py-6">
                                            <p className="text-xs font-black text-gray-700">{new Date(item.createdAt).toLocaleDateString('en-GB')}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(item.createdAt).toLocaleTimeString()}</p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-sm font-black text-gray-600">${gross.toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-sm font-bold text-red-500">-${fee.toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-lg font-black text-green-600">${net.toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <code className="bg-gray-100 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-200">
                                                    {item.walletAddress ? `${item.walletAddress.substring(0, 6)}...${item.walletAddress.slice(-4)}` : 'N/A'}
                                                </code>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(status)}`}>
                                                {status.toUpperCase() === 'PENDING' ? <Clock size={12} /> : 
                                                 (status.toUpperCase() === 'SUCCESS' || status.toUpperCase() === 'APPROVED' || status.toUpperCase() === 'COMPLETED') ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WithdrawHistory;