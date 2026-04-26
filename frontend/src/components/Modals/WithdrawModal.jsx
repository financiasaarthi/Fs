import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Landmark, X, DollarSign, AlertCircle, CheckCircle2, PlaySquare, Users, Network, Award, Crown, Wallet, Lock } from 'lucide-react';

const WithdrawModal = ({ isOpen, onClose, user, setUser }) => {
  // 🟢 State to store inputs for multiple wallets simultaneously
  const [amounts, setAmounts] = useState({}); 
  
  // Security States
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const isAddressMissing = !(user?.walletAddress);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
  }, [user]);

  if (!isOpen) return null;

  // 🧮 Wallet Options Data
  const walletOptions = [
    { id: 'taskIncome', label: 'Task Income', balance: user?.wallets?.taskIncome || 0, icon: <PlaySquare size={20} className="text-blue-500" /> },
    { id: 'directIncome', label: 'Direct Income', balance: user?.wallets?.directIncome || 0, icon: <Users size={20} className="text-purple-500" /> },
    { id: 'matchingIncome', label: 'Binary Match', balance: user?.wallets?.matchingIncome || 0, icon: <Network size={20} className="text-orange-500" /> },
    { id: 'rankReward', label: 'Rank Reward', balance: user?.wallets?.rankReward || 0, icon: <Award size={20} className="text-red-500" /> },
    { id: 'royaltyIncome', label: 'Global Royalty', balance: user?.wallets?.royaltyIncome || 0, icon: <Crown size={20} className="text-amber-500" /> }
  ];

  const totalAvailable = walletOptions.reduce((acc, curr) => acc + curr.balance, 0);

  // Calculate total amount requested across all inputs
  const totalRequested = Object.values(amounts).reduce((sum, val) => sum + Number(val || 0), 0);

  // Handle Input Change for specific wallet
  const handleAmountChange = (walletId, value) => {
    setAmounts(prev => ({ ...prev, [walletId]: value }));
  };

  // 🚀 Main Withdraw Handler (Processes multiple wallets)
 // 🚀 Main Withdraw Handler (Processes multiple wallets AT ONCE)
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 🛡️ Validations
    if (totalRequested < 1) { // Backend checking 10
      return setError(`Minimum total withdrawal must be at least $10.`);
    }

    // Check individual balances locally first
    for (let wallet of walletOptions) {
      const requestedForWallet = Number(amounts[wallet.id] || 0);
      if (requestedForWallet > wallet.balance) {
        return setError(`Insufficient balance in ${wallet.label}.`);
      }
    }

    if (!walletAddress.trim()) {
      return setError("Please enter your USDT BEP20 Wallet Address.");
    }
    if (!transactionPassword.trim()) {
      return setError("Please enter your Security Password.");
    }

    setLoading(true);

    try {
      // 🟢 Identify active user
      const currentUserId = user?.userId || user?._id || user?.id;
      if (!currentUserId) {
          setError("User ID not found! Please login again.");
          setLoading(false);
          return;
      }

      // 🟢 Filter items to send only those with amounts > 0
      const items = Object.entries(amounts)
        .filter(([_, val]) => Number(val) > 0)
        .map(([walletId, val]) => ({
          source: walletId,
          amount: Number(val)
        }));

      // 🟢 SINGLE API CALL for all wallets
     // WithdrawModal.jsx mein bas ye ensure karna:
const res = await axios.post('http://localhost:5000/api/user/withdraw', {
    userId: currentUserId,
    items: items, // Array of {source, amount}
    walletAddress: walletAddress,
    transactionPassword: transactionPassword
});
      
      const latestUserData = res.data.user; 
      
      setSuccess(`Successfully requested withdrawal of $${totalRequested.toFixed(2)}.`);
      
      if (setUser && latestUserData) {
        setUser(latestUserData);
        localStorage.setItem('user', JSON.stringify(latestUserData));
      }

      // Reset
      setAmounts({});
      setTransactionPassword('');
      
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed. Please check password and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-5 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg font-bold flex items-center">
            <Landmark size={20} className="mr-2 text-green-400" /> Withdraw Funds
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto custom-scroll flex-1 bg-gray-50">
          
          {/* Total Overview */}
          <div className="bg-green-100 border border-green-200 rounded-xl p-4 mb-6 flex justify-between items-center shadow-sm">
            <span className="text-green-800 font-black uppercase tracking-wide flex items-center">
               Total Earnings Available
            </span>
            <span className="text-3xl font-black text-green-700">${totalAvailable.toFixed(2)}</span>
          </div>

          {/* Alerts */}
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold flex items-center shadow-sm"><AlertCircle size={18} className="mr-2 shrink-0"/> {error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold flex items-center shadow-sm"><CheckCircle2 size={18} className="mr-2 shrink-0"/> {success}</div>}

          <form onSubmit={handleWithdraw}>
            {/* 🟢 WALLET ADDRESS & SECURITY */}
            <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4 mb-6">
              <h3 className="text-sm font-black text-gray-800 uppercase border-b pb-2">Security Setup (Required)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 flex items-center justify-between mb-1 uppercase">
                    <span>USDT (BEP20) Address</span>
                    {!isAddressMissing ? (
                      <span className="text-green-600 text-[10px] bg-green-100 px-2 py-0.5 rounded-full">Locked</span>
                    ) : (
                      <span className="text-amber-500 text-[10px] bg-amber-100 px-2 py-0.5 rounded-full">One-Time Setup</span>
                    )}
                  </label>
                  <div className="relative">
                    <Wallet size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)}
                      disabled={!isAddressMissing} placeholder="Enter BEP20 Address"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg border font-bold text-sm outline-none transition-colors ${
                        !isAddressMissing ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300 focus:border-blue-500 text-gray-800'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Security Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="password" value={transactionPassword} onChange={(e) => setTransactionPassword(e.target.value)}
                      placeholder="Enter Password" required
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 font-bold text-sm text-gray-800 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 🟢 INDIVIDUAL INCOME INPUTS */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-black text-gray-800 uppercase ml-1">Select Amounts to Withdraw</h3>
              
              {walletOptions.map((wallet) => (
                <div key={wallet.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Icon, Name & Balance */}
                    <div className="flex items-center gap-3 md:w-1/2">
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                        {wallet.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase leading-tight">{wallet.label}</p>
                        <p className="text-lg font-black text-gray-800">${wallet.balance.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Right: Input Only (No individual button) */}
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <div className="relative flex-1">
                        <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input 
                          type="number" 
                          value={amounts[wallet.id] || ''} 
                          onChange={(e) => handleAmountChange(wallet.id, e.target.value)}
                          placeholder="0.00" 
                          min="0" step="0.1"
                          className="w-full pl-8 pr-16 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 font-bold text-sm outline-none"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAmountChange(wallet.id, wallet.balance)}
                          className="absolute inset-y-1.5 right-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded text-[10px] transition"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>

            {/* 🟢 SINGLE MASTER WITHDRAW BUTTON */}
            <div className="sticky bottom-0 pt-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3 px-2">
                <span className="text-sm font-bold text-gray-600 uppercase">Total Selected:</span>
                <span className="text-xl font-black text-blue-700">${totalRequested.toFixed(2)}</span>
              </div>
              <button 
                type="submit" 
                disabled={loading || totalRequested < 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-black py-4 rounded-xl shadow-lg transition-all text-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed uppercase tracking-wide"
              >
                {loading ? "Processing Transaction..." : `Withdraw $${totalRequested.toFixed(2)} Now`}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;