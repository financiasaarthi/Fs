import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, History, Loader2, Calendar, Wallet } from 'lucide-react';
import api from '../../api/axios';
// 🟢 FIX 1: useAuth connect kiya
import { useAuth } from '../../context/AuthContext';

function TransferHistory() {
    // 🟢 FIX 2: Context se data aur token nikala
    const { user, token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        // 🎯 7-Digit Numeric userId logic
        const id = user?.userId; 
        if (!id || !token) return;

        try {
            setLoading(true);
            // ✅ Token header bhej rahe hain security ke liye
            const res = await api.get(`/user/transfer-history/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (err) {
            console.error("History fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Jab user ya token badle, tab history reload ho
    useEffect(() => { 
        fetchHistory(); 
    }, [user?.userId, token]);

    return (
        <div className="max-w-4xl mx-auto p-4 py-10 font-sans animate-in fade-in duration-700">
            
            {/* 🔵 Header Section */}
            <div className="mb-10 flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                        <History size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">P2P Logs</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Internal Fund Transfers</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <Wallet size={14} className="text-indigo-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase">User ID: {user?.userId}</span>
                </div>
            </div>

            {/* 📋 Transaction List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-24 text-center flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Fetching Transactions...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="py-24 text-center border-4 border-dashed border-gray-50 rounded-[3rem] flex flex-col items-center gap-4">
                        <div className="bg-gray-50 p-4 rounded-full text-gray-200">
                             <History size={40} />
                        </div>
                        <p className="text-gray-300 font-black uppercase text-[10px] tracking-[0.3em]">No Transactions Found</p>
                    </div>
                ) : (
                    history.map((item, idx) => {
                        const isSent = item.type === 'TRANSFER_SENT' || item.senderId === user?.userId;
                        
                        return (
                            <div key={item._id || idx} className="bg-white p-5 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center justify-between group hover:border-indigo-100 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-colors ${isSent ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                        {isSent ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-800 uppercase tracking-tight">
                                            {isSent ? 'Transfer Sent' : 'Fund Received'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar size={12} className="text-gray-300" />
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">
                                                {new Date(item.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className={`text-lg font-black tracking-tighter ${isSent ? 'text-red-500' : 'text-emerald-600'}`}>
                                        {isSent ? '-' : '+'}${Number(item.amount).toFixed(2)}
                                    </p>
                                    <div className="mt-1">
                                        <span className="text-[9px] font-black text-gray-300 bg-gray-50 px-2 py-0.5 rounded uppercase tracking-widest border border-gray-100">
                                            {isSent ? `To: ${item.receiverId || item.toUserId}` : `From: ${item.senderId || item.fromUserId}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 💡 Info Footer */}
            {!loading && history.length > 0 && (
                <p className="mt-10 text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
                    End of Transaction History
                </p>
            )}
        </div>
    );
}

export default TransferHistory;