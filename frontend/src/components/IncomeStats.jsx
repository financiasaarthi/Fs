import React, { useState, useEffect } from 'react';
import { DollarSign, Zap, Users, TrendingUp, Package, Award, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 
import api from '../api/axios'; // 🟢 Vite error se bachne ke liye apna API instance use kiya

const IncomeStats = () => {
  const { user } = useAuth();
  
  // 🟢 Naya state total system users ke liye
  const [totalSystemUsers, setTotalSystemUsers] = useState(0);

  // 🟢 Backend se total users fetch karne ka logic (using axios/api)
  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        // Base URL ki zarurat nahi, api.js khud handle kar lega
        const response = await api.get('/users/total-users'); 
        
        if (response.data && response.data.success) {
          setTotalSystemUsers(response.data.totalUsers);
        } else if (response.data && response.data.totalUsers !== undefined) {
          // Agar aapka backend direct object bhejta hai
          setTotalSystemUsers(response.data.totalUsers);
        }
      } catch (error) {
        console.error("Error fetching total users:", error);
      }
    };
    
    fetchTotalUsers();
  }, []);

  // 📊 Stats array
  const stats = [
    {
      name: 'Total System Users',
      value: totalSystemUsers, // Database se aayi hui value
      icon: <Globe size={16} />,
      color: 'text-teal-600',
      borderColor: 'border-t-teal-500',
      bgLight: 'bg-teal-50/50',
      isCurrency: false // 🔴 Yahan false rakha hai taaki user count me $ na aaye
    },
    {
      name: 'Active Package',
      value: user?.currentPackage || 0,
      icon: <Package size={16} />,
      color: 'text-indigo-600',
      borderColor: 'border-t-indigo-500',
      bgLight: 'bg-indigo-50/50',
      isCurrency: true
    },
    {
      name: 'Total Earned',
      value: user?.wallets?.totalEarned || 0,
      icon: <DollarSign size={16} />,
      color: 'text-emerald-600',
      borderColor: 'border-t-emerald-500',
      bgLight: 'bg-emerald-50/50',
      isCurrency: true
    },
    {
      name: 'Direct Bonus',
      value: user?.wallets?.totalDirectIncome || user?.wallets?.directIncome || 0,
      icon: <Users size={16} />,
      color: 'text-blue-600',
      borderColor: 'border-t-blue-500',
      bgLight: 'bg-blue-50/50',
      isCurrency: true
    },
    {
      name: 'Matching Income',
      value: user?.wallets?.totalMatchingIncome || user?.wallets?.matchingIncome || 0,
      icon: <Zap size={16} />,
      color: 'text-purple-600',
      borderColor: 'border-t-purple-500',
      bgLight: 'bg-purple-50/50',
      isCurrency: true
    },
    {
      name: 'Task Income',
      value: user?.wallets?.totalTaskIncome || user?.wallets?.taskIncome || 0,
      icon: <TrendingUp size={16} />,
      color: 'text-orange-600',
      borderColor: 'border-t-orange-500',
      bgLight: 'bg-orange-50/50',
      isCurrency: true
    },
    {
      name: 'Rank Reward Income',
      value: user?.wallets?.totalRankReward || user?.wallets?.rankReward || 0,
      icon: <Award size={16} />,
      color: 'text-rose-600',
      borderColor: 'border-t-rose-500',
      bgLight: 'bg-rose-50/50',
      isCurrency: true
    }
  ];

  return (
    <div className="w-full">
      {/* 🟢 Grid cols update kiye taaki 7 boxes fit ho jayein (lg me 4 aur xl me 7) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-4">
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
                {/* 🟢 Yahan logic lagaya hai, isCurrency true hoga toh $ aayega, false pe nahi */}
                {item.isCurrency ? '$' : ''}
                {Number(item.value).toLocaleString(undefined, { 
                  minimumFractionDigits: item.isCurrency ? 2 : 0, 
                  maximumFractionDigits: item.isCurrency ? 2 : 0 
                })}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomeStats;