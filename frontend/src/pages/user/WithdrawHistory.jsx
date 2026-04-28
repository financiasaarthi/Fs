import React, { useState, useEffect, useMemo } from 'react';
import api from "../../api/axios"; 
import { ArrowUpCircle, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Search, Calendar, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const WithdrawHistory = () => {
    const { user, token } = useAuth(); 
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Pagination & Search States
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const activeUser = user || JSON.parse(localStorage.getItem("user") || "{}");
            
            if (!activeUser?.userId) {
                setError("User session not found.");
                setLoading(false);
                return;
            }

            const res = await api.get(`/user/withdrawals/${activeUser.userId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            
            setHistory(res.data || []);
            setError("");
        } catch (err) {
            console.error("Withdraw Fetch Error:", err);
            setError("Failed to load cashout records.");
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [user]);

    // 🔥 SEARCH LOGIC
    const filteredHistory = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return history.filter(item => {
            const amountStr = (item.grossAmount || item.gross || item.amount || '').toString();
            const netStr = (item.netAmount || item.net || '').toString();
            const statusStr = (item.status || 'pending').toLowerCase();
            const addressStr = (item.walletAddress || '').toLowerCase();
            return amountStr.includes(s) || netStr.includes(s) || statusStr.includes(s) || addressStr.includes(s);
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

    const getStatusStyles = (status) => {
        const s = status?.toUpperCase() || 'PENDING';
        if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'APPROVED') 
            return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        if (s === 'REJECTED' || s === 'CANCELLED') 
            return 'bg-rose-50 text-rose-600 border-rose-200';
        return 'bg-amber-50 text-amber-600 border-amber-200';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans bg-gray-50 min-h-screen">
            
            {/* 🔵 Header Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 sm:p-4 bg-orange-500 rounded-xl text-white shadow-md shadow-orange-100">
                        <ArrowUpCircle size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 uppercase tracking-tight">Cashout History</h2>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">Your Withdrawal Logs</p>
                    </div>
                </div>

                <button 
                    onClick={fetchWithdrawals}
                    disabled={loading}
                    className={`flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2.5 rounded-lg shadow-sm border border-orange-100 text-sm font-semibold hover:bg-orange-100 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <Clock size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
                </button>
            </div>

            {/* 🔍 SEARCH & FILTERS */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Amount, Address or Status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm sm:text-base text-gray-700 transition-colors"
                    />
                </div>
                <select
                    value={entriesPerPage}
                    onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium outline-none cursor-pointer hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-orange-500"
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
                    <div className="py-16 text-center bg-rose-50">
                        <AlertCircle className="text-rose-500 mx-auto mb-3" size={40} />
                        <p className="font-semibold text-rose-600">{error}</p>
                        <button onClick={fetchWithdrawals} className="mt-4 px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors">Retry</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sr. No.</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date & Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Gross</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Fee</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Net Payable</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Wallet Address</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="animate-spin text-orange-500" size={32} />
                                                <span className="text-sm font-medium text-gray-500">Loading History...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Wallet size={40} className="text-gray-300" />
                                                <span className="text-sm font-medium text-gray-500">No transactions found</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((item, idx) => {
                                        // Calculations based on your logic
                                        const gross = Number(item.grossAmount || item.gross || item.amount || 0);
                                        const fee = Number(item.fee || (gross * 0.10)); 
                                        const net = Number(item.netAmount || item.net || (gross - fee));
                                        const status = item.status || 'pending';

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

                                                {/* Gross */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-gray-600">${gross.toFixed(2)}</span>
                                                </td>

                                                {/* Fee */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-rose-500">-${fee.toFixed(2)}</span>
                                                </td>

                                                {/* Net Payable */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-base font-bold text-emerald-600">${net.toFixed(2)}</span>
                                                </td>

                                                {/* Wallet Address */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <code className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-semibold text-gray-600 border border-gray-200">
                                                            {item.walletAddress ? `${item.walletAddress.substring(0, 6)}...${item.walletAddress.slice(-4)}` : 'N/A'}
                                                        </code>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusStyles(status)}`}>
                                                        {status.toUpperCase() === 'PENDING' ? <Clock size={14} /> : 
                                                         (status.toUpperCase() === 'SUCCESS' || status.toUpperCase() === 'APPROVED' || status.toUpperCase() === 'COMPLETED') ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                        <span>{status}</span>
                                                    </div>
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
};

export default WithdrawHistory;