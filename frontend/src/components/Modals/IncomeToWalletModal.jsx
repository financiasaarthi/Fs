import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; 
import { X, Wallet, Lock, ArrowRightLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import SuccessModal from '../SuccessModal'; 

const IncomeToWalletModal = ({ isOpen, onClose }) => {
    const { user, updateUser, token } = useAuth(); 

    const [amounts, setAmounts] = useState({});
    const [transactionPassword, setTransactionPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

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
        
        if (!user || !user.userId) return setError("Session expired. Please login.");

        // 🟢 FIX: Minimum $10 Transfer Condition (Sirf ye rakha hai)
        if (totalSelected < 10) {
            return setError("Minimum transfer amount is $10.");
        }

        setLoading(true); 
        setError(''); 

        const items = Object.entries(amounts)
            .filter(([_, val]) => Number(val) > 0)
            .map(([id, val]) => ({ source: id, amount: Number(val) }));

        if (items.length === 0) {
            setError("Please enter an amount to transfer.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post('/api/user/income-to-wallet', {
                userId: user.userId,
                items,
                transactionPassword
            }, {
                headers: { Authorization: `Bearer ${token}` } 
            });

            if (res.data.user) {
                updateUser(res.data.user);
            }

            setReceiptData({
                total: totalSelected.toFixed(2),
                breakdown: items,
                walletLabels: walletOptions.reduce((acc, w) => ({...acc, [w.id]: w.label}), {}),
                date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            });

            setIsSuccessOpen(true);
            
        } catch (err) {
            setError(err.response?.data?.message || "Transfer failed.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => { 
        setAmounts({}); 
        setTransactionPassword(''); 
        setError(''); 
    };

    const handleSuccessConfirm = () => {
        setIsSuccessOpen(false);
        reset();
        onClose(); 
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 border-t-4 border-t-emerald-50 animate-in zoom-in duration-200 relative max-h-[90vh] flex flex-col">
                    
                    <div className="p-6 flex justify-between items-center border-b border-gray-50 bg-gray-50/50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shadow-sm">
                                <ArrowRightLeft size={22} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Convert Funds</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Move Income to Wallet</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="bg-white hover:bg-gray-100 text-gray-400 p-2 rounded-full transition-all active:scale-90 shadow-sm border border-gray-100">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scroll space-y-5 bg-gray-50/30">
                        
                        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4 rounded-2xl mb-2 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-2">
                                <Wallet size={18} className="text-emerald-600" />
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Main Wallet</span>
                            </div>
                            <span className="text-2xl font-black text-emerald-600">
                                ${(user?.wallets?.mainBalance || user?.walletBalance || 0).toFixed(2)}
                            </span>
                        </div>

                        {error && (
                            <div className="p-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-start gap-2 border bg-red-50 text-red-600 border-red-100 animate-pulse">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleTransfer} className="space-y-4">
                            
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Select Income Sources</label>
                                {walletOptions.map((w) => (
                                    <div key={w.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:border-emerald-200 transition-colors group">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">{w.label}</p>
                                            <p className="text-sm font-black text-gray-800">${w.balance.toFixed(2)}</p>
                                        </div>
                                        <div className="relative w-32">
                                            <input 
                                                type="number" 
                                                min="0"
                                                max={w.balance}
                                                step="0.01"
                                                placeholder="0.00" 
                                                value={amounts[w.id] || ''}
                                                onChange={(e) => setAmounts({...amounts, [w.id]: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-black text-right outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-inner transition-all placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 space-y-4 border-t border-gray-100 mt-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest ml-1">Security Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                                        <input 
                                            type="password" 
                                            required 
                                            placeholder="Enter Password" 
                                            value={transactionPassword}
                                            onChange={(e) => setTransactionPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-black text-sm bg-white shadow-inner transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="sticky bottom-0 pt-2 pb-2 bg-gray-50/30">
                                    <button 
                                        type="submit" 
                                        disabled={loading || totalSelected < 10}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                        {loading ? "Processing..." : `Convert $${totalSelected.toFixed(2)}`}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* SUCCESS MODAL */}
            <SuccessModal
                isOpen={isSuccessOpen}
                title="Conversion Successful!"
                message="Your income has been successfully moved to the Main Wallet."
                btnText="AWESOME"
                type="success"
                onConfirm={handleSuccessConfirm}
            >
                {receiptData && (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3 text-left shadow-sm">
                    <div className="mb-4">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 border-b border-gray-200 pb-1">Fund Breakdown</p>
                        <div className="space-y-1.5">
                            {receiptData.breakdown.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-600">{receiptData.walletLabels[item.source]}</span>
                                    <span className="font-black text-gray-800">${item.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Moved</span>
                        <span className="font-black text-emerald-600 text-xl">+${receiptData.total}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-3 mt-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Date</span>
                        <span className="font-bold text-gray-500 text-[10px] uppercase">{receiptData.date}</span>
                    </div>
                </div>
                )}
            </SuccessModal>
        </>
    );
};

export default IncomeToWalletModal;