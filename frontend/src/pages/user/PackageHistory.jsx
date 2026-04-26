import React, { useState, useEffect } from 'react';
import { Package, Calendar, CheckCircle, ArrowLeftCircle, RefreshCcw, Zap, User, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function PackageHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // 🟢 BACKUP PLAN: Agar Context (user) dhokha de de, toh direct Local Storage se uthao
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const activeUser = user || localUser; // Jo bhi mil jaye, usey active maan lo

    console.log("🔥 ACTIVE USER:", activeUser);

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = async () => {
        // 🟢 FIX: Ab 'activeUser' ka use karo
        const currentUserId = activeUser?.userId || activeUser?._id || activeUser?.id; 
        
        if (!currentUserId) {
             console.warn("⚠️ User ID abhi bhi nahi mili...");
             setLoading(false);
             return; 
        }
        
        setLoading(true);
        setError(null);
        try {
            console.log(`🚀 Fetching history for user ID: ${currentUserId}`);
            const res = await api.get(`/user/my-package-history/${currentUserId}`);
            console.log("✅ History Response:", res.data);
            
            setHistory(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("❌ Error loading package history:", err);
            setError("Failed to load history. Please try again.");
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 🟢 FIX: Yahan bhi activeUser check karo
        const currentUserId = activeUser?.userId || activeUser?._id || activeUser?.id;
        
        if (currentUserId) {
            fetchHistory();
        } else {
            setLoading(false); 
        }
    }, [user]); // user update hone par dobara chalega

    // Helper: Package ke benefits dikhane ke liye
    const getPackageInfo = (amount) => {
        if (amount >= 100) return { tasks: 30, cap: '3x' };
        if (amount >= 50) return { tasks: 20, cap: '2.5x' };
        return { tasks: 10, cap: '2x' };
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 pb-20 font-sans">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="flex items-center text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-emerald-600 transition-all"
                >
                    <ArrowLeftCircle size={18} className="mr-2" /> Back to Home
                </button>

                <div className="text-center">
                    <h2 className="text-3xl font-black text-gray-800 uppercase tracking-[0.1em]">Activation Records</h2>
                    <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-widest">History of your investments & gifts</p>
                </div>

                <button 
                    onClick={fetchHistory}
                    disabled={loading}
                    className={`flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                    <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            {/* 🟢 Main History Section */}
            <div className="grid grid-cols-1 gap-4">
                {error ? (
                     <div className="py-20 text-center bg-red-50 rounded-[2.5rem] border border-red-100">
                        <p className="font-bold text-red-500">{error}</p>
                        <button onClick={fetchHistory} className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold uppercase">Retry</button>
                    </div>
                ) : loading ? (
                    <div className="py-20 text-center bg-white rounded-[2.5rem] border border-gray-50">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-bold text-gray-300 uppercase text-[10px] tracking-[0.2em]">Fetching Records...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <Package size={40} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">No Packages Found</p>
                    </div>
                ) : (
                    history.map((item, idx) => {
                        const info = getPackageInfo(item.amount);
                        
                        const isGiftedToOthers = item.type === 'PACKAGE_BUY';
                        // Use current user ID for comparison
                        const currentUserId = user?.userId || user?._id || user?.id;
                        const isReceivedFromOthers = item.type === 'PACKAGE_ACTIVATION' && item.fromUserId && item.fromUserId !== currentUserId;
                        const isSelfBuy = item.type === 'PACKAGE_ACTIVATION' && (!item.fromUserId || item.fromUserId === currentUserId);

                        return (
                            <div 
                                key={idx} 
                                className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-emerald-200 transition-all group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-8 px-3 py-1 rounded-b-lg text-[9px] font-black uppercase tracking-widest text-white shadow-sm ${
                                    isGiftedToOthers ? 'bg-blue-500' : isReceivedFromOthers ? 'bg-purple-500' : 'bg-emerald-500'
                                }`}>
                                    {isGiftedToOthers ? 'Gifted to Friend' : isReceivedFromOthers ? 'Received as Gift' : 'Self Purchase'}
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${
                                        isGiftedToOthers ? 'bg-blue-50 text-blue-600' : isReceivedFromOthers ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                                    }`}>
                                        <Zap size={30} fill="currentColor" fillOpacity={0.2} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-800 uppercase leading-none">${item.amount} Package</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="flex items-center gap-1 text-[10px] font-black text-gray-400">
                                                <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString('en-GB')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 w-full md:w-auto bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                    {isGiftedToOthers ? (
                                        <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                                            <UserPlus size={14} /> Activated For ID: {item.toUserId || item.description.match(/\d+/)?.[0] || 'Unknown'}
                                        </div>
                                    ) : isReceivedFromOthers ? (
                                        <div className="flex items-center gap-2 text-purple-600 text-[10px] font-black uppercase tracking-wider">
                                            <User size={14} /> Paid By ID: {item.fromUserId || item.description.match(/\d+/)?.[0] || 'Unknown'}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                                            <CheckCircle size={14} /> Active on Account
                                        </div>
                                    )}
                                    <p className="text-[9px] font-bold text-gray-400 text-center uppercase">{info.tasks} Tasks/Day • {info.cap} Capping</p>
                                </div>

                                <div className="text-right w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Amount</p>
                                    <p className={`text-3xl font-black leading-none ${isGiftedToOthers ? 'text-red-500' : 'text-emerald-500'}`}>
                                        <span className="text-sm mr-1">{isGiftedToOthers ? '-' : '+'}$</span>
                                        {Number(item.amount).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default PackageHistory;