import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { 
    LayoutList, Search, Filter, ArrowUpRight, ArrowDownLeft, 
    Calendar, CheckCircle, Clock, XCircle, RefreshCw, Loader2, History
} from "lucide-react";

const AllTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination & Search/Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const fetchAllHistory = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (!user?.userId) {
                setLoading(false);
                return;
            }
            const res = await api.post('/user/all-history', { userId: user.userId });
            setTransactions(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchAllHistory(); 
    }, []);

    // 🔥 SEARCH & FILTER LOGIC (Optimized)
    const filteredHistory = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return transactions.filter(tx => {
            const matchesType = typeFilter === "all" || tx.type === typeFilter;
            const matchesSearch = 
                tx.description?.toLowerCase().includes(s) || 
                tx.type?.toLowerCase().includes(s) ||
                tx.amount?.toString().includes(s);
            return matchesType && matchesSearch;
        });
    }, [searchTerm, typeFilter, transactions]);

    // Reset pagination on search/filter change
    useEffect(() => { setCurrentPage(1); }, [searchTerm, typeFilter]);

    // 📊 PAGINATION LOGIC
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentItems = filteredHistory.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredHistory.length / entriesPerPage) || 1;

    const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    const getStatusStyles = (status) => {
        const s = status?.toLowerCase() || 'pending';
        if (s === 'completed' || s === 'approved' || s === 'success') 
            return { icon: <CheckCircle size={14} />, classes: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
        if (s === 'pending') 
            return { icon: <Clock size={14} />, classes: 'bg-amber-50 text-amber-600 border-amber-200' };
        return { icon: <XCircle size={14} />, classes: 'bg-rose-50 text-rose-600 border-rose-200' };
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans bg-gray-50 min-h-screen">
            
            {/* 🔵 Header Area */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 sm:p-4 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100">
                        <LayoutList size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 uppercase tracking-tight">Global Logs</h2>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">Unified Transaction History</p>
                    </div>
                </div>
                
                <button 
                    onClick={fetchAllHistory} 
                    disabled={loading}
                    className={`flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-lg shadow-sm border border-indigo-100 text-sm font-semibold hover:bg-indigo-100 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
                </button>
            </div>

            {/* 🔍 SEARCH & FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by description, type or amount..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm sm:text-base text-gray-700 transition-colors"
                    />
                </div>
                <div className="relative w-full md:w-64">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium outline-none cursor-pointer hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-indigo-500 appearance-none"
                    >
                        <option value="all">All Types</option>
                        <option value="DEPOSIT">Deposits</option>
                        <option value="WITHDRAWAL">Withdrawals</option>
                        <option value="TRANSFER_SENT">Sent Funds</option>
                        <option value="TRANSFER_RECEIVED">Received Funds</option>
                        <option value="INCOME_REINVEST">Wallet Conversions</option>
                        <option value="PACKAGE_BUY">Package Purchases</option>
                        <option value="PACKAGE_ACTIVATION">Package Activations</option>
                    </select>
                </div>
                <select
                    value={entriesPerPage}
                    onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium outline-none cursor-pointer hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-indigo-500"
                >
                    <option value={10}>Show 10</option>
                    <option value={25}>Show 25</option>
                    <option value={50}>Show 50</option>
                    <option value={100}>Show 100</option>
                </select>
            </div>

            {/* 📊 Main Table Section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sr. No.</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date & Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Transaction Details</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-indigo-600" size={32} />
                                            <span className="text-sm font-medium text-gray-500">Fetching Logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <History size={40} className="text-gray-300" />
                                            <span className="text-sm font-medium text-gray-500">No records found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((tx, idx) => {
                                    const isCredit = tx.transactionType === 'credit';
                                    const statusStyle = getStatusStyles(tx.status);

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            
                                            {/* Sr. No. */}
                                            <td className="px-4 py-3 text-sm text-gray-500 font-medium whitespace-nowrap">
                                                {indexOfFirst + idx + 1}
                                            </td>

                                            {/* Date & Time */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Calendar size={12} className="text-gray-400" />
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Transaction Details */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg shrink-0 ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                        {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                                                            {tx.type ? tx.type.replace(/_/g, " ") : "Transaction"}
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-500 mt-0.5 line-clamp-1 max-w-[200px] sm:max-w-xs">
                                                            {tx.description || "N/A"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${statusStyle.classes}`}>
                                                    {statusStyle.icon}
                                                    <span>{tx.status || 'PENDING'}</span>
                                                </div>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <span className={`text-base font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {isCredit ? '+' : '-'}${Number(tx.amount || 0).toFixed(2)}
                                                </span>
                                            </td>

                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 📑 PAGINATION CONTROLS */}
            {!loading && filteredHistory.length > entriesPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                    <button 
                        onClick={handlePrev} 
                        disabled={currentPage === 1} 
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Previous
                    </button>
                    
                    <span className="text-sm font-medium text-gray-600">
                        Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredHistory.length)} of {filteredHistory.length}
                    </span>
                    
                    <button 
                        onClick={handleNext} 
                        disabled={currentPage === totalPages} 
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default AllTransactions;