import React, { useState } from 'react';
import axios from 'axios';
import { PlusCircle, X, DollarSign, CheckCircle2 } from 'lucide-react';

const DepositModal = ({ isOpen, onClose, user, setUser }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🟢 FIX 1 & 2: 'response' ko 'res' kar diya, aur 'depositAmount' ko 'amount' kar diya
      const res = await axios.post('http://localhost:5000/api/users/add-demo-fund', {
        userId: user.userId, 
        amount: amount 
      });
      
      setSuccess(`Successfully added $${amount} to your wallet!`);
      
      // Ab ye 'res' properly read ho jayega
      if (setUser && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      
      setTimeout(() => { onClose(); setAmount(''); setSuccess(''); }, 2000);
    } catch (error) {
      console.error("Deposit Error Details:", error); // 🟢 FIX 3: Asli error console me dikhega
      alert(error.response?.data?.message || "Deposit failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center"><PlusCircle size={20} className="mr-2" /> Add Funds</h2>
          <button onClick={onClose} className="hover:text-gray-200"><X size={24} /></button>
        </div>
        <div className="p-6">
          {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center text-sm font-bold"><CheckCircle2 size={16} className="mr-2"/> {success}</div>}
          <form onSubmit={handleDeposit}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Enter Deposit Amount ($)</label>
            <div className="relative mb-6">
              <DollarSign size={20} className="absolute left-4 top-4 text-gray-500" />
              <input 
                type="number" required min="10" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00" className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold outline-none"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition disabled:bg-gray-400">
              {loading ? "Processing..." : "Deposit Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;