import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, ArrowLeftCircle, History, Calendar, Wallet, CheckCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function ConvertHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const fetchHistory = async () => {
        const currentUserId = user?.userId || user?._id || user?.id;
        if (!currentUserId) return;

        try {
            setLoading(true);
            const res = await api.get(`/user/convert-history/${currentUserId}`);
            setHistory(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching conversion history:", err);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user]);

    // 🔥 SEARCH LOGIC
    const filteredHistory = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return history.filter(item => {
            const amountStr = item.amount?.toString() || '';
            const statusStr = 'success'; // Since all are assumed success here
            return amountStr.includes(s) || statusStr.includes(s);
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="bg-white border border-gray-200 p-2 sm:p-2.5 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm"
                        title="Back to Dashboard"
                    >
                        <ArrowLeftCircle size={22} />
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 uppercase tracking-tight">Conversion Logs</h2>
                        <p className="text-xs sm:text-sm font-medium text-emerald-600 mt-0.5">Income to Main Wallet History</p>
                    </div>
                </div>

                <button 
                    onClick={fetchHistory}
                    disabled={loading}
                    className={`flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-md text-sm font-semibold hover:bg-emerald-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
                </button>
            </div>

            {/* 🔍 SEARCH & FILTERS */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Amount..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm sm:text-base text-gray-700 transition-colors"
                    />
                </div>
                <select
                    value={entriesPerPage}
                    onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium outline-none cursor-pointer hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-emerald-500"
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Transaction Type</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Amount Added</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium text-gray-500">Fetching Records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <History size={40} className="text-gray-300" />
                                            <span className="text-sm font-medium text-gray-500">No Conversions Found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        
                                        {/* Sr. No. */}
                                        <td className="px-4 py-3 text-sm text-gray-500 font-medium whitespace-nowrap">
                                            {indexOfFirst + idx + 1}
                                        </td>

                                        {/* Date & Time */}
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
                                                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md">
                                                    <Wallet size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">Wallet Credit</span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                                                <CheckCircle size={14} />
                                                <span className="text-xs font-bold uppercase">Success</span>
                                            </div>
                                        </td>

                                        {/* Amount Added */}
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <span className="text-base font-bold text-emerald-600">
                                                +${Number(item.amount).toFixed(2)}
                                            </span>
                                        </td>

                                    </tr>
                                ))
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

export default ConvertHistory;