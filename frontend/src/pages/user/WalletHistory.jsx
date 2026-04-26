import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Wallet, ArrowUpRight, ArrowDownLeft, Search, Filter, Calendar, RefreshCw } from "lucide-react";

const WalletHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem("user");
            const parsedUser = JSON.parse(userStr);
            const res = await api.get(`/user/wallet-history/${parsedUser.userId}`);
            
            // Running balance logic (Oldest to Newest calculation)
            let sorted = [...res.data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            let runningBalance = 0;
            const withBalance = sorted.map(tx => {
                const amount = Number(tx.amount);
                if (tx.transactionType === 'credit') runningBalance += amount;
                else runningBalance -= amount;
                return { ...tx, runningBalance };
            });

            setTransactions(withBalance.reverse()); // Latest first for display
        } catch (err) {
            setError("Failed to load history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const filtered = transactions.filter(tx => {
        const matchesType = typeFilter === "all" || tx.type === typeFilter;
        const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             tx.type?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = filtered.slice(indexOfFirst, indexOfLast);

    if (loading) return <div className="p-10 text-center animate-pulse font-black text-gray-400">LOADING WALLET LOGS...</div>;

    return (
        <div className="p-4 sm:p-6 bg-white min-h-screen rounded-[2.5rem] shadow-sm border border-gray-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 flex items-center uppercase tracking-tighter">
                        <Wallet className="mr-2 text-indigo-600" size={28} /> Main Wallet Logs
                    </h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">All credits & debits from top-up wallet</p>
                </div>
                <button onClick={fetchHistory} className="p-2 bg-gray-50 rounded-xl hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-all">
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-300" size={18} />
                    <input 
                        type="text" placeholder="Search transactions..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-bold"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-3 text-gray-300" size={18} />
                    <select 
                        value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white outline-none appearance-none font-bold text-sm"
                    >
                        <option value="all">All Transactions</option>
                        <option value="INCOME_REINVEST">Income Conversion</option>
                        <option value="TRANSFER_SENT">Sent (P2P)</option>
                        <option value="TRANSFER_RECEIVED">Received (P2P)</option>
                        <option value="WITHDRAWAL">Withdrawal</option>
                        <option value="PACKAGE_ACTIVATION">Package Activation</option>
                    </select>
                </div>
            </div>

            {/* Desktop Table / Mobile Cards */}
            <div className="overflow-hidden rounded-3xl border border-gray-50 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Transaction Details</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Running Balance</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        {currentItems.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.transactionType === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                        {tx.transactionType === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-xs font-black text-gray-800 uppercase leading-none mb-1">
                                        {tx.type.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 italic max-w-xs truncate">{tx.description}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-sm font-black ${tx.transactionType === 'credit' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {tx.transactionType === 'credit' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-black text-gray-700">
                                    ${tx.runningBalance.toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-[10px] font-black text-gray-500 uppercase">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    <p className="text-[9px] font-bold text-gray-300">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="py-20 text-center text-gray-300 font-black uppercase text-[10px] tracking-[0.3em]">No Transactions Found</div>
                )}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-gray-400 uppercase">Page {currentPage} of {Math.ceil(filtered.length / itemsPerPage)}</span>
                <div className="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-4 py-2 border border-gray-100 rounded-xl text-[10px] font-black uppercase hover:bg-gray-50 disabled:opacity-30 transition-all"
                    >
                        Prev
                    </button>
                    <button 
                        disabled={indexOfLast >= filtered.length}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase hover:shadow-lg disabled:opacity-30 transition-all"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletHistory;