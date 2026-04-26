import React from 'react';
import { Wallet } from 'lucide-react';

const BalanceCard = ({ user }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-md relative overflow-hidden h-full">
      {/* Background Decorative Element */}
      <div className="absolute -right-6 -top-6 bg-white/10 w-24 h-24 rounded-full blur-xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center z-10 relative">
        <div>
          <p className="text-blue-200 font-medium text-sm flex items-center mb-1">
            <Wallet size={16} className="mr-2" /> Main Balance
          </p>
          <h3 className="text-4xl font-black">${(user?.walletBalance || 0).toFixed(2)}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${user?.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {user?.isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>
    </div>
  );
};

export default BalanceCard;