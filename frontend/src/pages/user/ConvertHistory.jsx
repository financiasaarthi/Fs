import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeftCircle, History, Calendar, Wallet, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function ConvertHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        const currentUserId = user?.userId || user?._id || user?.id;
        if (!currentUserId) return;

        try {
            setLoading(true);
            const res = await api.get(`/user/convert-history/${currentUserId}`);
            setHistory(res.data);
        } catch (err) {
            console.error("Error fetching conversion history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 pb-20 font-sans">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="flex items-center text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-emerald-600 transition-all"
                >
                    <ArrowLeftCircle size={18} className="mr-2" /> Back to Home
                </button>

                <div className="text-center">
                    <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Conversion Logs</h2>
                    <p className="text-emerald-500 text-[10px] font-bold mt-1 uppercase tracking-[0.2em]">Income to Main Wallet History</p>
                </div>

                <button 
                    onClick={fetchHistory}
                    className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-emerald-500 transition-colors"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* History List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-black text-gray-300 uppercase text-[10px] tracking-widest">Loading Records...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <History size={40} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">No Conversions Found</p>
                    </div>
                ) : (
                    history.map((item, idx) => (
                        <div 
                            key={idx} 
                            className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-50 p-6 flex items-center justify-between group hover:border-emerald-200 transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Wallet size={26} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-800 uppercase leading-none">Wallet Credit</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                                            <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString('en-GB')}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                                            <CheckCircle size={12} /> Success
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Amount Added</p>
                                <p className="text-2xl font-black text-emerald-600 leading-none">
                                    <span className="text-sm mr-0.5">+$</span>
                                    {Number(item.amount).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ConvertHistory;