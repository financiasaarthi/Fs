import React, { useState, useEffect, useMemo } from 'react';
import { Package, Calendar, CheckCircle, ArrowLeftCircle, RefreshCcw, Zap, User, UserPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function PackageHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // 🟢 BACKUP PLAN: Agar Context (user) dhokha de de, toh direct Local Storage se uthao
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const activeUser = user || localUser; // Jo bhi mil jaye, usey active maan lo

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination & Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const fetchHistory = async () => {
        const currentUserId = activeUser?.userId || activeUser?._id || activeUser?.id; 
        
        if (!currentUserId) {
             console.warn("⚠️ User ID abhi bhi nahi mili...");
             setLoading(false);
             return; 
        }
        
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/user/my-package-history/${currentUserId}`);
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
        const currentUserId = activeUser?.userId || activeUser?._id || activeUser?.id;
        if (currentUserId) {
            fetchHistory();
        } else {
            setLoading(false); 
        }
    }, [user]);

    // Helper: Package ke benefits dikhane ke liye
    const getPackageInfo = (amount) => {
        if (amount >= 100) return { tasks: 30, cap: '3x' };
        if (amount >= 50) return { tasks: 20, cap: '2.5x' };
        return { tasks: 10, cap: '2x' };
    };

    // 🔥 SEARCH LOGIC
    const filteredHistory = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return history.filter(item => {
            const amountStr = item.amount?.toString() || '';
            const descStr = item.description?.toLowerCase() || '';
            const toUserStr = item.toUserId?.toString().toLowerCase() || '';
            const fromUserStr = item.fromUserId?.toString().toLowerCase() || '';
            return amountStr.includes(s) || descStr.includes(s) || toUserStr.includes(s) || fromUserStr.includes(s);
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
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 uppercase tracking-tight">Activation Records</h2>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">History of your investments & gifts</p>
                    </div>
                </div>

                <button 
                    onClick={fetchHistory}
                    disabled={loading}
                    className={`flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-md text-sm font-semibold hover:bg-indigo-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
                </button>
            </div>

            {/* 🔍 SEARCH & FILTERS */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by User ID, Amount or Description..."
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
                    <option value={20}>Show 20</option>
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
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Package Details</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Transaction Info</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm font-medium text-gray-500">Fetching Records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Package size={40} className="text-gray-300" />
                                                <span className="text-sm font-medium text-gray-500">No Packages Found</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((item, idx) => {
                                        const info = getPackageInfo(item.amount);
                                        const isGiftedToOthers = item.type === 'PACKAGE_BUY';
                                        const currentUserId = activeUser?.userId || activeUser?._id || activeUser?.id;
                                        const isReceivedFromOthers = item.type === 'PACKAGE_ACTIVATION' && item.fromUserId && item.fromUserId !== currentUserId;
                                        
                                        return (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                
                                                {/* Sr. No. */}
                                                <td className="px-4 py-3 text-sm text-gray-500 font-medium whitespace-nowrap">
                                                    {indexOfFirst + idx + 1}
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {new Date(item.createdAt).toLocaleDateString('en-GB')}
                                                    </div>
                                                </td>

                                                {/* Package Details */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${isGiftedToOthers ? 'bg-blue-500' : isReceivedFromOthers ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                                                                {isGiftedToOthers ? 'Gifted to Friend' : isReceivedFromOthers ? 'Received as Gift' : 'Self Purchase'}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-500 mt-1">
                                                            {info.tasks} Tasks/Day • {info.cap} Capping
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Transaction Info (To/From) */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {isGiftedToOthers ? (
                                                        <div className="flex items-center gap-1.5 text-blue-700 text-sm font-bold bg-blue-50 px-2.5 py-1 rounded-md w-fit border border-blue-100">
                                                            <UserPlus size={14} /> ID: {item.toUserId || item.description?.match(/\d+/)?.[0] || 'Unknown'}
                                                        </div>
                                                    ) : isReceivedFromOthers ? (
                                                        <div className="flex items-center gap-1.5 text-purple-700 text-sm font-bold bg-purple-50 px-2.5 py-1 rounded-md w-fit border border-purple-100">
                                                            <User size={14} /> ID: {item.fromUserId || item.description?.match(/\d+/)?.[0] || 'Unknown'}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-emerald-700 text-sm font-bold bg-emerald-50 px-2.5 py-1 rounded-md w-fit border border-emerald-100">
                                                            <CheckCircle size={14} /> Self Account
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Amount */}
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <span className={`text-sm sm:text-base font-bold px-2.5 py-1 rounded-lg ${isGiftedToOthers ? 'text-red-600 bg-red-50 border border-red-100' : 'text-emerald-600 bg-emerald-50 border border-emerald-100'}`}>
                                                        {isGiftedToOthers ? '-' : '+'}${Number(item.amount).toFixed(2)}
                                                    </span>
                                                </td>

                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 📑 PAGINATION CONTROLS */}
            {!loading && !error && filteredHistory.length > entriesPerPage && (
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

export default PackageHistory;