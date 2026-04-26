import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Papa from "papaparse";
import { saveAs } from "file-saver";

// 🔐 Helper: safely convert Decimal128 / string / number to JS number
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === "number") return Number.isNaN(val) ? 0 : val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.-]/g, "");
    const n = Number(cleaned);
    return Number.isNaN(n) ? 0 : n;
  }
  if (typeof val === "object" && val.$numberDecimal) {
    const n = Number(val.$numberDecimal);
    return Number.isNaN(n) ? 0 : n;
  }
  return Number(val) || 0;
};

const formatAmount = (value, digits = 2) => {
  const n = toNumber(value);
  return n.toFixed(digits);
};

const CreditToWallet = () => {
  const [transactions, setTransactions] = useState([]); 
  const [filtered, setFiltered] = useState([]);        
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);   
  const [itemsPerPage, setItemsPerPage] = useState(10); 

  const [searchUser, setSearchUser] = useState("");   
  const [fromDate, setFromDate] = useState("");       
  const [toDate, setToDate] = useState("");           

  useEffect(() => {
    fetchTransactions();
  }, []);

  /** Fetch all transactions from the backend */
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Admin token not found.");
        setLoading(false);
        return;
      }

      const res = await api.get('/admin/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data || !Array.isArray(res.data)) {
        setTransactions([]);
        setFiltered([]);
        return;
      }

      // 🟢 HAMARA SYSTEM FIX: Filter for 'INCOME_REINVEST' instead of old type
      const walletCredits = res.data
        .filter((tx) => tx.type === "INCOME_REINVEST")
        .map((tx) => ({
          _id: tx._id,
          userId: tx.userId ?? "-",
          name: tx.name ?? "-",
          source: tx.walletType ?? "Multi Wallets", // Humne 'walletType' use kiya tha
          amount: toNumber(tx.amount), 
          description: tx.description && tx.description !== ""
              ? tx.description
              : `Income converted to Main Wallet`,
          type: tx.type,
          createdAt: tx.createdAt ? new Date(tx.createdAt) : new Date(),
        }))
        .sort((a, b) => b.createdAt - a.createdAt); 

      setTransactions(walletCredits);
      setFiltered(walletCredits);
    } catch (err) {
      console.error("Error fetching conversion transactions:", err);
      setError("Error fetching transactions.");
    } finally {
      setLoading(false);
    }
  };

  /** Apply filtering */
  useEffect(() => {
    const filteredTx = transactions.filter((tx) => {
      const lowerSearch = searchUser.toLowerCase();
      const matchUser = searchUser 
        ? tx.userId?.toString().includes(lowerSearch) || tx.name?.toLowerCase().includes(lowerSearch) 
        : true;
      
      const created = new Date(tx.createdAt).setHours(0,0,0,0);
      const from = fromDate ? new Date(fromDate).setHours(0,0,0,0) : null;
      const to = toDate ? new Date(toDate).setHours(0,0,0,0) : null;

      const matchFrom = from ? created >= from : true;
      const matchTo = to ? created <= to : true;

      return matchUser && matchFrom && matchTo;
    });
    setFiltered(filteredTx);
    setCurrentPage(1); 
  }, [searchUser, fromDate, toDate, transactions]);

  /** Pagination calculations */
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const exportToCSV = () => {
    const csvData = filtered.map((tx, i) => ({
      SNo: i + 1,
      UserID: tx.userId,
      Name: tx.name || "-",
      Source: tx.source || "-",
      Amount: formatAmount(tx.amount),
      Type: "INCOME TO WALLET",
      Description: tx.description || "-",
      Date: new Date(tx.createdAt).toLocaleDateString("en-GB"),
      Time: new Date(tx.createdAt).toLocaleTimeString("en-US", { hour12: true }),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `income-conversions-${Date.now()}.csv`);
  };

  const totalAmount = transactions.reduce((sum, tx) => sum + toNumber(tx.amount), 0);
  const filteredTotal = filtered.reduce((sum, tx) => sum + toNumber(tx.amount), 0);

  if (loading) return <div className="p-4 text-center text-gray-600 text-lg animate-pulse">Loading Conversion History...</div>;
  if (error) return <div className="p-4 text-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="p-4 bg-white min-h-screen">
      <h2 className="text-xl font-black mb-4 text-emerald-600 uppercase tracking-tight">🔄 Income Conversion Logs</h2>

      {/* Totals Summary */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm min-w-[220px]">
          <h4 className="text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-1">Total Re-invested</h4>
          <p className="text-3xl font-black text-emerald-600">${formatAmount(totalAmount)}</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl shadow-sm min-w-[220px]">
          <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Filtered Total</h4>
          <p className="text-3xl font-black text-gray-800">${formatAmount(filteredTotal)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <input
            type="text"
            className="border border-gray-200 rounded-xl px-4 py-2.5 w-full md:w-64 outline-none focus:border-emerald-500 transition-all font-bold text-sm"
            placeholder="Search User ID or Name..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />

          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-white shadow-sm text-sm font-bold">
            <span className="text-gray-400 uppercase text-[10px]">From:</span>
            <input type="date" className="outline-none" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-white shadow-sm text-sm font-bold">
            <span className="text-gray-400 uppercase text-[10px]">To:</span>
            <input type="date" className="outline-none" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>

          <select
            className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white font-bold text-sm outline-none"
            value={itemsPerPage}
            onChange={handleEntriesChange}
          >
            {[10, 20, 50, 100].map(v => <option key={v} value={v}>Show {v}</option>)}
          </select>
        </div>

        <div className="flex gap-4 items-center justify-between">
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Found: {filtered.length}</span>
          <button
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-100 transition-all text-xs uppercase tracking-widest"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-hidden border border-gray-100 rounded-[2rem] shadow-sm">
        <table className="min-w-full bg-white text-sm text-left">
          <thead className="bg-gray-900 text-white uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">User ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Wallet Type</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-center">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentTransactions.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-20 font-bold text-gray-300 uppercase tracking-widest">No conversion logs found.</td></tr>
            ) : (
              currentTransactions.map((tx, idx) => (
                <tr key={tx._id || idx} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="px-6 py-4 text-gray-400 font-bold">{indexOfFirst + idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-800">{tx.userId}</span>
                      <button onClick={() => handleCopy(tx.userId.toString())} className="text-gray-300 hover:text-emerald-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-600">{tx.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded font-black uppercase">{tx.source.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600 text-lg">${formatAmount(tx.amount)}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs italic">{tx.description}</td>
                  <td className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase">
                    {new Date(tx.createdAt).toLocaleDateString('en-GB')}<br/>
                    {new Date(tx.createdAt).toLocaleTimeString('en-US', { hour12: true })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex justify-between items-center mt-6 px-4">
          <span className="text-[10px] font-black text-gray-400 uppercase">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={handlePrev} disabled={currentPage === 1} className="px-4 py-2 border rounded-xl font-bold text-xs uppercase disabled:opacity-30">Prev</button>
            <button onClick={handleNext} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase disabled:opacity-30">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditToWallet;