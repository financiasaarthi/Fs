import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Landmark, X, DollarSign, AlertCircle, CheckCircle2, PlaySquare, Users, Network, Award, Crown, Wallet, Lock, Loader2 } from 'lucide-react';
// 🟢 FIX 1: useAuth import kiya
import { useAuth } from '../../context/AuthContext'; 

const WithdrawModal = ({ isOpen, onClose }) => {
  // 🟢 FIX 2: Props se data hata kar Context se nikala
  const { user, updateUser, token } = useAuth(); 

  const [amounts, setAmounts] = useState({}); 
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAddressMissing = !(user?.walletAddress);

  useEffect(() => {
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
  }, [user]);

  if (!isOpen) return null;

  const walletOptions = [
    { id: 'taskIncome', label: 'Task Income', balance: user?.wallets?.taskIncome || 0, icon: <PlaySquare size={20} className="text-blue-500" /> },
    { id: 'directIncome', label: 'Direct Income', balance: user?.wallets?.directIncome || 0, icon: <Users size={20} className="text-purple-500" /> },
    { id: 'matchingIncome', label: 'Binary Match', balance: user?.wallets?.matchingIncome || 0, icon: <Network size={20} className="text-orange-500" /> },
    { id: 'rankReward', label: 'Rank Reward', balance: user?.wallets?.rankReward || 0, icon: <Award size={20} className="text-red-500" /> },
    { id: 'royaltyIncome', label: 'Global Royalty', balance: user?.wallets?.royaltyIncome || 0, icon: <Crown size={20} className="text-amber-500" /> }
  ];

  const totalAvailable = walletOptions.reduce((acc, curr) => acc + curr.balance, 0);
  const totalRequested = Object.values(amounts).reduce((sum, val) => sum + Number(val || 0), 0);

  const handleAmountChange = (walletId, value) => {
    setAmounts(prev => ({ ...prev, [walletId]: value }));
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 🛡️ Safety Check
    if (!user || !user.userId) {
      setError("User session not found! Please login again.");
      return;
    }

    if (totalRequested < 10) { 
      return setError(`Minimum total withdrawal must be at least $10.`);
    }

    // Balance validation
    for (let wallet of walletOptions) {
      const requestedForWallet = Number(amounts[wallet.id] || 0);
      if (requestedForWallet > wallet.balance) {
        return setError(`Insufficient balance in ${wallet.label}.`);
      }
    }

    if (!walletAddress.trim()) return setError("Please enter your USDT BEP20 Wallet Address.");
    if (!transactionPassword.trim()) return setError("Please enter your Security Password.");

    setLoading(true);

    try {
      const items = Object.entries(amounts)
        .filter(([_, val]) => Number(val) > 0)
        .map(([walletId, val]) => ({
          source: walletId,
          amount: Number(val)
        }));

      // 🟢 API CALL
      const res = await axios.post('/api/user/withdraw', {
        userId: user.userId,
        items: items,
        walletAddress: walletAddress,
        transactionPassword: transactionPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`Successfully requested withdrawal of $${totalRequested.toFixed(2)}.`);
      
      // 🟢 FIX 3: updateUser use karo
      // Isse Dashboard ke stats turant update ho jayenge
      if (res.data.user) {
        updateUser(res.data.user);
      }

      setAmounts({});
      setTransactionPassword('');
      
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed. Please check password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-900 p-5 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg font-bold flex items-center">
            <Landmark size={20} className="mr-2 text-green-400" /> Withdraw Funds
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          
          {/* Total Overview */}
          <div className="bg-green-100 border border-green-200 rounded-xl p-4 mb-6 flex justify-between items-center shadow-sm">
            <span className="text-green-800 font-black uppercase tracking-wide">Total Earnings Available</span>
            <span className="text-3xl font-black text-green-700">${totalAvailable.toFixed(2)}</span>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold flex items-center"><AlertCircle size={18} className="mr-2 shrink-0"/> {error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold flex items-center"><CheckCircle2 size={18} className="mr-2 shrink-0"/> {success}</div>}

          <form onSubmit={handleWithdraw}>
            {/* Security Section */}
            <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4 mb-6">
              <h3 className="text-sm font-black text-gray-800 uppercase border-b pb-2">Security Setup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 flex items-center justify-between mb-1 uppercase">
                    <span>USDT (BEP20) Address</span>
                    {!isAddressMissing && <span className="text-green-600 text-[10px] bg-green-100 px-2 py-0.5 rounded-full">Locked</span>}
                  </label>
                  <div className="relative">
                    <Wallet size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)}
                      disabled={!isAddressMissing} placeholder="Enter BEP20 Address"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg border font-bold text-sm outline-none transition-colors ${
                        !isAddressMissing ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
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

            {/* Inputs */}
            <div className="space-y-4 mb-6">
              {walletOptions.map((wallet) => (
                <div key={wallet.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:w-1/2">
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">{wallet.icon}</div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase leading-tight">{wallet.label}</p>
                        <p className="text-lg font-black text-gray-800">${wallet.balance.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <div className="relative flex-1">
                        <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input 
                          type="number" value={amounts[wallet.id] || ''} 
                          onChange={(e) => handleAmountChange(wallet.id, e.target.value)}
                          placeholder="0.00" step="0.1"
                          className="w-full pl-8 pr-16 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 font-bold text-sm outline-none"
                        />
                        <button type="button" onClick={() => handleAmountChange(wallet.id, wallet.balance)}
                          className="absolute inset-y-1.5 right-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded text-[10px]"
                        >MAX</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Bottom Footer */}
            <div className="sticky bottom-0 pt-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3 px-2">
                <span className="text-sm font-bold text-gray-600 uppercase">Total Selected:</span>
                <span className="text-xl font-black text-blue-700">${totalRequested.toFixed(2)}</span>
              </div>
              <button type="submit" disabled={loading || totalRequested <= 0}
                className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg transition-all text-lg disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : `Withdraw $${totalRequested.toFixed(2)} Now`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;