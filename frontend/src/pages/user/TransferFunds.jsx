import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Search, Calendar, History } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function TransferHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        const id = user?.userId || user?._id || user?.id;
        if (!id) return;
        try {
            const res = await api.get(`/user/transfer-history/${id}`);
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, [user]);

    return (
        <div className="max-w-4xl mx-auto p-4 py-10 font-sans">
            <div className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                    <History size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-800 uppercase leading-none">P2P History</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sent & Received Funds</p>
                </div>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">Loading...</div>
                ) : history.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] text-gray-300 font-bold uppercase text-[10px] tracking-widest">No Transactions Yet</div>
                ) : (
                    history.map((item, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.type === 'TRANSFER_SENT' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                    {item.type === 'TRANSFER_SENT' ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-800 uppercase">{item.type === 'TRANSFER_SENT' ? 'Sent' : 'Received'}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(item.createdAt).toLocaleString('en-GB')}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-lg font-black ${item.type === 'TRANSFER_SENT' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {item.type === 'TRANSFER_SENT' ? '-' : '+'}${item.amount.toFixed(2)}
                                </p>
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">
                                    {item.type === 'TRANSFER_SENT' ? `To: ${item.toUserId}` : `From: ${item.fromUserId}`}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
export default TransferHistory;