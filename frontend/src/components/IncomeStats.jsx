import React from 'react';
import { DollarSign, Zap, Users, TrendingUp, Package } from 'lucide-react';
// 🟢 FIX 1: useAuth import kiya
import { useAuth } from '../context/AuthContext'; 

const IncomeStats = () => {
  // 🟢 FIX 2: Context se user nikala
  const { user } = useAuth();

  // 📊 Stats array ko schema ke hisaab se map kiya
  const stats = [
    {
      name: 'Active Package',
      value: user?.currentPackage || 0,
      icon: <Package size={16} />,
      color: 'text-indigo-600',
      borderColor: 'border-t-indigo-500',
      bgLight: 'bg-indigo-50/50'
    },
    {
      name: 'Total Earned',
      value: user?.wallets?.totalEarned || 0, // Schema: totalEarned
      icon: <DollarSign size={16} />,
      color: 'text-emerald-600',
      borderColor: 'border-t-emerald-500',
      bgLight: 'bg-emerald-50/50'
    },
    {
      name: 'Direct Bonus',
      value: user?.wallets?.directIncome || 0,
      icon: <Users size={16} />,
      color: 'text-blue-600',
      borderColor: 'border-t-blue-500',
      bgLight: 'bg-blue-50/50'
    },
    {
      name: 'Matching Income',
      value: user?.wallets?.matchingIncome || 0,
      icon: <Zap size={16} />,
      color: 'text-purple-600',
      borderColor: 'border-t-purple-500',
      bgLight: 'bg-purple-50/50'
    },
    {
      name: 'Task Income',
      value: user?.wallets?.taskIncome || 0, // Schema: taskIncome
      icon: <TrendingUp size={16} />,
      color: 'text-orange-600',
      borderColor: 'border-t-orange-500',
      bgLight: 'bg-orange-50/50'
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        {stats.map((item, index) => (
          <div 
            key={index} 
            className={`bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 ${item.borderColor} border-t-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group`}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center justify-between w-full mb-1">
                <div className={`${item.bgLight} ${item.color} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-200 group-hover:bg-green-500"></div>
              </div>

              <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {item.name}
              </p>

              <h3 className="text-sm sm:text-base font-black text-gray-800 tracking-tight">
                ${Number(item.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomeStats;