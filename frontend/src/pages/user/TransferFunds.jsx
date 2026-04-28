import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownLeft, History, Loader2, Calendar, Wallet, Search, ArrowRightLeft } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function TransferHistory() {
    const { user, token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

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
            setHistory(Array.isArray(res.data) ? res.data : []);
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

    // 🔥 SEARCH LOGIC
    const filteredHistory = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return history.filter(item => {
            const amountStr = item.amount?.toString() || '';
            const partyIdStr = (item.receiverId || item.toUserId || item.senderId || item.fromUserId || '').toString().toLowerCase();
            const typeStr = item.type?.toLowerCase() || '';
            return amountStr.includes(s) || partyIdStr.includes(s) || typeStr.includes(s);
        });
    }, [history, searchTerm]);

    // Reset pagination on search
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    // 📊 PAGINATION LOGIC
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentItems = filteredHistory.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredHistory.length / entriesPerPage) || 1;

    const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans bg-gray-50 min-h-screen">
            
            {/* 🔵 Header Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 sm:p-4 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100">
                        <ArrowRightLeft size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 uppercase tracking-tight">P2P Logs</h2>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">Internal Fund Transfers History</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 bg-indigo-50 px-5 py-3 rounded-xl border border-indigo-100 w-full md:w-auto">
                    <Wallet size={20} className="text-indigo-600" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">My User ID</span>
                        <span className="text-sm font-bold text-indigo-700">{user?.userId || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* 🔍 SEARCH & FILTERS */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by User ID or Amount..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm sm:text-base text-gray-700 transition-colors"
                    />
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

            {/* 📊 Table Container */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sr. No.</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date & Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Transaction Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Transfer Info</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-indigo-600" size={32} />
                                            <span className="text-sm font-medium text-gray-500">Fetching Transactions...</span>
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
                                currentItems.map((item, index) => {
                                    const isSent = item.type === 'TRANSFER_SENT' || item.senderId === user?.userId;

                                    return (
                                        <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
                                            
                                            {/* Sr. No. */}
                                            <td className="px-4 py-3 text-sm text-gray-500 font-medium whitespace-nowrap">
                                                {indexOfFirst + index + 1}
                                            </td>

                                            {/* Date Column */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Calendar size={12} className="text-gray-400" />
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Transaction Type */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-md ${isSent ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        {isSent ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                                                    </div>
                                                    <span className={`text-sm font-bold ${isSent ? 'text-red-600' : 'text-emerald-600'}`}>
                                                        {isSent ? 'Transfer Sent' : 'Fund Received'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Transfer Info (To/From ID) */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-200">
                                                    {isSent ? `To ID: ${item.receiverId || item.toUserId}` : `From ID: ${item.senderId || item.fromUserId}`}
                                                </span>
                                            </td>

                                            {/* Amount Column */}
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <span className={`text-base font-bold ${isSent ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {isSent ? '-' : '+'}${Number(item.amount).toFixed(2)}
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
}

export default TransferHistory;