import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; 
import { History, CheckCircle, Package, PlayCircle, Loader2, Clock, Filter, RefreshCw, SearchX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function TaskHistory() {
  const { user, token } = useAuth();
  const [historyLogs, setHistoryLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localProgress, setLocalProgress] = useState({});

  // 🔎 Filter States
  const [selectedPackage, setSelectedPackage] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // 📦 Package Configuration
  const packagesConfig = {
    10: { name: 'Starter Plan', maxTasks: 2 },
    30: { name: 'Basic Plan', maxTasks: 6 },
    50: { name: 'Pro Plan', maxTasks: 10 },
    100: { name: 'Premium Plan', maxTasks: 20 },
    500: { name: 'VIP Plan', maxTasks: 50 }
  };

  const activePackages = user?.activePackages?.length > 0 
    ? [...user.activePackages].sort((a, b) => a - b) 
    : (user?.currentPackage ? [user.currentPackage] : []);

  // 1️⃣ PROGRESS BAR LOGIC 
  useEffect(() => {
    if (user) {
      let totalDBWatched = user.dailyVideosWatched || 0; 
      let calculatedProgress = {};
      const sortedPackages = [...activePackages].sort((a, b) => a - b);

      sortedPackages.forEach(pkgPrice => {
        const maxForPkg = packagesConfig[pkgPrice]?.maxTasks || 0;
        if (totalDBWatched >= maxForPkg) {
          calculatedProgress[pkgPrice] = maxForPkg;
          totalDBWatched -= maxForPkg; 
        } else {
          calculatedProgress[pkgPrice] = totalDBWatched;
          totalDBWatched = 0; 
        }
      });
      setLocalProgress(calculatedProgress);
    }
  }, [user]);

  // 2️⃣ FETCH DETAILED HISTORY LOGS
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.userId || !token) return;
      try {
        setIsLoading(true);
        const res = await api.get(`/user/task-history/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // API se aayi hui history ko save karo
        setHistoryLogs(res.data.history || []);
      } catch (err) {
        console.error("Failed to fetch task history", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user?.userId, token]);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  // 🟢 EXTRACT UNIQUE PACKAGES FOR DROPDOWN (Filters Out Empty Values)
  const defaultPackages = [
    "$10 Package", "$30 Package", "$50 Package", "$100 Package", "$500 Package", "Daily Ad Task"
  ];
  // DB se aane wale naye package names aur defaults ko combine karke duplicate hata diye
  const uniquePackages = [...new Set([...defaultPackages, ...historyLogs.map(log => log.packageName).filter(Boolean)])];

  // 🟢 BULLETPROOF FILTER LOGIC
  const filteredLogs = historyLogs.filter(log => {
    // 1. Package Match (Case-insensitive & trimmed)
    const logPkg = log.packageName ? log.packageName.toLowerCase().trim() : "";
    const selectedPkg = selectedPackage.toLowerCase().trim();
    
    const matchPackage = selectedPackage === 'All' || logPkg === selectedPkg;

    // 2. Date Match
    let matchDate = true;
    const logDate = new Date(log.createdAt);
    logDate.setHours(0, 0, 0, 0); 

    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (logDate < from) matchDate = false;
    }
    
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(0, 0, 0, 0);
      if (logDate > to) matchDate = false;
    }

    return matchPackage && matchDate;
  });

  // 🟢 RESET FILTERS
  const resetFilters = () => {
    setSelectedPackage('All');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans bg-gray-50 min-h-screen">
      
      {/* 🔵 Header Section */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="bg-blue-600 p-2 sm:p-3 rounded-lg text-white shadow-sm">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Task History
          </h2>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
            Track your daily video views & earnings
          </p>
        </div>
      </div>

      {/* 🟠 PROGRESS BAR SECTION */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-2">
           <PlayCircle size={18} className="text-blue-600" /> Today's Task Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePackages.map((pkgPrice, index) => {
            const config = packagesConfig[pkgPrice];
            const max = config?.maxTasks || 0;
            const watched = localProgress[pkgPrice] || 0;
            const isCompleted = watched >= max;
            const progressPercentage = max > 0 ? (watched / max) * 100 : 0;

            return (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3 transition-all hover:shadow-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package size={16} className={isCompleted ? "text-green-500" : "text-blue-500"} />
                    <span className="font-bold text-gray-800 text-sm uppercase">${pkgPrice} {config?.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${isCompleted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {watched} / {max} Videos
                  </span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2 mt-1 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`} 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🟢 FILTER SECTION */}
      <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          
          {/* Package Select */}
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Filter size={14}/> Package
            </label>
            <select 
              value={selectedPackage} 
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none uppercase font-semibold cursor-pointer"
            >
              <option value="All" className="font-bold text-blue-600">-- ALL PACKAGES --</option>
              {uniquePackages.map((pkg, idx) => (
                <option key={idx} value={pkg}>{pkg}</option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="w-full md:w-1/4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">From Date</label>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none uppercase font-semibold cursor-pointer"
            />
          </div>

          {/* To Date */}
          <div className="w-full md:w-1/4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">To Date</label>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none uppercase font-semibold cursor-pointer"
            />
          </div>

          {/* Reset Button */}
          <div className="w-full md:w-[15%]">
            <button 
              onClick={resetFilters}
              className="w-full flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors"
            >
              <RefreshCw size={16} /> Reset
            </button>
          </div>

        </div>
      </div>

      {/* 🔴 DETAILED HISTORY TABLE SECTION */}
      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-2">
         <Clock size={18} className="text-blue-600" /> Detailed Logs
      </h3>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-16">Sr. No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Package Name</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Reward</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <span className="text-sm font-medium text-gray-500">Fetching Task History...</span>
                    </div>
                  </td>
                </tr>
              ) : historyLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <History size={40} className="text-gray-300" />
                        <span className="text-sm font-medium text-gray-500">No Task Records Found. Complete a task to see it here!</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <SearchX size={40} className="text-gray-300" />
                        <span className="text-sm font-medium text-gray-500">No records match your filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={log._id || index} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Sr. No. */}
                    <td className="px-4 py-3 text-sm font-bold text-gray-500 whitespace-nowrap text-center">
                      {index + 1}
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    
                    {/* Package Name */}
                    <td className="px-4 py-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-200 uppercase">
                        {log.packageName}
                      </span>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center gap-1 text-green-700 font-semibold text-xs bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                        <CheckCircle size={14} className="text-green-600" /> Completed
                      </span>
                    </td>
                    
                    {/* Reward */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="text-sm font-bold text-emerald-600">
                        +${Number(log.reward || 0.10).toFixed(2)}
                      </span>
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default TaskHistory;