import React from 'react';
import {
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaWallet,
  FaPiggyBank,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaCheckDouble,
  FaHourglassHalf,
  FaListAlt
} from 'react-icons/fa';

const cardStyle = 'flex items-center gap-4 p-4 rounded-xl shadow-sm bg-white border-l-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md';

const DashboardCards = ({ stats }) => {
  // Agar backend se data aane me delay ho, toh error na aaye isliye empty object fallback
  const safeStats = stats || {};

  const cards = [
    // 👥 USERS SECTION (3 Cards)
    {
      title: 'Total Users',
      value: safeStats.totalUsers || 0,
      icon: <FaUsers className="text-3xl text-blue-500" />,
      border: 'border-blue-500',
    },
    {
      title: 'Today’s Users',
      value: safeStats.todayUsers || 0,
      icon: <FaUserPlus className="text-3xl text-cyan-500" />,
      border: 'border-cyan-500',
    },
    {
      title: 'Paid Users',
      value: safeStats.paidUsers || 0,
      icon: <FaUserCheck className="text-3xl text-emerald-500" />,
      border: 'border-emerald-500',
    },

    // 💰 DEPOSITS SECTION (3 Cards)
    {
      title: 'Total Deposit',
      value: `$${Number(safeStats.totalDeposit || 0).toFixed(2)}`,
      icon: <FaPiggyBank className="text-3xl text-purple-500" />,
      border: 'border-purple-500',
    },
    {
      title: 'Today’s Deposit',
      value: `$${Number(safeStats.todayDeposit || 0).toFixed(2)}`,
      icon: <FaWallet className="text-3xl text-indigo-400" />,
      border: 'border-indigo-400',
    },
    {
      title: 'Today Pending Deposit',
      value: `$${Number(safeStats.pendingDepositToday || 0).toFixed(2)}`,
      icon: <FaHourglassHalf className="text-3xl text-orange-400" />,
      border: 'border-orange-400',
    },

    // 💸 WITHDRAWALS SECTION (5 Cards)
    {
      title: 'Total Withdrawal (All)',
      value: `$${Number(safeStats.totalWithdrawal || 0).toFixed(2)}`,
      icon: <FaListAlt className="text-3xl text-gray-500" />,
      border: 'border-gray-500',
    },
    {
      title: 'Total Approved Withdraw',
      value: `$${Number(safeStats.approvedWithdrawalTotal || 0).toFixed(2)}`,
      icon: <FaCheckCircle className="text-3xl text-teal-500" />,
      border: 'border-teal-500',
    },
    {
      title: 'Today Approved Withdraw',
      value: `$${Number(safeStats.approvedWithdrawalToday || 0).toFixed(2)}`,
      icon: <FaCheckDouble className="text-3xl text-green-500" />,
      border: 'border-green-500',
    },
    {
      title: 'Total Pending Withdraw',
      value: `$${Number(safeStats.pendingWithdrawalTotal || 0).toFixed(2)}`,
      icon: <FaClock className="text-3xl text-red-500" />,
      border: 'border-red-500',
    },
    {
      title: 'Today Pending Withdraw',
      value: `$${Number(safeStats.pendingWithdrawalToday || 0).toFixed(2)}`,
      icon: <FaMoneyBillWave className="text-3xl text-amber-500" />,
      border: 'border-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => (
        <div key={idx} className={`${cardStyle} ${card.border}`}>
          <div className="p-3 bg-slate-50 rounded-full">
            {card.icon}
          </div>
          <div className="flex flex-col">
            <h3 className="text-slate-400 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-1">
              {card.title}
            </h3>
            <p className="text-xl font-black text-slate-800">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;