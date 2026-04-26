import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { 
    LayoutList, Search, Filter, ArrowUpRight, ArrowDownLeft, 
    Calendar, CheckCircle, Clock, XCircle, Download 
} from "lucide-react";

const AllTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const fetchAllHistory = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem("user"));
            const res = await api.post('/user/all-history', { userId: user.userId });
            setTransactions(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllHistory(); }, []);

    // 🔍 Real-time Filtering
    useEffect(() => {
        const results = transactions.filter(tx => {
            const matchesType = typeFilter === "all" || tx.type === typeFilter;
            const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 tx.type?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesType && matchesSearch;
        });
        setFiltered(results);
    }, [searchTerm, typeFilter, transactions]);

    const getStatusIcon = (status) => {
        if (status === 'completed' || status === 'approved') return <CheckCircle size={14} className="text-emerald-500" />;
        if (status === 'pending') return <Clock size={14} className="text-amber-500" />;
        return <XCircle size={14} className="text-rose-500" />;
    };

    if (loading) return <div className="p-20 text-center font-black text-gray-300 animate-pulse">FETCHING ALL RECORDS...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-20">
            {/* Header Area */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                        <LayoutList size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Global Logs</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unified Transaction History</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button onClick={fetchAllHistory} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                        <Download size={20} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white p-4 rounded-3xl border border-gray-50 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <input 
                        type="text" placeholder="Search by description or type..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <select 
                        value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none outline-none appearance-none font-bold text-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="DEPOSIT">Deposits</option>
                        <option value="WITHDRAWAL">Withdrawals</option>
                        <option value="TRANSFER_SENT">Sent Funds</option>
                        <option value="TRANSFER_RECEIVED">Received Funds</option>
                        <option value="INCOME_REINVEST">Wallet Conversions</option>
                        <option value="PACKAGE_BUY">Package Purchases</option>
                    </select>
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="py-20 text-center text-gray-300 font-black uppercase text-xs tracking-widest">No matching records found</div>
                ) : (
                    filtered.map((tx, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-indigo-100 transition-all">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tx.transactionType === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                    {tx.transactionType === 'credit' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-gray-800 uppercase leading-none">{tx.type.replace(/_/g, " ")}</p>
                                        <span className="flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 bg-gray-50 rounded-full text-gray-400">
                                            {getStatusIcon(tx.status)} {tx.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">{tx.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between w-full md:w-auto md:gap-10 border-t md:border-t-0 pt-3 md:pt-0">
                                <div className="text-left md:text-right">
                                    <p className="text-[9px] font-black text-gray-300 uppercase">Timestamp</p>
                                    <p className="text-[10px] font-bold text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-gray-300 uppercase">Amount</p>
                                    <p className={`text-xl font-black ${tx.transactionType === 'credit' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {tx.transactionType === 'credit' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AllTransactions;