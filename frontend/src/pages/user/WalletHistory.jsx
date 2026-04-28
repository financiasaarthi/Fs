import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { Wallet, ArrowUpRight, ArrowDownLeft, Search, Filter, Calendar, RefreshCw, Loader2, History } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // 🟢 Added useAuth for consistency

const WalletHistory = () => {
    const { user, token } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10); // 🟢 Dynamic Entries

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError("");
            
            // Backup logic for user ID
            const currentUserId = user?.userId || JSON.parse(localStorage.getItem("user"))?.userId;
            
            if (!currentUserId) {
                setError("User ID not found.");
                setLoading(false);
                return;
            }

            const res = await api.get(`/user/wallet-history/${currentUserId}`, {
                headers: { Authorization: `Bearer ${token}` } // Added token for security
            });
            
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
            console.error("Failed to load wallet history:", err);
            setError("Failed to load history. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchHistory(); 
    }, [user?.userId, token]);

    // 🔥 Filter Logic (Memoized for performance)
    const filtered = useMemo(() => {
        return transactions.filter(tx => {
            const matchesType = typeFilter === "all" || tx.type === typeFilter;
            const matchesSearch = 
                tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.amount?.toString().includes(searchTerm);
            return matchesType && matchesSearch;
        });
    }, [transactions, typeFilter, searchTerm]);

    // Reset pagination when filters change
    useEffect(() => { setCurrentPage(1); }, [searchTerm, typeFilter]);

    // 📊 Pagination calculations
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentItems = filtered.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filtered.length / entriesPerPage) || 1;

    const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    // Helper function to format type nicely
    const formatType = (type) => {
        return type.replace(/_/g, " ");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans bg-gray-50 min-h-screen">
            
            {/* 🔵 Header Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 sm:p-4 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100">
                        <Wallet size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 uppercase tracking-tight">Main Wallet Logs</h2>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">All credits & debits from your top-up wallet</p>
                    </div>
                </div>

                <button 
                    onClick={fetchHistory}
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
                        placeholder="Search by description or amount..." 
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
                        <option value="all">All Transactions</option>
                        <option value="INCOME_REINVEST">Income Conversion</option>
                        <option value="TRANSFER_SENT">Sent (P2P)</option>
                        <option value="TRANSFER_RECEIVED">Received (P2P)</option>
                        <option value="WITHDRAWAL">Withdrawal</option>
                        <option value="PACKAGE_ACTIVATION">Package Activation</option>
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
                {error ? (
                    <div className="py-16 text-center bg-red-50">
                        <p className="font-semibold text-red-600">{error}</p>
                        <button onClick={fetchHistory} className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">Retry</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sr. No.</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date & Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Transaction Details</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Amount</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="animate-spin text-indigo-600" size={32} />
                                                <span className="text-sm font-medium text-gray-500">Fetching Ledger...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <History size={40} className="text-gray-300" />
                                                <span className="text-sm font-medium text-gray-500">No Transactions Found</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((tx, idx) => (
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
                                                    <div className={`p-2 rounded-lg shrink-0 ${tx.transactionType === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                        {tx.transactionType === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                                                            {formatType(tx.type)}
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-500 mt-0.5 line-clamp-1 max-w-xs">
                                                            {tx.description}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <span className={`text-base font-bold ${tx.transactionType === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {tx.transactionType === 'credit' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                                </span>
                                            </td>

                                            {/* Running Balance */}
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                                                    ${tx.runningBalance.toFixed(2)}
                                                </span>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 📑 PAGINATION CONTROLS */}
            {!loading && !error && filtered.length > entriesPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                    <button 
                        onClick={handlePrev} 
                        disabled={currentPage === 1} 
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Previous
                    </button>
                    
                    <span className="text-sm font-medium text-gray-600">
                        Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length}
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

export default WalletHistory;