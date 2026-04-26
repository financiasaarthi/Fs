import React, { useEffect, useState } from 'react';
import api from "../../api/axios";
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// 🟢 Naye packages ke hisaab se array
const packages = [10, 30, 50, 100, 500];

const TotalTopUpPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchId, setSearchId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // FETCH DATA
  useEffect(() => {
    const fetchPackageHistory = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        // 🟢 Naya API route jo transactions nikalega
        const res = await api.get('/admin/all-package-history', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Backend se sirf PACKAGE_ACTIVATION bhejna theek rahega
        setTransactions(res.data || []);
      } catch (err) {
        console.error("Fetch Package History Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageHistory();
  }, []);

  // FILTER
  useEffect(() => {
    const filtered = transactions.filter((tx) => {
      const matchesId = searchId
        ? String(tx.userId).includes(searchId) || String(tx.fromUserId).includes(searchId)
        : true;

      const matchesPlan = selectedPlan
        ? Number(tx.amount) === Number(selectedPlan)
        : true;

      const date = tx.createdAt ? new Date(tx.createdAt) : null;

      const matchesFrom = fromDate
        ? date && date >= new Date(fromDate)
        : true;

      const matchesTo = toDate
        ? date && date <= new Date(toDate)
        : true;

      return matchesId && matchesPlan && matchesFrom && matchesTo;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to page 1
  }, [searchId, selectedPlan, fromDate, toDate, transactions]);

  // STATS Calculation
  const today = new Date().toISOString().split('T')[0];

  const todayActivations = filteredTransactions.filter((tx) => {
    const date = tx.createdAt ? new Date(tx.createdAt) : null;
    return date && date.toISOString().split('T')[0] === today;
  });

  const todayBusiness = todayActivations.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalBusiness = filteredTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalActivations = filteredTransactions.length; // Number of packages sold

  // Plan wise counting
  const planCount = {};
  packages.forEach((pkg) => {
    planCount[pkg] = filteredTransactions.filter((tx) => Number(tx.amount) === pkg).length;
  });

  // Dynamic Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // CSV EXPORT
  const exportToCSV = () => {
    const summary = [
      { Metric: 'Total Business', Value: totalBusiness },
      { Metric: 'Total Activations', Value: totalActivations },
      { Metric: 'Today Activations', Value: todayActivations.length },
      { Metric: 'Today Business', Value: todayBusiness },
    ];

    packages.forEach((pkg) => {
      summary.push({ Metric: `Plan $${pkg}`, Value: planCount[pkg] });
    });

    const table = filteredTransactions.map((tx, i) => ({
      SNo: i + 1,
      UserID: tx.userId,
      ActivatedBy: tx.fromUserId || 'Self',
      Amount: Number(tx.amount),
      Status: tx.status,
      Date: tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '',
    }));

    const csv = Papa.unparse(summary) + '\n\n' + Papa.unparse(table);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `activation-report-${Date.now()}.csv`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">📦 Package Activation Report</h2>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search Target or Buyer ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="px-4 py-2 border rounded w-full md:flex-1 shadow-sm"
        />

        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="px-4 py-2 border rounded w-full md:flex-1 shadow-sm"
        >
          <option value="">All Packages</option>
          {packages.map((p) => (
            <option key={p} value={p}>${p} Package</option>
          ))}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-4 py-2 border rounded w-full md:flex-1 shadow-sm text-gray-600"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-4 py-2 border rounded w-full md:flex-1 shadow-sm text-gray-600"
        />

        <select 
          className="px-4 py-2 border rounded w-full md:w-32 shadow-sm bg-white"
          value={itemsPerPage}
          onChange={handleEntriesChange}
        >
          <option value={10}>Show 10</option>
          <option value={20}>Show 20</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        <SummaryCard label="Total Business" value={`$${totalBusiness}`} color="bg-green-100" />
        <SummaryCard label="Total Activations" value={totalActivations} color="bg-blue-100" />
        <SummaryCard label="Today Activations" value={todayActivations.length} color="bg-yellow-100" />
        <SummaryCard label="Today Business" value={`$${todayBusiness}`} color="bg-orange-100" />

        {packages.map((pkg) => (
          <SummaryCard key={pkg} label={`$${pkg} Sold`} value={planCount[pkg]} color="bg-purple-100" />
        ))}
      </div>

      {/* EXPORT BUTTON */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 font-semibold">Showing {filteredTransactions.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} entries</p>
        <button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2 rounded shadow font-semibold"
        >
          Export CSV
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center p-10 text-gray-500 font-semibold text-lg">Loading Data...</div>
      ) : (
        <div className="overflow-auto border rounded-lg shadow-md bg-white">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">#</th>
                <th className="px-4 py-3 font-semibold text-gray-700">User ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Activated By</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">No records found</td>
                </tr>
              ) : (
                paginatedData.map((tx, i) => (
                  <tr key={tx._id || i} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-600 font-medium">{startIndex + i + 1}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{tx.userId}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">${Number(tx.amount)}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {tx.fromUserId ? (
                         tx.fromUserId === tx.userId ? <span className="text-emerald-500">Self</span> : <span className="text-blue-500">ID: {tx.fromUserId}</span>
                      ) : <span className="text-emerald-500">Self</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded font-semibold ${currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            Previous
          </button>
          <span className="flex items-center font-bold text-gray-700">Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded font-semibold ${currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, color }) => (
  <div className={`${color} p-4 rounded-lg shadow-sm border border-white`}>
    <h4 className="text-gray-600 text-xs font-bold uppercase mb-1">{label}</h4>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

export default TotalTopUpPage;