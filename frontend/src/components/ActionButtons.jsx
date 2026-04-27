import React from 'react';
import { PlusCircle, ArrowDownToLine, Send, Package, RefreshCw } from 'lucide-react'; // 🟢 RefreshCw import kiya

const ActionButtons = ({ setModalState }) => {
  const actions = [
    {
      name: 'Deposit',
      icon: <PlusCircle size={18} />,
      color: 'text-blue-600',
      borderColor: 'border-t-blue-500',
      bgLight: 'bg-blue-50/50',
      state: 'deposit'
    },
    {
      name: 'Withdraw',
      icon: <ArrowDownToLine size={18} />,
      color: 'text-rose-600',
      borderColor: 'border-t-rose-500',
      bgLight: 'bg-rose-50/50',
      state: 'withdraw'
    },
    {
      name: 'Transfer',
      icon: <Send size={18} />,
      color: 'text-purple-600',
      borderColor: 'border-t-purple-500',
      bgLight: 'bg-purple-50/50',
      state: 'transfer'
    },
    {
      name: 'Buy Package',
      icon: <Package size={18} />,
      color: 'text-amber-600',
      borderColor: 'border-t-amber-500',
      bgLight: 'bg-amber-50/50',
      state: 'buyPackage'
    },
    // 🟢 5. Naya Convert Button add kiya
    {
      name: 'Income to Wallet',
      icon: <RefreshCw size={18} />,
      color: 'text-emerald-600',
      borderColor: 'border-t-emerald-500',
      bgLight: 'bg-emerald-50/50',
      state: 'incomeToWallet'
    }
  ];

  return (
    // 🟢 Outer Container: White, Compact, and Rounded
    <div className="bg-white p-2 sm:p-4 rounded-3xl shadow-sm border border-gray-100 w-full">
      
      {/* 🟢 Grid Update: 5 columns on PC, 2 on Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
        {actions.map((item, index) => (
          <button 
            key={index} 
            onClick={() => setModalState(prev => ({ ...prev, [item.state]: true }))}
            className={`bg-white p-3 rounded-2xl border border-gray-50 ${item.borderColor} border-t-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center gap-1.5`}
          >
            {/* Icon Box */}
            <div className={`${item.bgLight} ${item.color} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>

            {/* Label: Chota aur Bold */}
            <span className={`font-black text-[10px] sm:text-xs uppercase tracking-widest ${item.color}`}>
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionButtons;