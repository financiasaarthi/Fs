import React, { useState } from 'react';
import api from '../../api/axios';
import { RefreshCw, X, DollarSign, Wallet, AlertCircle, CheckCircle2, Lock, ArrowRightLeft } from 'lucide-react';

const IncomeToWalletModal = ({ isOpen, onClose, user, setUser }) => {
    const [amounts, setAmounts] = useState({});
    const [transactionPassword, setTransactionPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const walletOptions = [
        { id: 'taskIncome', label: 'Task Income', balance: user?.wallets?.taskIncome || 0 },
        { id: 'directIncome', label: 'Direct Income', balance: user?.wallets?.directIncome || 0 },
        { id: 'matchingIncome', label: 'Binary Match', balance: user?.wallets?.matchingIncome || 0 },
        { id: 'rankReward', label: 'Rank Reward', balance: user?.wallets?.rankReward || 0 }
    ];

    const totalSelected = Object.values(amounts).reduce((sum, val) => sum + Number(val || 0), 0);

    const handleTransfer = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess('');

        const items = Object.entries(amounts)
            .filter(([_, val]) => Number(val) > 0)
            .map(([id, val]) => ({ source: id, amount: Number(val) }));

        try {
            const res = await api.post('/user/income-to-wallet', {
                userId: user.userId,
                items,
                transactionPassword
            });

            setSuccess(res.data.message);
            if (setUser) {
                setUser(res.data.user);
                localStorage.setItem('user', JSON.stringify(res.data.user));
            }
            setTimeout(() => { onClose(); reset(); }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Transfer failed.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => { setAmounts({}); setTransactionPassword(''); setError(''); setSuccess(''); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-gray-900 p-6 flex justify-between items-center text-white">
                    <h2 className="text-lg font-black uppercase tracking-widest flex items-center">
                        <ArrowRightLeft size={20} className="mr-2 text-emerald-400" /> Convert to Wallet
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh] bg-gray-50">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-6 flex justify-between items-center shadow-sm">
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Target Wallet Balance</span>
                        <span className="text-2xl font-black text-emerald-600">${(user?.walletBalance || 0).toFixed(2)}</span>
                    </div>

                    <form onSubmit={handleTransfer} className="space-y-4">
                        {walletOptions.map((w) => (
                            <div key={w.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">{w.label}</p>
                                    <p className="text-sm font-black text-gray-800">${w.balance.toFixed(2)}</p>
                                </div>
                                <div className="relative w-32">
                                    <input 
                                        type="number" placeholder="0.00" value={amounts[w.id] || ''}
                                        onChange={(e) => setAmounts({...amounts, [w.id]: e.target.value})}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-right outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 space-y-4">
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-3.5 text-gray-300" />
                                <input 
                                    type="password" required placeholder="Security Password" value={transactionPassword}
                                    onChange={(e) => setTransactionPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 outline-none focus:border-emerald-500 font-bold text-sm"
                                />
                            </div>

                            <button 
                                type="submit" disabled={loading || totalSelected <= 0}
                                className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2"
                            >
                                {loading ? <RefreshCw className="animate-spin" /> : <Wallet size={18} />}
                                {loading ? "Converting..." : `Move $${totalSelected.toFixed(2)} to Main Wallet`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default IncomeToWalletModal;